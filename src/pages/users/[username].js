import { Component } from 'react';
import MainLayout from '../../components/main-layout';
import HighlightCover from '../../components/highlight-cover';
import Header from '../../components/header';
import UserInfo from '../../components/user-info';
import Story from '../../components/story';
import Post from '../../components/post';
import BlogPostsSlider from '../../components/blog-posts-slider';
import SearchField from '../../components/search-field';
import axios from 'axios';
import jsCookie from 'js-cookie';
import cookies from 'next-cookies';
import redirect from '../../helpers/redirect';
import Head from 'next/head';
import AdSense from 'react-adsense';
import Skeleton from 'react-loading-skeleton';
import Masonry, { ResponsiveMasonry } from 'react-responsive-masonry';
class User extends Component {
  constructor(props) {
    super(props);
    this.createHighlightCovers = this.createHighlightCovers.bind(this);
    this.changeTab = this.changeTab.bind(this);
    this.getUserPosts = this.getUserPosts.bind(this);
    this.saveUser = this.saveUser.bind(this);
    this.state = {};
    this.state.selectedTab = 0;
    this.state.user = {};
    this.state.userPosts = {};
    this.state.userPosts.posts = [];
    this.state.userStories = [];

    if (props.userPosts) {
      this.state.userPosts = props.userPosts;
    }

    if (props.user) {
      this.state.user = props.user;
      if (jsCookie.get(this.props.user.info.username)) {
        const savedUser = JSON.parse(
          localStorage.getItem(props.user.info.username)
        );
        this.state.userPosts.posts = savedUser.posts;
        this.state.userPosts.nextMaxId = savedUser.nextMaxId;
        this.state.userStories = savedUser.userStories;
        this.state.user.info = { ...savedUser.info };
      }
    }

    this.state.isError = props.isError ? true : false;
    this.state.isFirstLoadStories = true;
    this.state.isFirstLoadPosts = true;
    this.state.isLoadingPosts = false;
    this.state.isLoadingStories = false;
    this.state.cached = props.cached ? true : false;
  }

  componentDidMount() {
    if (this.state.user.info.username in localStorage == false) {
      this.saveUser();
    }
    if (
      this.state.userStories.length == 0 &&
      this.state.user.info.is_private == false
    ) {
      this.getUserStories();
    }
  }

  componentDidUpdate() {
    this.saveUser();
  }

  saveUser() {
    if (
      this.state.user &&
      this.state.isError == false &&
      this.props.search == undefined
    ) {
      localStorage.setItem(
        this.state.user.info.username,
        JSON.stringify({
          ...this.state.user,
          ...this.state.userPosts,
          userStories: this.state.userStories,
        })
      );

      if (this.state.user.info.username in localStorage == false) {
        localStorage.clear();
        localStorage.setItem(
          this.state.user.info.username,
          JSON.stringify({
            ...this.state.user,
            ...this.state.userPosts,
            userStories: this.state.userStories,
          })
        );
      }

      if (this.state.user.info.username in localStorage) {
        jsCookie.set(this.state.user.info.username, true, {
          expires: 1 / 24 / 6,
        });
      }
    }
  }

  createHighlightCovers() {
    let highlightCovers = [];
    this.state.user.highlightTrays.sort((a, b) =>
      a.latest_reel_media < b.latest_reel_media
        ? 1
        : b.latest_reel_media < a.latest_reel_media
        ? -1
        : 0
    );
    this.state.user.highlightTrays.forEach(function (hl, i) {
      highlightCovers.push(
        <div className='col-6 col-md-4 col-lg-3 mb-3' key={i}>
          <HighlightCover highlightCover={hl} user={this.state.user} />
        </div>
      );
    }, this);
    if (highlightCovers.length == 0) {
      return (
        <div className='col-12 text-center'>There is no highlight story.</div>
      );
    }
    return highlightCovers;
  }

  renderStories() {
    let stories = [];
    for (let i = this.state.userStories.length - 1; i >= 0; i--) {
      stories.push(
        <div className='col-12 col-md-6 col-lg-4 mb-3' key={i}>
          <Story story={this.state.userStories[i]} />
        </div>
      );
    }
    return stories;
  }

