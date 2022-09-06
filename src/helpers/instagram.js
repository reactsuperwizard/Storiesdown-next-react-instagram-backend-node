import fs from 'fs';
import { IgApiClient } from 'instagram-private-api';
import axios from 'axios';
import HttpsProxyAgent from 'https-proxy-agent';
import UserAgent from 'user-agents';
import cheerio from 'cheerio';
import rp from 'request-promise';
import { promisify } from 'util';
import redisClient from '../helpers/redis-client';
import CryptoJS from 'crypto-js';
const encryptWithAES = (text) => {
  const passphrase = 'javascript';
  return CryptoJS.AES.encrypt(text, passphrase).toString();
};

export async function getIdByScraper(username) {
  try {
    if (username.includes(' ')) {
      return false;
    }
    const p = fs.readFileSync('list-proxies.txt').toString().trim().split('\n');
    let i = Math.floor(Math.random() * p.length);

    const axiosProxy = axios.create({ httpsAgent });
    const searchResponse = await axiosProxy.get(
      'https://gramho.com/search/' + encodeURI(username),
      { headers: { 'User-Agent': new UserAgent().toString() } }
    );
    // console.log(searchResponse.data);
    if (searchResponse.data.includes('"profile-result"') == false) {
      return false;
    }
    const regex = new RegExp('profile/' + username.toLowerCase() + '/(.*)">');
    let matches = searchResponse.data.match(regex);
    if (matches == null) {
      return false;
    } else {
      return matches[1];
    }
  } catch (error) {
    console.log('scrape id:', error.toString());
    return undefined;
  }
}

export async function getStoriesByScraper(id) {
  const p = fs.readFileSync('list-proxies.txt').toString().trim().split('\n');
  let i = Math.floor(Math.random() * p.length);
  try {
    if (id.includes(' ')) {
      return false;
    }
    const httpsAgent = new HttpsProxyAgent(p[i]);

    const axiosProxy = axios.create({ httpsAgent });

    const response = await axiosProxy.get(
      'https://instalkr.com/api/getanonym/' + id,
      {
        headers: {
          'User-Agent': new UserAgent().toString(),
          cookie: 'u_=0e55660ea581abf04a545a8ce1fad390',
        },
      }
    );
    let stories = [];

    if (Array.isArray(response.data.stories)) {
      response.data.forEach((story) => {
        if (story.type === 'video') {
          stories.push({
            taken_at: story.created_at,
            media_type: 2,
            cover_url: story.preview,
            video_url: story.src,
          });
        } else {
          stories.push({
            taken_at: story.created_at,
            media_type: 1,
            image_url: story.src,
          });
        }
      });
    } else {
      return [];
    }
    console.log('stories:', stories.length);
    return stories;
  } catch (error) {
    console.log('scrape stories:', p[i], error.toString());
    return [];
  }
}

export async function getStoriesV2(id, username) {
  const p = fs.readFileSync('list-proxies2.txt').toString().trim().split('\n');
  let i = Math.floor(Math.random() * p.length);
  try {
    if (id.includes(' ')) {
      return false;
    }

    var headers = {
      'User-Agent': new UserAgent().toString(),
      Accept: 'application/json, text/plain, */*',
      'Accept-Language': 'en-US,en;q=0.5',
      'Content-Type': 'application/json',
      Origin: 'https://insta-stories.ru',
      DNT: '1',
      Connection: 'keep-alive',
      Referer: 'https://insta-stories.ru/' + username,
      TE: 'Trailers',
      Cookie: 'lang=en',
    };

    var dataString =
      '{"xtrip":"dwsefi4k5fzbn54m","id":"' +
      id +
      '","username":"' +
      username +
      '"}';
    // console.log(dataString);

    var options = {
      url: 'https://insta-stories.ru/api/stories',
      method: 'POST',
      headers: headers,
      body: dataString,
      resolveWithFullResponse: true,
    };
    const response = await rp.defaults({
      proxy: p[i],
    })(options);
    const data = JSON.parse(response.body);

    let stories = [];

    if (Array.isArray(data)) {
      data.forEach((story) => {
        if (story.is_video) {
          stories.push({
            taken_at: story.timestamp,
            media_type: 2,
            cover_url: story.image,
            video_url: story.video,
          });
        } else {
          stories.push({
            taken_at: story.timestamp,
            media_type: 1,
            image_url: story.image,
          });
        }
      });
    } else {
      return [];
    }
    console.log('stories:', stories.length, new Date());
    return stories;
  } catch (error) {
    console.log('scrape stories:', p[i], error.toString());
    return [];
  }
}

export async function getStoriesV3(id, username) {
  const p = fs.readFileSync('list-proxies2.txt').toString().trim().split('\n');
  let i = Math.floor(Math.random() * p.length);
  try {
    if (id.includes(' ')) {
      return false;
    }

    var headers = {
      'User-Agent': new UserAgent().toString(),
      Connection: 'keep-alive',
      Accept: '*/*',
      'X-Requested-With': 'XMLHttpRequest',
      'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
      Origin: 'https://www.picuki.com',
      'Sec-Fetch-Site': 'same-origin',
      'Sec-Fetch-Mode': 'cors',
      'Sec-Fetch-Dest': 'empty',
      Referer: 'https://www.picuki.com/profile/' + username,
      'Accept-Language': 'en-US,en;q=0.9',
    };

    var dataString = 'query=' + id + '&type=story';

    var options = {
      url: 'https://www.picuki.com/app/controllers/ajax.php',
      method: 'POST',
      headers: headers,
      body: dataString,
      resolveWithFullResponse: true,
    };
    const response = await rp.defaults({
      proxy: p[i],
    })(options);
    const data = JSON.parse(response.body);
    let stories = [];

    if (data.stories_container) {
      const $ = cheerio.load(data.stories_container);
      $('.item').each((index, story) => {
        if (
          $(story).find('.launchLightbox').attr('data-post-type') == 'video'
        ) {
          stories.push({
            taken_at: $(story).find('.stories_count').text().trim(),
            media_type: 2,
            cover_url: $(story)
              .find('.stories_background')
              .attr('style')
              .split('url(')[1]
              .slice(0, -1),
            video_url: $(story).find('.launchLightbox').attr('href'),
          });
        } else {
          stories.push({
            taken_at: $(story).find('.stories_count').text().trim(),
            media_type: 1,
            image_url: $(story).find('.launchLightbox').attr('href'),
          });
        }
      });
    } else {
      return [];
    }
    console.log('stories:', stories.length, new Date());
    return stories;
  } catch (error) {
    console.log('scrape stories:', p[i]);
    return [];
  }
}

