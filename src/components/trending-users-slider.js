import Slider from 'react-slick';
import { Component, Fragment } from 'react';

class TrendingUsersSlider extends Component {
  constructor(props) {
    super(props);

    this.changeSliderSettings = this.changeSliderSettings.bind(this);
    this.state = {};
    // this.state.sliderSettings = {
    //   dots: false,
    //   // infinite: true,
    //   speed: 500,
    //   lazyLoad: true,
    //   variableWidth: true,
    //   // centerMode: true,
    //   // slidesToShow: 4,
    //   slidesToScroll: 4,
    // };
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
          speed: 500,
          slidesToShow: 2,
          slidesToScroll: 2,
          lazyLoad: true,
        },
      });
    } else if (window.innerWidth < 1024) {
      this.setState({
        sliderSettings: {
          dots: false,
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
          speed: 500,
          slidesToShow: 5,
          slidesToScroll: 2,
          lazyLoad: true,
        },
      });
    }
  }

  render() {
    let userAvatars = [];
    this.props.users.forEach((user, i) => {
      userAvatars.push(
        <div className='avatar' key={i}>
          <a href={`/users/${user.username}`}>
            <img
              className='profile-pic small mb-1'
              src={user.profile_pic_url}
            />
            <div>{user.full_name}</div>
            <div>{user.username}</div>
          </a>
        </div>
      );
    });

    return (
      <div className='trending-user'>
        <Slider {...this.state.sliderSettings}>{userAvatars}</Slider>
      </div>
    );
  }
}
export default TrendingUsersSlider;