  changeTab(e) {
    if (e.target.classList.contains('stories')) {
      this.setState({ selectedTab: 0 });
    } else {
      this.setState({ selectedTab: 1 });
      if (
        this.state.userPosts.posts.length == 0 &&
        this.state.user.info.is_private == false &&
        this.state.isLoadingPosts == false
      ) {
        // this.getUserPosts();
      }
    }
  }

  getUserPosts() {
    this.setState({ isFirstLoadPosts: false });
    this.setState({ isLoadingPosts: true });
    let id = this.state.user.info.pk;
    if (this.state.user.info.pk.length > 20) {
      id = this.state.user.info.id;
    }
    axios
      .get(
        `${location.origin}/api/posts/${this.state.user.info.pk}?_username=${
          this.state.user.info.username
        }${
          this.state.userPosts.nextMaxId
            ? `&nextMaxId=${this.state.userPosts.nextMaxId}`
            : ''
        }`
      )
      .then((response) => {
        if (response.data.status == 1) {
          response.data.posts.unshift(...this.state.userPosts.posts);
          this.setState({ userPosts: response.data });
          // console.log(this.state.userPosts);
        }
        this.setState({ isLoadingPosts: false });
      })
      .catch((error) => {
        console.log(error);
      });
  }

  async getUserStories() {
    this.setState({ isFirstLoadStories: false });
    this.setState({ isLoadingStories: true });
    for (let i = 0; i < 2; i++) {
      try {
        const response = await axios.get(
          `${location.origin}/api/stories/${this.state.user.info.pk}?_username=${this.state.user.info.username}`
        );
        if (response.data.status == 1) {
          this.setState({ userStories: response.data.stories });
          break;
        } else if (response.data.status == 0) {
          break;
        }
      } catch (e) {
        console.log(e);
      }
    }
    this.setState({ isLoadingStories: false });
  }

  renderUserPosts() {
    let posts = [];
    for (let i = 0; i < this.state.userPosts.posts.length; i++) {
      posts.push(<Post key={i + 1} post={this.state.userPosts.posts[i]} />);
    }
    return (
      <div className='col-12'>
        <ResponsiveMasonry columnsCountBreakPoints={{ 350: 1, 750: 2, 900: 3 }}>
          <Masonry>{posts}</Masonry>
        </ResponsiveMasonry>
      </div>
    );
  }

  renderLoadingPosts() {
    if (this.state.isLoadingPosts) {
      return (
        <div className='col-12 text-center mt-2'>
          <p>Please wait...</p>
        </div>
      );
    }
    if (this.state.userPosts.posts.length == 0) {
      return (
        <div className='col-12 text-center' key={0}>
          There is no post.
        </div>
      );
    }
    if (this.state.userPosts.nextMaxId) {
      return (
        <div className='col-12 text-center mt-2'>
          <button className='load-more-btn' onClick={this.getUserPosts}>
            LOAD MORE
          </button>
        </div>
      );
    }
    return '';
  }

  renderLoadingStories() {
    if (this.props.isGoogleBot) {
      return '';
    }
    if (this.state.isLoadingStories) {
      return (
        <div className='col-12 text-center mt-2'>
          <p>Please wait...</p>
        </div>
      );
    } else if (this.state.userStories.length == 0) {
      return (
        <div className='col-12 text-center mt-2'>
          <p>There is no story in last 24 hours.</p>
        </div>
      );
    }
    return '';
  }