export async function getStoriesV4(id, username) {
  for (let j = 0; j < 5; j++) {
    const p = fs
      .readFileSync('list-proxies2.txt')
      .toString()
      .trim()
      .split('\n');
    let i = Math.floor(Math.random() * p.length);
    try {
      if (id.includes(' ')) {
        return false;
      }

      var headers = {
        authority: 'smihub.com',
        accept: '*/*',
        'x-requested-with': 'XMLHttpRequest',
        'sec-ch-ua-mobile': '?0',
        'user-agent': new UserAgent().toString(),
        'sec-fetch-site': 'same-origin',
        'sec-fetch-mode': 'cors',
        'sec-fetch-dest': 'empty',
        referer: 'https://smihub.com/v/' + username,
        'accept-language': 'en-US,en;q=0.9',
      };

      var options = {
        url: 'https://smihub.com/api/profile/' + id + '/stories',
        method: 'GET',
        headers: headers,
        resolveWithFullResponse: true,
      };
      const response = await rp.defaults({
        // proxy: p[i],
        proxy: p[i],
      })(options);
      let stories = [];
      const $ = cheerio.load(response.body);
      // console.log(response);
      let items = [];
      $('.item').each((index, item) => {
        items.push($(item).find('.stories-time').text().trim());
      });
      $('.carousel-item').each((index, story) => {
        if ($(story).find('video').length > 0) {
          stories.push({
            taken_at: items[index],
            media_type: 2,
            cover_url:
              'https://cdn' +
              ['', '2', '3'][Math.floor(Math.random() * 3)] +
              '.storiesdown.com/images/?url=' +
              encodeURIComponent(
                decodeURIComponent(
                  $(story).find('video').attr('poster').split('q=')[1]
                )
                  .split('')
                  .reverse()
                  .join('')
              ),
            // video_url: $(story).attr('data-src'),

            video_url:
              'https://cdn' +
              ['', '2', '3'][Math.floor(Math.random() * 3)] +
              '.storiesdown.com/videos/?url=' +
              encodeURIComponent(
                Buffer.from($(story).attr('data-src')).toString('base64')
              ),
          });
        } else {
          stories.push({
            taken_at: items[index],
            media_type: 1,
            image_url:
              'https://cdn' +
              ['', '2', '3'][Math.floor(Math.random() * 3)] +
              '.storiesdown.com/images/?url=' +
              encodeURIComponent(
                Buffer.from($(story).attr('data-src')).toString('base64')
              ),
          });
        }
      });
      console.log('stories:', stories.length, new Date());
      return stories;
    } catch (error) {
      // console.log(error);
      if (j == 4) {
        console.log('scrape stories:', p[i]);
        return [];
      }
    }
  }
}

function getStrBetween(str, a, b) {
  const p = str.indexOf(a) + a.length;
  return str.substring(p, str.indexOf(b, p));
}

export async function getStoriesV52(id, username) {
  let port = 3333;
  const p = ['http://134.209.168.7:50000'];

  let i = Math.floor(Math.random() * p.length);

  try {
    let userAgent = new UserAgent().toString();
    let headers = {
      'user-agent': userAgent,
      accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      referer: 'https://instasaved.net/',
    };

    let options = {
      url: 'https://instasaved.net/en/save-stories/' + username,
      headers: headers,
      resolveWithFullResponse: true,
    };

    let response = await rp.defaults({
      proxy: p[i],
    })(options);

    headers = {
      'user-agent': userAgent,
      'x-requested-with': 'XMLHttpRequest',
      'x-xsrf-token': decodeURIComponent(
        getStrBetween(
          response.headers['set-cookie'].join(';'),
          'XSRF-TOKEN=',
          ';'
        )
      ),
      'x-ws-token': getStrBetween(response.body, '<body data-wsid="', '"'),
      'content-type': 'application/json;charset=utf-8',
      accept: 'application/json, text/plain, */*',
      referer: 'https://instasaved.net/en/save-stories/' + username,
      cookie: response.headers['set-cookie']
        .map((cookie) => cookie.split(';')[0])
        .join(';'),
    };
    const repcaptcha = await axios(
      `http://localhost:${port}?username=${username}`
    );
    if (repcaptcha.data == 'error') {
      console.log('scrape repcaptcha:', p[i]);
      return [];
    }
    let dataString =
      '{"recaptcha":"' +
      repcaptcha.data +
      '","cursor":1,"igtv_ids":[],"type":"story","username":"https://instagram.com/' +
      username +
      '","token":"' +
      getStrBetween(response.body, 'id="token" value="', '"') +
      '"}';

    options = {
      url: 'https://instasaved.net/ajax-instasaver',
      method: 'POST',
      headers: headers,
      body: dataString,
      resolveWithFullResponse: true,
    };
    response = await rp.defaults({
      proxy: p[i],
    })(options);
    const json = JSON.parse(response.body);
    let stories = [];
    for (let story of json.medias) {
      if (story.type == 'video') {
        stories.push({
          media_type: 2,
          cover_url:
            'https://cdn' +
            ['', '2', '3'][Math.floor(Math.random() * 3)] +
            '.storiesdown.com/images/?url=' +
            encodeURIComponent(Buffer.from(story.preview).toString('base64')),
          video_url:
            'https://cdn' +
            ['', '2', '3'][Math.floor(Math.random() * 3)] +
            '.storiesdown.com/videos/?url=' +
            encodeURIComponent(Buffer.from(story.url).toString('base64')),
        });
      } else {
        stories.push({
          media_type: 1,
          image_url:
            'https://cdn' +
            ['', '2', '3'][Math.floor(Math.random() * 3)] +
            '.storiesdown.com/images/?url=' +
            encodeURIComponent(Buffer.from(story.url).toString('base64')),
        });
      }
    }
    console.log('stories:', port, stories.length, new Date());
    return stories;
  } catch (error) {
    // console.error(error);
    console.log('scrape stories:', port, p[i]);
    return [];
  }
}

export async function getStoriesV5(id, username) {
  const p = fs.readFileSync('list-proxies2.txt').toString().trim().split('\n');
  let i = Math.floor(Math.random() * p.length);
  try {
    let userAgent = new UserAgent().toString();
    let headers = {
      'user-agent': userAgent,
      accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      referer: 'https://instasaved.net/',
    };

    let options = {
      url: 'https://instasaved.net/en/save-stories/' + username,
      headers: headers,
      resolveWithFullResponse: true,
    };

    let response = await rp.defaults({
      proxy: p[i],
    })(options);

    headers = {
      'user-agent': userAgent,
      'x-requested-with': 'XMLHttpRequest',
      'x-xsrf-token': decodeURIComponent(
        getStrBetween(
          response.headers['set-cookie'].join(';'),
          'XSRF-TOKEN=',
          ';'
        )
      ),
      'x-ws-token': getStrBetween(response.body, '<body data-wsid="', '"'),
      'content-type': 'application/json;charset=utf-8',
      accept: 'application/json, text/plain, */*',
      referer: 'https://instasaved.net/en/save-stories/' + username,
      cookie: response.headers['set-cookie']
        .map((cookie) => cookie.split(';')[0])
        .join(';'),
    };
    let dataString =
      '{"type":"story","username":"' +
      username +
      '","origin_username":"' +
      username +
      '"}';
    options = {
      url: 'https://instasaved.net/ajax-instasaver',
      method: 'POST',
      headers: headers,
      body: dataString,
      resolveWithFullResponse: true,
    };
    response = await rp.defaults({
      proxy: p[i],
    })(options);
    const json = JSON.parse(response.body);
    let stories = [];
    for (let story of json.medias) {
      if (story.is_video) {
        stories.push({
          media_type: 2,
          cover_url:
            'https://cdn' +
            ['', '2', '3'][Math.floor(Math.random() * 3)] +
            '.storiesdown.com/images/?url=' +
            encodeURIComponent(
              Buffer.from(story.display_url).toString('base64')
            ),
          video_url:
            'https://cdn' +
            ['', '2', '3'][Math.floor(Math.random() * 3)] +
            '.storiesdown.com/videos/?url=' +
            encodeURIComponent(
              Buffer.from(story.video_resources.pop().src).toString('base64')
            ),
        });
      } else {
        stories.push({
          media_type: 1,
          image_url:
            'https://cdn' +
            ['', '2', '3'][Math.floor(Math.random() * 3)] +
            '.storiesdown.com/images/?url=' +
            encodeURIComponent(
              Buffer.from(story.display_url).toString('base64')
            ),
        });
      }
    }
    console.log('stories:', stories.length, new Date());
    return stories;
  } catch (error) {
    console.log('scrape stories:', p[i]);
    return [];
  }
}

