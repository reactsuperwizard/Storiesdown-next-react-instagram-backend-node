import { Component } from 'react';
import MainLayout from '../../components/main-layout';
import Header from '../../components/header';
import Head from 'next/head';
import absoluteUrl from 'next-absolute-url';
import axios from 'axios';

class Blog extends Component {
  constructor(props) {
    super(props);
    this.renderPosts = this.renderPosts.bind(this);
  }

  renderPosts() {
    let posts = [];
    this.props.blogPosts.forEach((p, i) => {
      posts.push(
        <div className='col-12 col-md-6 col-lg-4 mb-3' key={i}>
          <a className='blog-link' href={p.url}>
            <div className='blog-post-container text-center'>
              <img className='thumbnail' src={p.thumbnail} />
              <div className='title'>{p.title}</div>
              <div className='short-desc'>{p.shortDesc}</div>
            </div>
          </a>
        </div>
      );
    });
    return posts;
  }

  render() {
    return (
      <MainLayout>
        <Head>
          <title>Blog - StoriesDown</title>
        </Head>
        <div className='hero'>
          <Header />
        </div>

        <div className='white-bg'>
          <div className='container'>
            <div className='row py-2'>
              <div className='col-12 text-center'>
                <h2>StoriesDown's Blog</h2>
              </div>
              {this.renderPosts()}
            </div>
          </div>
        </div>
      </MainLayout>
    );
  }
}

Blog.getInitialProps = async function (context) {
  const { origin } = absoluteUrl(context.req);
  const response = await axios.get(origin + '/assets/js/blog.json');
  return {
    blogPosts: response.data,
  };
};
export default Blog;
