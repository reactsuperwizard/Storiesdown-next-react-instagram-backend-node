import { getUserPosts } from '../../../helpers/instagram';
import cryptor from '../../../helpers/cryptor';

require('dotenv').config();

export default async (req, res) => {
  const {
    query: { pk, nextMaxId, _username },
  } = req;
  const MAX_RETRY = 0;
  // let igApi = async () => {
  // const p = fs.readFileSync('list-proxies.txt').toString().trim().split('\n');
  // let i = Math.floor(Math.random() * p.length);
  // let timeout = 10000;
  // let isFullFilled = false;
  // const posts = await Promise.race([
  //   new Promise(async (resolve, reject) => {
  //     id = cryptor.decrypt(pk);
  //     try {
  //       const httpsAgent = new HttpsProxyAgent(p[i]);
  //       const axiosProxy = axios.create({ httpsAgent, timeout: 10000 });
  //       const postsResponse = await axiosProxy.get(
  //         `https://www.instagram.com/graphql/query/?query_hash=003056d32c2554def87228bc3fd9668a&variables=%7B%22id%22%3A%22${encodeURIComponent(
  //           id
  //         )}%22%2C%22first%22%3A18%2C%22after%22%3A%22${
  //           nextMaxId ? encodeURIComponent(nextMaxId) : ''
  //         }%22%7D`,
  //         {
  //           headers: {
  //             'User-Agent': new UserAgent().toString(),
  //           },
  //         }
  //       );
  //       let response = {};
  //       response.posts = [];
  //       if (
  //         postsResponse.data.data.user.edge_owner_to_timeline_media.count > 0
  //       ) {
  //         postsResponse.data.data.user.edge_owner_to_timeline_media.edges.forEach(
  //           (post) => {
  //             response.posts.push({
  //               taken_at: post.node.taken_at_timestamp,
  //               id: post.node.id,
  //               media_type: 1,
  //               caption_text:
  //                 post.node.edge_media_to_caption.edges.length > 0
  //                   ? post.node.edge_media_to_caption.edges[0].node.text
  //                   : '',
  //               // image_url: post.node.thumbnail_src,
  //               image_url:
  //                 'https://cdn' +
  //                 ['', '2', '3'][Math.floor(Math.random() * 3)] +
  //                 '.storiesdown.com/images/?url=' +
  //                 encodeURIComponent(
  //                   Buffer.from(post.node.thumbnail_src).toString('base64')
  //                 ),
  //             });
  //           }
  //         );
  //       }
  //       if (
  //         postsResponse.data.data.user.edge_owner_to_timeline_media.page_info
  //           .has_next_page
  //       ) {
  //         response.nextMaxId =
  //           postsResponse.data.data.user.edge_owner_to_timeline_media.page_info.end_cursor;
  //       }
  //       console.log('posts:', id);
  //       response.status = 1;
  //       isFullFilled = true;
  //       resolve(response);
  //     } catch (error) {
  //       if (
  //         error.toString().includes('status code 429') ||
  //         error.toString().includes("Cannot read property 'user'")
  //       ) {
  //         // let currentProxies = fs
  //         //   .readFileSync('list-proxies.txt')
  //         //   .toString()
  //         //   .trim()
  //         //   .split('\n')
  //         //   .map((u) => u.trim());
  //         // currentProxies = currentProxies.filter((u) => u != p[i]);
  //         // // console.log(currentProxies, p[i]);
  //         // fs.writeFileSync(
  //         //   'list-proxies.txt',
  //         //   currentProxies.join('\n').trim() + '\n'
  //         // );
  //       }
  //       console.log('pk:', pk, error.toString(), p[i]);
  //       isFullFilled = true;
  //       resolve({ status: 0 });
  //     }
  //   }),
  //   new Promise((resolve, reject) => {
  //     setTimeout(() => {
  //       if (isFullFilled == false) {
  //         console.log('scrape posts:', p[i], 'timeout', isGoogleBot, timeout);
  //         resolve({ status: 0 });
  //       }
  //     }, timeout);
  //   }),
  // ]);
  // return res.status(200).json(posts);

  // };
  // igApi();
  try {
    let id = pk;
    if (id.length > 20) {
      id = cryptor.decrypt(pk);
    }
    const data = await getUserPosts(id, nextMaxId);
    res.status(200).json(data);
  } catch (e) {
    console.log(e, pk);
    return res.status(200).json({ status: 0 });
  }
};