export async function getStoriesV6(id, username) {
  const p = fs.readFileSync('list-proxies2.txt').toString().trim().split('\n');
  let i = Math.floor(Math.random() * p.length);
  try {
    let userAgent = new UserAgent().toString();
    let headers = {
      'user-agent': userAgent,
      accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      referer: 'https://anon-instastories.online/',
    };

    let options = {
      url: 'https://anon-instastories.online/' + username,
      headers: headers,
      resolveWithFullResponse: true,
    };

    let response = await rp.defaults({
      proxy: p[i],
    })(options);

    headers = {
      'user-agent': userAgent,
      'x-requested-with': 'XMLHttpRequest',
      'x-csrf-token': getStrBetween(
        response.body,
        'name="csrf-token" content="',
        '"'
      ),
      'content-type': 'application/x-www-form-urlencoded; charset=UTF-8',
      accept: '*/*',
      referer: 'https://anon-instastories.online/' + username,
      cookie: response.headers['set-cookie']
        .map((cookie) => cookie.split(';')[0])
        .join(';'),
    };
    let dataString = 'getStories=true&userId=' + id;
    options = {
      url: 'https://anon-instastories.online/search',
      method: 'POST',
      headers: headers,
      body: dataString,
      resolveWithFullResponse: true,
    };
    response = await rp.defaults({
      proxy: p[i],
    })(options);
    const json = JSON.parse(response.body);
    let stories = [];
    for (let story of json) {
      if (story.is_video) {
        stories.push({
          media_type: 2,
          cover_url:
            'https://cdn' +
            ['', '2', '3'][Math.floor(Math.random() * 3)] +
            '.storiesdown.com/images/?url=' +
            encodeURIComponent(
              Buffer.from(story.display_url).toString('base64')
            ),
          video_url:
            'https://cdn' +
            ['', '2', '3'][Math.floor(Math.random() * 3)] +
            '.storiesdown.com/videos/?url=' +
            encodeURIComponent(
              Buffer.from(story.video_resources.pop().src).toString('base64')
            ),
        });
      } else {
        stories.push({
          media_type: 1,
          image_url:
            'https://cdn' +
            ['', '2', '3'][Math.floor(Math.random() * 3)] +
            '.storiesdown.com/images/?url=' +
            encodeURIComponent(
              Buffer.from(story.display_url).toString('base64')
            ),
        });
      }
    }
    console.log('stories:', stories.length, new Date());
    return stories;
  } catch (error) {
    console.log('scrape stories:', p[i]);
    return [];
  }
}

String.prototype.replaceAll = function (search, replacement) {
  var target = this;
  return target.replace(new RegExp(search, 'g'), replacement);
};

export async function getStoriesV7(id, username) {
  const p = fs.readFileSync('list-proxies2.txt').toString().trim().split('\n');
  let i = Math.floor(Math.random() * p.length);
  try {
    let userAgent = new UserAgent().toString();
    let headers = {
      'user-agent': userAgent,
      accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      referer: 'https://storiesig.net/',
    };

    let options = {
      url: 'https://storiesig.net/stories/' + username,
      headers: headers,
      resolveWithFullResponse: true,
    };

    let response = await rp.defaults({
      proxy: p[i],
    })(options);

    headers = {
      'user-agent': userAgent,
      'x-requested-with': 'XMLHttpRequest',
      accept: '*/*',
      referer: 'https://storiesig.net/stories/' + username,
    };
    let encodedId = encodeURIComponent(
      Buffer.from(
        `${id}::${username}::${getStrBetween(response.body, ',o="', '"')}`
      ).toString('base64')
    );
    encodedId = encodedId.replaceAll('%3D', '-');
    options = {
      url: 'https://storiesig.net/api/v1/stories/' + encodedId,
      method: 'GET',
      headers: headers,
      resolveWithFullResponse: true,
    };
    response = await rp.defaults({
      proxy: p[i],
    })(options);
    const json = JSON.parse(response.body);
    let stories = [];
    for (let story of json.stories) {
      if (story.media_type == 'video') {
        stories.push({
          media_type: 2,
          cover_url:
            'https://cdn' +
            ['', '2', '3'][Math.floor(Math.random() * 3)] +
            '.storiesdown.com/images/?url=' +
            story.thumbnail.replace('https://embed.storiesig.net/', ''),
          video_url:
            'https://cdn' +
            ['', '2', '3'][Math.floor(Math.random() * 3)] +
            '.storiesdown.com/videos/?url=' +
            story.source.replace('https://embed.storiesig.net/', ''),
        });
      } else {
        stories.push({
          media_type: 1,
          image_url:
            'https://cdn' +
            ['', '2', '3'][Math.floor(Math.random() * 3)] +
            '.storiesdown.com/images/?url=' +
            story.source.replace('https://embed.storiesig.net/', ''),
        });
      }
    }
    console.log('stories:', stories.length, new Date());
    return stories;
  } catch (error) {
    console.log('scrape stories:', p[i]);
    return [];
  }
}

export async function getStoriesV72(id, username) {
  let port = 3333;
  if (Math.random() < 0.5) {
    port = 3334;
  }
  try {
    const response = await axios(
      `http://localhost:${port}?username=${username}&id=${id}`
    );
    if (response.data == 'error') {
      console.log('Error stories 1', port);
      return [];
    }
    let stories = [];
    for (let story of response.data.stories) {
      if (story.media_type == 'video') {
        stories.push({
          media_type: 2,
          cover_url:
            'https://cdn' +
            ['', '2', '3'][Math.floor(Math.random() * 3)] +
            '.storiesdown.com/images/?url=' +
            story.thumbnail.replace('https://embed.storiesig.net/', ''),
          video_url:
            'https://cdn' +
            ['', '2', '3'][Math.floor(Math.random() * 3)] +
            '.storiesdown.com/videos/?url=' +
            story.source.replace('https://embed.storiesig.net/', ''),
        });
      } else {
        stories.push({
          media_type: 1,
          image_url:
            'https://cdn' +
            ['', '2', '3'][Math.floor(Math.random() * 3)] +
            '.storiesdown.com/images/?url=' +
            story.source.replace('https://embed.storiesig.net/', ''),
        });
      }
    }
    console.log('stories:', port, stories.length, new Date());
    return stories;
  } catch (e) {
    console.log('Error stories 2', port);
    return [];
  }
}
export async function getUserInfo(username) {
  let response = {};
  for (let i = 0; i < 3; i++) {
    let proxyUrl = 'http://147.185.238.169:50000';
    try {
      const httpsAgent = new HttpsProxyAgent(proxyUrl);
      const axiosProxy = axios.create({ httpsAgent, timeout: 15000 });
      const searchResponse = await axiosProxy.get(
        `https://www.instagram.com/web/search/topsearch/?context=blended&query=${username}&include_reel=true`,
        {
          headers: { 'User-Agent': new UserAgent().toString() },
        }
      );
      if (searchResponse.data.users) {
        let hasUser = false;
        for (let u of searchResponse.data.users) {
          if (u.user.username == username) {
            hasUser = true;
            response.status = 1;
            response.info = {
              pk: u.user.pk,
              is_private: u.user.is_private,
              username: username,
              full_name: u.user.full_name,
              profile_pic_url: u.user.profile_pic_url,
              profile_pic_url_hd: u.user.profile_pic_url,
            };
            break;
          }
        }
        if (hasUser == false) {
          response.status = 0;
        }
        return response;
      } else {
      }
    } catch (e) {
      // console.log('getUserInfo: ', e);
    }
  }
  response.status = 2;
  return response;
}

