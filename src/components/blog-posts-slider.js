import Slider from 'react-slick';
import { Component, Fragment } from 'react';
import LazyLoad from 'react-lazyload';
class BlogPostsSlider extends Component {
  constructor(props) {
    super(props);
    // console.log(props);
    this.changeSliderSettings = this.changeSliderSettings.bind(this);
    this.state = {};
  }

  componentDidMount() {
    this.changeSliderSettings();
    window.addEventListener('resize', this.changeSliderSettings.bind(this));
  }

  changeSliderSettings() {
    if (window.innerWidth < 768) {
      this.setState({
        sliderSettings: {
          dots: false,
          infinite: true,
          speed: 500,
          slidesToShow: 1,
          slidesToScroll: 1,
          lazyLoad: true,
        },
      });
    } else if (window.innerWidth < 1024) {
      this.setState({
        sliderSettings: {
          dots: false,
          infinite: true,
          speed: 500,
          slidesToShow: 3,
          slidesToScroll: 3,
          lazyLoad: true,
        },
      });
    } else {
      this.setState({
        sliderSettings: {
          dots: false,
          infinite: true,
          speed: 500,
          slidesToShow: 4,
          slidesToScroll: 4,
          lazyLoad: true,
        },
      });
    }
  }

  render() {
    let blogPosts = [];
    this.props.blogPosts.forEach((p, i) => {
      blogPosts.push(
        <div key={i}>
          <a className='blog-link' href={p.url}>
            <div className='blog-post-container'>
              <LazyLoad>
                <img className='thumbnail' src={p.thumbnail} />
              </LazyLoad>
              <div className='title'>{p.title}</div>
              <div className='short-desc'>{p.shortDesc}</div>
            </div>
          </a>
        </div>
      );
    });

    return (
      <Fragment>
        <Slider {...this.state.sliderSettings}>{blogPosts}</Slider>
        <div className='mt-3'>
          <a className='visit-blog-link mt-3' href='/blog'>
            VISIT OUR BLOG
          </a>
        </div>
      </Fragment>
    );
  }
}
export default BlogPostsSlider;