  render() {
    if (this.state.cached) {
      this.setState({ cached: false });
      return '';
    }
    return (
      <MainLayout>
        <Head>
          <title>{`Download Instagram Stories of ${this.state.user.info.full_name} (@${this.state.user.info.username}) - StoriesDown`}</title>
          <meta
            name='description'
            content={`View and download Instagram Stories photos and videos of ${this.state.user.info.full_name} (@${this.state.user.info.username}).`}
          />
        </Head>

        <div className='hero'>
          <Header />
          <div className='container'>
            <div className='row'>
              <div className='col-12 text-center'>
                <SearchField error={false} />
              </div>
            </div>
          </div>

          <div className='container hero-content'>
            <div className='row'>
              <div className='col-12'>
                {this.state.user.info.profile_pic_url && (
                  <UserInfo userInfo={this.state.user.info} />
                )}
                <div className='ads-container mb-2'>
                  {this.props.s && (
                    <AdSense.Google
                      client='ca-pub-9461418923686817'
                      slot='7570197868'
                      style={{
                        display: 'block',
                        width: '100%',
                        textAlign: 'center',
                      }}
                      format='auto'
                      responsive='true'
                    />
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className='white-bg'>
          <div className='container pb-5'>
            <div className='row'>
              <div className='col-6 pr-0'>
                <div
                  className={`tab-title stories mb-3 ${
                    0 == this.state.selectedTab ? 'selected' : ''
                  }`}
                  onClick={(e) => this.changeTab(e)}
                >
                  Stories
                </div>
              </div>
              <div className='col-6 pl-0'>
                <div
                  className={`tab-title posts mb-3 ${
                    1 == this.state.selectedTab ? 'selected' : ''
                  }`}
                  onClick={(e) => this.changeTab(e)}
                >
                  Posts
                </div>
              </div>
            </div>
            <div className='ads-container mb-2'>
              <AdSense.Google
                client='ca-pub-9461418923686817'
                slot='7570197868'
                style={{
                  display: 'block',
                  width: '100%',
                  textAlign: 'center',
                }}
                format='auto'
                responsive='true'
              />
            </div>

            <div className={0 == this.state.selectedTab ? 'row' : 'd-none'}>
              {this.renderStories()}
              {this.renderLoadingStories()}
            </div>
            <div className={1 == this.state.selectedTab ? 'row' : 'd-none'}>
              {this.state.isFirstLoadPosts &&
                this.state.userPosts.posts.length == 0 &&
                this.state.user.info.is_private == false &&
                this.state.isLoadingPosts == false && (
                  <div className='col-12 text-center mt-2'>
                    <button
                      className='load-more-btn'
                      onClick={this.getUserPosts}
                    >
                      LOAD POSTS
                    </button>
                  </div>
                )}
              {(this.state.isFirstLoadPosts == false ||
                this.state.userPosts.posts.length > 0) &&
                this.renderUserPosts()}
              {(this.state.isFirstLoadPosts == false ||
                this.state.userPosts.posts.length > 0) &&
                this.renderLoadingPosts()}
            </div>
          </div>

          <div className='container pb-5'>
            <div className='row text-center'>
              <div className='col-12'>
                <BlogPostsSlider blogPosts={this.props.blogPosts} />
              </div>
            </div>
          </div>
        </div>
      </MainLayout>
    );
  }
}

User.getInitialProps = async function (context) {
  try {
    let { username, ss } = context.query;
    const origin = context.req
      ? 'http://localhost:3000'
      : 'https://storiesdown.com';

    const blogResponse = await axios.get(origin + '/assets/js/blog.json');
    // shuffleArray
    for (let i = blogResponse.data.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [blogResponse.data[i], blogResponse.data[j]] = [
        blogResponse.data[j],
        blogResponse.data[i],
      ];
    }
    let isGoogleBot = false;

    if (context.req) {
      if (context.req.headers['user-agent'].includes('Google')) {
        isGoogleBot = true;
      }
    }
    username = username.trim().toLowerCase();
    if (cookies(context)[username]) {
      console.log('cached: ', username);
      return {
        user: {
          info: {
            username,
          },
        },
        cached: cookies(context)[username],
        blogPosts: blogResponse.data,
      };
    }

    let userData = await (async () => {
      const response = await axios.get(
        origin +
          '/api/users/' +
          username +
          '?searchBy=username&key=storiesdown&isGoogleBot=' +
          isGoogleBot.toString()
      );
      return response.data;
    })();
    if (userData.status == 0) {
      return redirect(context, '/?error=1&username=' + username);
    } else if (userData.status == 2 && isGoogleBot == false) {
      return redirect(context, '/?error=2&username=' + username);
    }

    return {
      user: userData,
      userPosts: { posts: [] },
      isGoogleBot,
      blogPosts: blogResponse.data,
    };
  } catch (error) {
    return redirect(context, '/');
  }
};

export default User;