export async function getUserPosts(id, nextMaxId) {
  let response = {};
  response.posts = [];
  for (let i = 0; i < 3; i++) {
    let proxyUrl = 'http://147.185.238.169:50000';
    try {
      const httpsAgent = new HttpsProxyAgent(proxyUrl);
      const axiosProxy = axios.create({ httpsAgent, timeout: 15000 });
      const postsResponse = await axiosProxy.get(
        `https://www.instagram.com/graphql/query/?query_id=17880160963012870&id=
        ${id}&first=18&after=${nextMaxId ? nextMaxId : ''}`,
        {
          headers: {
            'User-Agent': new UserAgent().toString(),
          },
        }
      );
      if (postsResponse.data.data) {
        postsResponse.data.data.user.edge_owner_to_timeline_media.edges.forEach(
          (post) => {
            response.posts.push({
              taken_at: post.node.taken_at_timestamp,
              id: post.node.id,
              media_type: 1,
              caption_text:
                post.node.edge_media_to_caption.edges.length > 0
                  ? post.node.edge_media_to_caption.edges[0].node.text
                  : '',
              image_url:
                'https://cdn' +
                ['', '2', '3'][Math.floor(Math.random() * 3)] +
                '.storiesdown.com/images/?url=' +
                encodeURIComponent(
                  Buffer.from(post.node.thumbnail_src).toString('base64')
                ),
            });
          }
        );
        if (
          postsResponse.data.data.user.edge_owner_to_timeline_media.page_info
            .has_next_page
        ) {
          response.nextMaxId =
            postsResponse.data.data.user.edge_owner_to_timeline_media.page_info.end_cursor;
        }
        response.status = 1;
        return response;
      } else {
      }
    } catch (e) {
      // console.log('getUserPosts: ', e);
    }
  }
  response.status = 0;
  return response;
}
export async function getStoriesV8(id, username) {
  let proxyUrl = 'http://147.185.238.169:50000';
  try {
    let userAgent = new UserAgent().toString();
    let headers = {
      'user-agent': userAgent,
      authority: 'www.picuki.com',
      pragma: 'no-cache',
      'cache-control': 'no-cache',
      accept: '*/*',
      'content-type': 'application/x-www-form-urlencoded; charset=UTF-8',
      'x-requested-with': 'XMLHttpRequest',
      'sec-ch-ua-mobile': '?0',
      'user-agent':
        'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_4) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/97.0.4692.99 Safari/537.36',
      'sec-ch-ua-platform': '"macOS"',
      origin: 'https://www.picuki.com',
      'sec-fetch-site': 'same-origin',
      'sec-fetch-mode': 'cors',
      'sec-fetch-dest': 'empty',
      referer: 'https://www.picuki.com/stories-viewer',
      'accept-language': 'en-US,en;q=0.9',
    };

    var dataString = 'query=' + id + '&type=story_api';

    let options = {
      url: 'https://www.picuki.com/app/controllers/ajax.php',
      method: 'POST',
      headers: headers,
      body: dataString,
      resolveWithFullResponse: true,
      timeout: 15000,
    };

    let response = await rp.defaults({
      proxy: proxyUrl,
    })(options);

    const json = JSON.parse(response.body);
    let stories = [];
    for (let story of json.items) {
      if (story.is_video) {
        let videoUrl = story.video_resources[0].src;
        if (videoUrl.includes('picuki.com/https')) {
          videoUrl = decodeURIComponent(videoUrl.split('picuki.com/')[1]);
        } else {
        }

        stories.push({
          media_type: 2,
          cover_url:
            'https://cdn' +
            ['', '2', '3'][Math.floor(Math.random() * 3)] +
            '.storiesdown.com/images/?url=' +
            encodeURIComponent(
              Buffer.from(story.display_resources[0].src).toString('base64')
            ),
          video_url:
            'https://cdn' +
            ['', '2', '3'][Math.floor(Math.random() * 3)] +
            '.storiesdown.com/videos/?url=' +
            encodeURIComponent(encryptWithAES(videoUrl)) +
            '&id=' +
            story.id,
          taken_at: story.taken_at_timestamp,
        });
      } else {
        stories.push({
          media_type: 1,
          image_url:
            'https://cdn' +
            ['', '2', '3'][Math.floor(Math.random() * 3)] +
            '.storiesdown.com/images/?url=' +
            encodeURIComponent(
              Buffer.from(story.display_resources[0].src).toString('base64')
            ),
          taken_at: story.taken_at_timestamp,
        });
      }
    }
    console.log('stories V8:', stories.length, username, new Date());
    return {
      status: 1,
      stories,
    };
  } catch (error) {
    console.log('scrape stories V8:', error.toString());
    console.log('scrape stories V8:', proxyUrl);
    if (
      error.toString().includes('ESOCKETTIMEDOUT') ||
      error.toString().includes('disconnected')
    ) {
      return {
        status: 0,
        stories: [],
      };
    } else {
      return {
        status: 1,
        stories: [],
      };
    }
  }
}

export async function getStoriesV9(id, username) {
  let proxyUrl = 'http://147.185.238.169:50000';
  try {
    let userAgent = new UserAgent().toString();
    let headers = {
      'user-agent': userAgent,
      accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      referer: 'https://instanavigation.com/',
    };

    let options = {
      url: 'https://instanavigation.com/profile/' + username,
      headers: headers,
      resolveWithFullResponse: true,
      timeout: 15000,
    };

    let response = await rp.defaults({
      proxy: proxyUrl,
    })(options);

    headers = {
      authority: 'instanavigation.com',
      origin: 'https://instanavigation.com',
      'sec-fetch-site': 'same-origin',
      'sec-fetch-mode': 'cors',
      'sec-fetch-dest': 'empty',
      'accept-language': 'en-US,en;q=0.9',
      'user-agent': userAgent,
      'x-requested-with': 'XMLHttpRequest',
      'x-xsrf-token': decodeURIComponent(
        getStrBetween(
          response.headers['set-cookie'].join(';'),
          'XSRF-TOKEN=',
          ';'
        )
      ),
      'content-type': 'application/json;charset=utf-8',
      accept: 'application/json, text/plain, */*',
      referer: 'https://instanavigation.com/profile/' + username,
      cookie: response.headers['set-cookie']
        .map((cookie) => cookie.split(';')[0])
        .join(';'),
    };

    let dataString = '{"userName":"' + username + '"}';
    options = {
      url: 'https://instanavigation.com/user-info',
      method: 'POST',
      headers: headers,
      body: dataString,
      resolveWithFullResponse: true,
      timeout: 15000,
    };
    response = await rp.defaults({
      proxy: proxyUrl,
    })(options);
    const json = JSON.parse(response.body);

    if (json.found == false) {
      return {
        status: 1,
        stories: [],
      };
    }
    let stories = [];
    for (let story of json.lastStories) {
      if (story.type == 'video') {
        let p = story.videoUrl.split('.mp4');
        let p2 = p[0].split('/');
        let id = p2[p2.length - 1];
        stories.push({
          media_type: 2,
          cover_url:
            'https://cdn' +
            ['', '2', '3'][Math.floor(Math.random() * 3)] +
            '.storiesdown.com/images/?url=' +
            encodeURIComponent(
              Buffer.from(story.thumbnailUrl).toString('base64')
            ),
          video_url:
            'https://cdn' +
            ['', '2', '3'][Math.floor(Math.random() * 3)] +
            '.storiesdown.com/videos/?url=' +
            encodeURIComponent(encryptWithAES(story.videoUrl)) +
            '&id=' +
            id,
        });
      } else {
        stories.push({
          media_type: 1,
          image_url:
            'https://cdn' +
            ['', '2', '3'][Math.floor(Math.random() * 3)] +
            '.storiesdown.com/images/?url=' +
            encodeURIComponent(
              Buffer.from(story.thumbnailUrl).toString('base64')
            ),
        });
      }
    }
    console.log('stories V9:', stories.length, username, new Date());
    return {
      status: 1,
      stories,
    };
  } catch (error) {
    console.log('scrape stories V9:', error.toString());
    console.log('scrape stories V9:', proxyUrl);
    if (
      error.toString().includes('ESOCKETTIMEDOUT') ||
      error.toString().includes('disconnected') ||
      error.toString().includes('Server Error')
    ) {
      return {
        status: 0,
        stories: [],
      };
    } else {
      return {
        status: 1,
        stories: [],
      };
    }
  }
}

