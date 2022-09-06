import { Component } from 'react';
import MainLayout from '../components/main-layout';
import SearchField from '../components/search-field';
import BlogPostsSlider from '../components/blog-posts-slider';
// import TrendingUsersSlider from '../components/trending-users-slider';

import Header from '../components/header';
import Head from 'next/head';
import absoluteUrl from 'next-absolute-url';
import axios from 'axios';
import AdSense from 'react-adsense';

class Home extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <MainLayout>
        <Head>
          <title>Instagram Story Viewer & Downloader - StoriesDown</title>
          <meta
            name='description'
            content='Best Instagram story viewer! You can watch Instagram stories anonymously and quickly without the need to log in or having account.'
          />
        </Head>
        <div className='hero'>
          <Header />
          <div className='container hero-content'>
            <div className='row'>
              <div className='col-12 text-center'>
                <h3>Instagram Story Viewer & Downloader</h3>
                <p className='mb-5'>
                  Best Instagram story viewer! You can watch Instagram stories
                  anonymously and quickly without the need to log in or having
                  account.
                </p>
                <div className='ads-container mb-2'>
                  {this.props.s && (
                    <AdSense.Google
                      client='ca-pub-9461418923686817'
                      slot='8602148905'
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

                <SearchField
                  error={this.props.query.error}
                  value={this.props.query.username}
                />
                {/* <div className='mt-5'>
                  <TrendingUsersSlider users={this.props.trendingUsers} />
                </div> */}
              </div>
            </div>
          </div>
        </div>

        <div className='white-bg'>
          <div className='container'>
            <div className='row py-5 text-center'>
              <div className='col-12 col-md-4 mb-4'>
                <img className='feature-img' src='/assets/img/no_account.png' />
                <div className='feature-name'>No Need Instagram Account</div>
                <div>
                  View without login or install anything. Just enter Instagram
                  username you want to stalk.
                </div>
              </div>
              <div className='col-12 col-md-4 mb-4'>
                <img className='feature-img' src='/assets/img/anonymous.png' />
                <div className='feature-name'>Anonymous</div>
                <div>Nobody will know you are watching their stories.</div>
              </div>
              <div className='col-12 col-md-4 mb-4'>
                <img className='feature-img' src='/assets/img/download.png' />
                <div className='feature-name'>Download and Share</div>
                <div>
                  Save Instagram videos and photos in high resolution to your
                  devices.
                </div>
              </div>
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

Home.getInitialProps = async function (context) {
  const { origin } = absoluteUrl(context.req);
  const blogResponse = await axios.get(
    'http://localhost:3000' + '/assets/js/blog.json'
  );
  // shuffleArray
  for (let i = blogResponse.data.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [blogResponse.data[i], blogResponse.data[j]] = [
      blogResponse.data[j],
      blogResponse.data[i],
    ];
  }
  // // const trendingUsersResponse = await axios.get(
  // //   'http://localhost:3000' + '/api/trending-users'
  // // );
  // const shuffleTrendingUsers = trendingUsersResponse.data
  //   .sort(() => Math.random() - Math.random())
  //   .slice(0, 10);
  return {
    query: context.query,
    blogPosts: blogResponse.data,
  };
};
export default Home;