export async function getStoriesV10(id, username) {
  let proxyUrl = 'http://147.185.238.169:50000';
  try {
    let userAgent = new UserAgent().toString();
    let headers = {
      'User-Agent': userAgent,
      Connection: 'keep-alive',
      'Access-Control-Allow-Origin': '*',
      Accept: 'application/json, text/plain, */*',
      Referer: 'https://instasave.org/profile/' + username,
      'Accept-Language': 'en-US,en;q=0.9',
    };

    let options = {
      url:
        'https://instasave.org/api/search/stories/' +
        id +
        '?username=' +
        username +
        '&userId=' +
        id +
        '&externalId=',
      headers: headers,
      resolveWithFullResponse: true,
      timeout: 15000,
    };

    let response = await rp.defaults({
      proxy: proxyUrl,
    })(options);

    const json = JSON.parse(response.body);
    if (json.success == false) {
      return {
        status: 1,
        stories: [],
      };
    }
    let stories = [];
    for (let story of json.data) {
      if (story.media_type == 'video') {
        let videoUrl = story.source.substr(26);
        let p = videoUrl.split('.mp4');
        let p2 = p[0].split('/');
        let id = p2[p2.length - 1];
        let imgUrl = story.thumbnail.substr(27);
        stories.push({
          media_type: 2,
          cover_url:
            'https://cdn' +
            ['', '2', '3'][Math.floor(Math.random() * 3)] +
            '.storiesdown.com/images/?url=' +
            encodeURIComponent(Buffer.from(imgUrl).toString('base64')),
          video_url:
            'https://cdn' +
            ['', '2', '3'][Math.floor(Math.random() * 3)] +
            '.storiesdown.com/videos/?url=' +
            encodeURIComponent(encryptWithAES(videoUrl)) +
            '&id=' +
            id,
        });
      } else {
        let imgUrl = story.source.substr(27);
        stories.push({
          media_type: 1,
          image_url:
            'https://cdn' +
            ['', '2', '3'][Math.floor(Math.random() * 3)] +
            '.storiesdown.com/images/?url=' +
            encodeURIComponent(Buffer.from(imgUrl).toString('base64')),
        });
      }
    }
    console.log('stories V10:', stories.length, username, new Date());
    return {
      status: 1,
      stories,
    };
  } catch (error) {
    console.log('scrape stories V10:', error.toString());
    console.log('scrape stories V10:', proxyUrl);
    if (
      error.toString().includes('ESOCKETTIMEDOUT') ||
      error.toString().includes('disconnected')
    ) {
      return {
        status: 0,
        stories: [],
      };
    } else {
      return {
        status: 1,
        stories: [],
      };
    }
  }
}

export async function getStoriesV11(id, username) {
  let proxyUrl = 'http://147.185.238.169:50000';
  try {
    let userAgent = new UserAgent().toString();
    let headers = {
      'user-agent': userAgent,
      accept:
        'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9',
      'accept-language': 'en-US,en;q=0.9',
      Referer: 'https://instavisor.ru',
    };

    let options = {
      url: 'https://instavisor.ru/stories/' + username,
      headers: headers,
      resolveWithFullResponse: true,
      timeout: 15000,
    };

    let response = await rp.defaults({
      proxy: proxyUrl,
    })(options);

    const html = response.body;
    if (html.includes('У пользователя нет историй')) {
      return {
        status: 1,
        stories: [],
      };
    }
    let pHtml = getStrBetween(
      html,
      'columns is-multiline is-mobile">',
      '</div></div></div>'
    ).split(
      '<div class="column is-full-mobile is-one-third-tablet is-one-third-desktop">'
    );
    let stories = [];
    for (let story of pHtml) {
      if (story.includes('href="#post') == false) {
        continue;
      }
      if (story.includes('<video')) {
        let videoUrl = getStrBetween(
          story,
          '<video controls><source src="https://media.instavisor.net/',
          '"'
        );
        let p = videoUrl.split('.mp4');
        let p2 = p[0].split('/');
        let id = p2[p2.length - 1];
        let coverUrl = getStrBetween(
          story,
          '<img src="https://media.instavisor.net/',
          '"'
        );
        stories.push({
          media_type: 2,
          cover_url:
            'https://cdn' +
            ['', '2', '3'][Math.floor(Math.random() * 3)] +
            '.storiesdown.com/images/?url=' +
            encodeURIComponent(Buffer.from(coverUrl).toString('base64')),
          video_url:
            'https://cdn' +
            ['', '2', '3'][Math.floor(Math.random() * 3)] +
            '.storiesdown.com/videos/?url=' +
            encodeURIComponent(encryptWithAES(videoUrl)) +
            '&id=' +
            id,
        });
      } else {
        let imgUrl = getStrBetween(
          story,
          '</button><img src="https://media.instavisor.net/',
          '"'
        );
        stories.push({
          media_type: 1,
          image_url:
            'https://cdn' +
            ['', '2', '3'][Math.floor(Math.random() * 3)] +
            '.storiesdown.com/images/?url=' +
            encodeURIComponent(Buffer.from(imgUrl).toString('base64')),
        });
      }
    }
    console.log('stories V11:', stories.length, username, new Date());
    return {
      status: 1,
      stories,
    };
  } catch (error) {
    console.log('scrape stories V11:', error.toString());
    console.log('scrape stories V11:', proxyUrl);
    if (
      error.toString().includes('ESOCKETTIMEDOUT') ||
      error.toString().includes('disconnected')
    ) {
      return {
        status: 0,
        stories: [],
      };
    } else {
      return {
        status: 1,
        stories: [],
      };
    }
  }
}

export async function getStoriesV12(id, username) {
  let proxyUrl = 'http://147.185.238.169:50000';
  try {
    let userAgent = new UserAgent().toString();
    let headers = {
      'user-agent': userAgent,
      accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      referer: 'https://instasupersave.com/',
    };

    let options = {
      url: 'https://instasupersave.com/en/',
      headers: headers,
      resolveWithFullResponse: true,
    };

    let response = await rp.defaults({
      proxy: proxyUrl,
    })(options);

    headers = {
      authority: 'instasupersave.com',
      accept: 'application/json, text/plain, */*',
      'accept-language': 'en-US,en;q=0.9',
      'cache-control': 'no-cache',
      cookie: response.headers['set-cookie']
        .map((cookie) => cookie.split(';')[0])
        .join(';'),
      pragma: 'no-cache',
      referer: 'https://instasupersave.com/en/',
      'sec-fetch-dest': 'empty',
      'sec-fetch-mode': 'cors',
      'sec-fetch-site': 'same-origin',
      'user-agent': userAgent,
      'x-token': 'null',
      'x-xsrf-token': decodeURIComponent(
        getStrBetween(
          response.headers['set-cookie'].join(';'),
          'XSRF-TOKEN=',
          ';'
        )
      ),
    };

    options = {
      url: 'https://instasupersave.com/api/ig/stories/' + id,
      headers: headers,
      resolveWithFullResponse: true,
    };
    response = await rp.defaults({
      proxy: proxyUrl,
    })(options);
    const json = JSON.parse(response.body);
    let stories = [];
    for (let story of json.result) {
      if (story.video_versions) {
        let id = story.pk;
        stories.push({
          media_type: 2,
          cover_url:
            'https://cdn' +
            ['', '2', '3'][Math.floor(Math.random() * 3)] +
            '.storiesdown.com/images/?url=' +
            encodeURIComponent(
              Buffer.from(story.image_versions2.candidates[0].url).toString(
                'base64'
              )
            ),
          video_url:
            'https://cdn' +
            ['', '2', '3'][Math.floor(Math.random() * 3)] +
            '.storiesdown.com/videos/?url=' +
            encodeURIComponent(encryptWithAES(story.video_versions[0].url)) +
            '&id=' +
            id,
        });
      } else {
        stories.push({
          media_type: 1,
          image_url:
            'https://cdn' +
            ['', '2', '3'][Math.floor(Math.random() * 3)] +
            '.storiesdown.com/images/?url=' +
            encodeURIComponent(
              Buffer.from(story.image_versions2.candidates[0].url).toString(
                'base64'
              )
            ),
        });
      }
    }
    console.log('stories V12:', stories.length, new Date());
    return {
      status: 1,
      stories,
    };
  } catch (error) {
    console.log('scrape stories V12:', error.toString());
    console.log('scrape stories V12:', proxyUrl);
    if (
      error.toString().includes('ESOCKETTIMEDOUT') ||
      error.toString().includes('disconnected')
    ) {
      return {
        status: 0,
        stories: [],
      };
    } else {
      return {
        status: 1,
        stories: [],
      };
    }
  }
}

export async function getStoriesV13(id, username) {
  let proxyUrl = 'http://147.185.238.169:50000';
  try {
    let userAgent = new UserAgent().toString();
    let headers = {
      'user-agent': userAgent,
      accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      referer: 'https://storiesig.info',
    };

    let options = {
      url: 'https://storiesig.info/en',
      headers: headers,
      resolveWithFullResponse: true,
    };

    let response = await rp.defaults({
      proxy: proxyUrl,
    })(options);

    headers = {
      authority: 'storiesig.info',
      accept:
        'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9',
      'accept-language': 'en-US,en;q=0.9',
      'cache-control': 'no-cache',
      cookie: response.headers['set-cookie']
        .map((cookie) => cookie.split(';')[0])
        .join(';'),
      pragma: 'no-cache',
      referer: 'https://storiesig.info/en',
      'sec-fetch-dest': 'empty',
      'sec-fetch-mode': 'cors',
      'sec-fetch-site': 'same-origin',
      'user-agent': userAgent,
      'x-token': 'null',
      'x-xsrf-token': decodeURIComponent(
        getStrBetween(
          response.headers['set-cookie'].join(';'),
          'XSRF-TOKEN=',
          ';'
        )
      ),
    };

    options = {
      url: 'https://storiesig.info/api/ig/stories/' + id,
      headers: headers,
      resolveWithFullResponse: true,
    };
    response = await rp.defaults({
      proxy: proxyUrl,
    })(options);
    const json = JSON.parse(response.body);
    let stories = [];
    for (let story of json.result) {
      if (story.video_versions) {
        let id = story.pk;
        stories.push({
          media_type: 2,
          cover_url:
            'https://cdn' +
            ['', '2', '3'][Math.floor(Math.random() * 3)] +
            '.storiesdown.com/images/?url=' +
            encodeURIComponent(
              Buffer.from(story.image_versions2.candidates[0].url).toString(
                'base64'
              )
            ),
          video_url:
            'https://cdn' +
            ['', '2', '3'][Math.floor(Math.random() * 3)] +
            '.storiesdown.com/videos/?url=' +
            encodeURIComponent(encryptWithAES(story.video_versions[0].url)) +
            '&id=' +
            id,
        });
      } else {
        stories.push({
          media_type: 1,
          image_url:
            'https://cdn' +
            ['', '2', '3'][Math.floor(Math.random() * 3)] +
            '.storiesdown.com/images/?url=' +
            encodeURIComponent(
              Buffer.from(story.image_versions2.candidates[0].url).toString(
                'base64'
              )
            ),
        });
      }
    }
    console.log('stories V13:', stories.length, new Date());
    return {
      status: 1,
      stories,
    };
  } catch (error) {
    // console.log(error);
    console.log('scrape stories V13:', error.toString());
    console.log('scrape stories V13:', proxyUrl);
    if (
      error.toString().includes('ESOCKETTIMEDOUT') ||
      error.toString().includes('disconnected')
    ) {
      return {
        status: 0,
        stories: [],
      };
    } else {
      return {
        status: 1,
        stories: [],
      };
    }
  }
}

export async function getStoriesV14(id, username) {
  let proxyUrl = 'http://147.185.238.169:50000';
  const data = await new Promise((resolve, reject) => {
    try {
      let isFullFilled = false;
      let agent = new HttpsProxyAgent(proxyUrl);
      let opts = {
        secure: true,
        rejectUnauthorized: false,
        reconnect: false,
        agent: agent,
        extraHeaders: {
          'User-Agent': new UserAgent().toString(),
        },
      };
      const socket = require('socket.io-client')(
        'https://insta-stories-viewer.com/',
        opts
      );
      socket.on('connect', function () {
        socket.emit('search', {
          username: username,
          date: Date.now(),
        });
        socket.on('searchResult', function (e) {
          if (!isFullFilled) {
            isFullFilled = true;
            if (e.data.status == 'success') {
              let stories = [];
              for (let story of e.data.user.reels) {
                if (story.is_video) {
                  let p = story.video_url.split('.mp4');
                  let p2 = p[0].split('/');
                  let id = p2[p2.length - 1];
                  stories.push({
                    media_type: 2,
                    cover_url:
                      'https://cdn' +
                      ['', '2', '3'][Math.floor(Math.random() * 3)] +
                      '.storiesdown.com/images/?url=' +
                      encodeURIComponent(
                        Buffer.from(story.thumbnail_src).toString('base64')
                      ),
                    video_url:
                      'https://cdn' +
                      ['', '2', '3'][Math.floor(Math.random() * 3)] +
                      '.storiesdown.com/videos/?url=' +
                      encodeURIComponent(encryptWithAES(story.video_url)) +
                      '&id=' +
                      id,
                  });
                } else {
                  stories.push({
                    media_type: 1,
                    image_url:
                      'https://cdn' +
                      ['', '2', '3'][Math.floor(Math.random() * 3)] +
                      '.storiesdown.com/images/?url=' +
                      encodeURIComponent(
                        Buffer.from(story.thumbnail_src).toString('base64')
                      ),
                  });
                }
              }
              console.log('stories V14:', stories.length, new Date());
              resolve({ status: 1, stories });
            } else {
              resolve({ status: 0, stories: [] });
            }
          }
          socket.disconnect();
        });
      });
      setTimeout(() => {
        if (!isFullFilled) {
          isFullFilled = true;
          socket.disconnect();
          resolve({ status: 0, stories: [] });
        }
      }, 15000);
    } catch (error) {
      console.log('scrape stories V14:', error.toString());
      console.log('scrape stories V14:', proxyUrl);
      if (
        error.toString().includes('ESOCKETTIMEDOUT') ||
        error.toString().includes('disconnected')
      ) {
        resolve({ status: 0, stories: [] });
      } else {
        resolve({ status: 1, stories: [] });
      }
    }
  });
  return data;
}
export async function getUserInfoByScraper(username, isGoogleBot) {
  // const retry = 1;
  // for (let j = 0; j < retry; j++) {
  //   const p = fs
  //     .readFileSync('ig-proxies.txt')
  //     .toString()
  //     .trim()
  //     .split('\n')
  //     .map((p) => p.trim());
  //   let i = Math.floor(Math.random() * p.length);
  //   if (p[i] == '') {
  //     const p2 = fs
  //       .readFileSync('ig-proxies2.txt')
  //       .toString()
  //       .trim()
  //       .split('\n')
  //       .map((p) => p.trim());
  //     let j = Math.floor(Math.random() * p2.length);
  //     p[i] = p2[j];
  //   }
  //   try {
  //     if (username.includes(' ')) {
  //       return false;
  //     }
  //     // const p = fs.readFileSync('proxy.txt').toString().trim().split('\n');
  //     // const p = fs.readFileSync('list-proxies.txt').toString().trim().split('\n');
  //     // let i = Math.floor(Math.random() * p.length);
  //     // const proxy = p[i].replace('http://', '').split(':');
  //     // const httpsAgent = new HttpsProxyAgent({
  //     //   host: proxy[0],
  //     //   port: proxy[1],
  //     // });
  //     const httpsAgent = new HttpsProxyAgent(p[i]);
  //     const axiosProxy = axios.create({ httpsAgent, timeout: 10000 });
  //     const response = await axiosProxy.get(
  //       `https://www.instagram.com/${username}/?__a=1`,
  //       { headers: { 'User-Agent': new UserAgent().toString() } }
  //     );
  //     if (response.data.graphql == undefined) {
  //       let currentProxies = fs
  //         .readFileSync('ig-proxies.txt')
  //         .toString()
  //         .trim()
  //         .split('\n')
  //         .map((u) => u.trim());
  //       currentProxies = currentProxies.filter((u) => u != p[i]);
  //       fs.writeFileSync(
  //         'ig-proxies.txt',
  //         currentProxies.join('\n').trim() + '\n'
  //       );
  //       if (j == retry - 1) {
  //         console.log('scrape user info:', username, p[i]);
  //         return false;
  //       }
  //     } else {
  //       return {
  //         pk: response.data.graphql.user.id,
  //         is_private: response.data.graphql.user.is_private,
  //         username: username,
  //         full_name: response.data.graphql.user.full_name,
  //         biography: response.data.graphql.user.biography,
  //         media_count:
  //           response.data.graphql.user.edge_owner_to_timeline_media.count,
  //         follower_count: response.data.graphql.user.edge_followed_by.count,
  //         following_count: response.data.graphql.user.edge_follow.count,
  //         profile_pic_url: response.data.graphql.user.profile_pic_url,
  //         profile_pic_url_hd: response.data.graphql.user.profile_pic_url_hd,
  //       };
  //     }
  //     // const response = await axiosProxy.get(
  //     //   'https://instalkr.com/api/getprofile/' + username,
  //     //   { headers: { 'User-Agent': new UserAgent().toString() } }
  //     // );
  //     // if (response.data.code == 404) {
  //     //   return false;
  //     // }
  //     // return {
  //     //   pk: response.data.id,
  //     //   is_private: false,
  //     //   username: username,
  //     //   full_name: response.data.full_name,
  //     //   biography: response.data.biography,
  //     //   media_count: response.data.media_count,
  //     //   follower_count: response.data.follows_count,
  //     //   following_count: response.data.followed_by_count,
  //     //   profile_pic_url: response.data.userpic,
  //     // };
  //     // const response = await axiosProxy.get(
  //     //   'https://www.picuki.com/profile/' + encodeURI(username),
  //     //   { headers: { 'User-Agent': new UserAgent().toString() } }
  //     // );
  //     // const getStrBetween = (str, a, b) => {
  //     //   const p = str.indexOf(a) + a.length;
  //     //   return str.substring(p, str.indexOf(b, p));
  //     // };
  //     // if (response.data.includes('Profile is private')) {
  //     //   const imginnResponse = await axiosProxy.get(
  //     //     'https://imginn.com/search/?q=' + encodeURI(username),
  //     //     { headers: { 'User-Agent': new UserAgent().toString() } }
  //     //   );
  //     //   const data = getStrBetween(
  //     //     imginnResponse.data,
  //     //     '<a class="tab-item user-item" href="/' + username + '/">',
  //     //     '</a'
  //     //   );
  //     //   return {
  //     //     pk: '',
  //     //     is_private: true,
  //     //     username: username,
  //     //     full_name: getStrBetween(data, '<span>', '</span>'),
  //     //     profile_pic_url: getStrBetween(data, '<img src="', '"').replace(
  //     //       /&#38;/g,
  //     //       '&'
  //     //     ),
  //     //   };
  //     // }
  //     // return {
  //     //   pk: (() => {
  //     //     if (response.data.includes('let query =')) {
  //     //       return getStrBetween(response.data, "var query = '", "'");
  //     //     } else {
  //     //       return '';
  //     //     }
  //     //   })(),
  //     //   is_private: false,
  //     //   username: username,
  //     //   full_name: getStrBetween(
  //     //     response.data,
  //     //     '<h2 class="profile-name-bottom">',
  //     //     '</h2>'
  //     //   ),
  //     //   biography: getStrBetween(
  //     //     response.data,
  //     //     '<div class="profile-description">',
  //     //     '</div>'
  //     //   ).trim(),
  //     //   media_count: getStrBetween(
  //     //     response.data,
  //     //     '<span class="black-box"><a href="https://www.picuki.com/profile/' +
  //     //       username +
  //     //       '">',
  //     //     ' Posts</a>'
  //     //   ),
  //     //   follower_count: getStrBetween(
  //     //     response.data,
  //     //     '<span data-followers="',
  //     //     '"'
  //     //   ),
  //     //   following_count: (() => {
  //     //     const a = '<span data-followers="';
  //     //     const b = '"';
  //     //     const p = response.data.lastIndexOf(a) + a.length;
  //     //     return response.data.substring(p, response.data.indexOf(b, p));
  //     //   })(),
  //     //   profile_pic_url: getStrBetween(
  //     //     response.data,
  //     //     '<img src="',
  //     //     '" alt="' + username + '">'
  //     //   ),
  //     // };
  //   } catch (error) {
  //     if (error.toString().includes('status code 404') == false) {
  //       // let currentProxies = fs
  //       //   .readFileSync('ig-proxies.txt')
  //       //   .toString()
  //       //   .trim()
  //       //   .split('\n')
  //       //   .map((u) => u.trim());
  //       // currentProxies = currentProxies.filter((u) => u != p[i]);
  //       // // console.log(currentProxies, p[i]);
  //       // fs.writeFileSync('ig-proxies.txt', currentProxies.join('\n').trim());
  //     }
  //     if (
  //       error.toString().includes('status code 564') ||
  //       error.toString().includes('ECONNRESET') ||
  //       error.toString().includes('timeout of')
  //     ) {
  //       let currentProxies = fs
  //         .readFileSync('ig-proxies.txt')
  //         .toString()
  //         .trim()
  //         .split('\n')
  //         .map((u) => u.trim());
  //       currentProxies = currentProxies.filter((u) => u != p[i]);
  //       // console.log(currentProxies, p[i]);
  //       fs.writeFileSync(
  //         'ig-proxies.txt',
  //         currentProxies.join('\n').trim() + '\n'
  //       );
  //     }
  //     if (j == retry - 1) {
  //       console.log('scrape user info:', username, p[i], error.toString());
  //       return false;
  //     }
  //   }
  // }
  if (username.includes(' ')) {
    return false;
  }
  const p = fs
    .readFileSync('list-proxies.txt')
    .toString()
    .trim()
    .split('\n')
    .map((p) => p.trim());
  let i = Math.floor(Math.random() * p.length);
  // let i = 0;
  // p[i] = 'http://167.172.28.251:50002';
  // if (p[i] == '') {
  // p[i] = 'http://134.209.168.7:50000';
  // try {
  //   const p2 = fs
  //     .readFileSync('list-proxies.txt')
  //     .toString()
  //     .trim()
  //     .split('\n')
  //     .map((p) => p.trim());
  //   let j = Math.floor(Math.random() * p2.length);
  //   const httpsAgent = new HttpsProxyAgent(p2[j]);
  //   const axiosProxy = axios.create({ httpsAgent, timeout: 10000 });
  // const response = await axiosProxy.get(
  //   'https://instalkr.com/api/getprofile/' + username,
  //   { headers: { 'User-Agent': new UserAgent().toString() } }
  // );
  // if (response.data.code == 404) {
  //   return false;
  // }
  // console.log('instalkr:', response.data.username);
  // return {
  //   pk: response.data.id,
  //   is_private: false,
  //   username: username,
  //   full_name: response.data.full_name,
  //   biography: response.data.biography,
  //   media_count: response.data.media_count,
  //   follower_count: response.data.follows_count,
  //   following_count: response.data.followed_by_count,
  //   profile_pic_url: response.data.userpic,
  //   profile_pic_url_hd: response.data.userpic,
  // };
  //     const response = await axiosProxy.get(
  //       'https://www.picuki.com/profile/' + encodeURI(username),
  //       { headers: { 'User-Agent': new UserAgent().toString() } }
  //     );
  //     const getStrBetween = (str, a, b) => {
  //       const p = str.indexOf(a) + a.length;
  //       return str.substring(p, str.indexOf(b, p));
  //     };
  //     if (response.data.includes('Profile is private')) {
  //       return null;
  //     }
  //     console.log('picuki: ', username);
  //     return {
  //       pk: (() => {
  //         if (response.data.includes('let query =')) {
  //           return getStrBetween(response.data, "let query = '", "'");
  //         } else {
  //           return '';
  //         }
  //       })(),
  //       is_private: false,
  //       username: username,
  //       full_name: getStrBetween(
  //         response.data,
  //         '<h2 class="profile-name-bottom">',
  //         '</h2>'
  //       ),
  //       biography: getStrBetween(
  //         response.data,
  //         '<div class="profile-description">',
  //         '</div>'
  //       ).trim(),
  //       media_count: getStrBetween(
  //         response.data,
  //         '<span class="total_posts">',
  //         '</span>'
  //       ),
  //       follower_count: getStrBetween(
  //         response.data,
  //         '<span data-followers="',
  //         '"'
  //       ),
  //       following_count: (() => {
  //         const a = '<span data-followers="';
  //         const b = '"';
  //         const p = response.data.lastIndexOf(a) + a.length;
  //         return response.data.substring(p, response.data.indexOf(b, p));
  //       })(),
  //       profile_pic_url: getStrBetween(
  //         response.data,
  //         '<img src="',
  //         '" alt="' + username + '">'
  //       ),
  //     };
  //   } catch (error) {
  //     // console.log('instalkr:', error);
  //     if (error.toString().includes('status code 404') == true) {
  //       return false;
  //     }
  //     console.log('picuki:', error);
  //     return null;
  //   }
  // }
  let timeout = 10000;
  if (isGoogleBot == 'true') {
    timeout = 20000;
  }
  let isFullFilled = false;
  const profile = await Promise.race([
    new Promise(async (resolve, reject) => {
      for (let t = 0; t < 2; t++) {
        if (isFullFilled) {
          break;
        }
        try {
          const httpsAgent = new HttpsProxyAgent(p[i]);
          const axiosProxy = axios.create({ httpsAgent });
          // const response = await axiosProxy.get(
          //   `https://www.instagram.com/${username}/?__a=1`,
          //   { headers: { 'User-Agent': new UserAgent().toString() } }
          // );
          const response = await axiosProxy.get(
            `https://www.instagram.com/web/search/topsearch/?context=blended&query=${username}&include_reel=true`,
            { headers: { 'User-Agent': new UserAgent().toString() } }
          );
          // if (response.data.graphql == undefined) {
          if (response.data.users == undefined) {
            // let currentProxies = fs
            //   .readFileSync('ig-proxies.txt')
            //   .toString()
            //   .trim()
            //   .split('\n')
            //   .map((u) => u.trim());
            // currentProxies = currentProxies.filter((u) => u != p[i]);
            // fs.writeFileSync(
            //   'ig-proxies.txt',
            //   currentProxies.join('\n').trim() + '\n'
            // );
            if (t < 1) {
              continue;
            }
            console.log('scrape user info:', username, p[i]);
            isFullFilled = true;
            resolve(null);
          } else {
            isFullFilled = true;
            // resolve({
            //   pk: response.data.graphql.user.id,
            //   is_private: response.data.graphql.user.is_private,
            //   username: username,
            //   full_name: response.data.graphql.user.full_name,
            //   biography: response.data.graphql.user.biography,
            //   media_count:
            //     response.data.graphql.user.edge_owner_to_timeline_media.count,
            //   follower_count: response.data.graphql.user.edge_followed_by.count,
            //   following_count: response.data.graphql.user.edge_follow.count,
            //   profile_pic_url: response.data.graphql.user.profile_pic_url,
            //   profile_pic_url_hd: response.data.graphql.user.profile_pic_url_hd,
            // });
            let hasUser = false;
            for (let u of response.data.users) {
              if (u.user.username == username) {
                hasUser = true;
                resolve({
                  pk: u.user.pk,
                  is_private: u.user.is_private,
                  username: username,
                  full_name: u.user.full_name,
                  profile_pic_url: u.user.profile_pic_url,
                  profile_pic_url_hd: u.user.profile_pic_url,
                });
                break;
              }
            }
            if (hasUser == false) {
              resolve(false);
            }
            break;
          }
        } catch (error) {
          if (t < 1) {
            continue;
          }
          isFullFilled = true;
          console.log('scrape user info:', username, p[i], error.toString());
          resolve(null);
          // if (
          //   error.toString().includes('status code 564') ||
          //   error.toString().includes('ECONNRESET') ||
          //   error.toString().includes('timeout of')
          // ) {
          //   // let currentProxies = fs
          //   //   .readFileSync('ig-proxies.txt')
          //   //   .toString()
          //   //   .trim()
          //   //   .split('\n')
          //   //   .map((u) => u.trim());
          //   // currentProxies = currentProxies.filter((u) => u != p[i]);
          //   // fs.writeFileSync(
          //   //   'ig-proxies.txt',
          //   //   currentProxies.join('\n').trim() + '\n'
          //   // );
          //   resolve(null);
          // } else {
          //   resolve(false);
          // }
        }
      }
    }),
    new Promise((resolve, reject) => {
      setTimeout(() => {
        if (isFullFilled == false) {
          isFullFilled = true;
          console.log(
            'scrape user info:',
            username,
            p[i],
            'timeout',
            isGoogleBot
          );
          // let currentProxies = fs
          //   .readFileSync('ig-proxies.txt')
          //   .toString()
          //   .trim()
          //   .split('\n')
          //   .map((u) => u.trim());
          // currentProxies = currentProxies.filter((u) => u != p[i]);
          // fs.writeFileSync(
          //   'ig-proxies.txt',
          //   currentProxies.join('\n').trim() + '\n'
          // );
          resolve(null);
        }
      }, timeout);
    }),
  ]);

  return profile;
}

export async function getUserInfoByScraper2(username, isGoogleBot) {
  if (username.includes(' ')) {
    return false;
  }
  const p = fs
    .readFileSync('list-proxies2.txt')
    .toString()
    .trim()
    .split('\n')
    .map((p) => p.trim());
  let i = Math.floor(Math.random() * p.length);
  let timeout = 10000;
  if (isGoogleBot == 'true') {
    timeout = 20000;
  }
  let isFullFilled = false;
  const profile = await Promise.race([
    new Promise(async (resolve, reject) => {
      for (let t = 0; t < 1; t++) {
        if (isFullFilled) {
          break;
        }
        try {
          var headers = {
            'User-Agent': new UserAgent().toString(),
            Accept: 'application/json, text/plain, */*',
            'Accept-Language': 'en-US,en;q=0.5',
            'Content-Type': 'application/json',
            Origin: 'https://insta-stories.ru',
            DNT: '1',
            Connection: 'keep-alive',
            Referer: 'https://insta-stories.ru/' + username,
            TE: 'Trailers',
            Cookie: 'lang=en',
          };

          var dataString =
            '{"xtrip":"dwsefi4k4fzbn57m","username":"' + username + ' "}';

          var options = {
            url: 'https://insta-stories.ru/api/profile',
            method: 'POST',
            headers: headers,
            body: dataString,
            resolveWithFullResponse: true,
          };
          const response = await rp.defaults({
            proxy: p[i],
          })(options);
          const data = JSON.parse(response.body);
          if (data.profile == false) {
            resolve(false);
          } else {
            resolve({
              pk: data.data.id,
              is_private: data.data.is_private,
              username: username,
              full_name: data.data.fullname,
              profile_pic_url: data.data.profile_pic,
              profile_pic_url_hd: data.data.profile_pic,
            });
          }
          break;
        } catch (error) {
          if (t < 1) {
            continue;
          }
          isFullFilled = true;
          console.log('scrape user info:', username, p[i], error.toString());
          resolve(null);
        }
      }
    }),
    new Promise((resolve, reject) => {
      setTimeout(() => {
        if (isFullFilled == false) {
          isFullFilled = true;
          console.log(
            'scrape user info:',
            username,
            p[i],
            'timeout',
            isGoogleBot
          );
          resolve(null);
        }
      }, timeout);
    }),
  ]);

  return profile;
}
