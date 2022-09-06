import { Component } from 'react';
import Link from 'next/link';
import downloader from '../helpers/downloader';

class HashTagInfo extends Component {
  constructor(props) {
    super(props);
    console.log(props);
  }
  formatNumber(num) {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  }

  render() {
    return (
      <div className='text-center text-lg-left d-block d-lg-flex justify-content-center align-items-center'>
        <div className='text-center mb-2 mx-4'>
          <img className='profile-pic' src={this.props.pictureUrl} />
        </div>

        <div className='user-info'>
          <p className='name'>{this.props.name}</p>
          <p>{this.formatNumber(this.props.count)} posts</p>
        </div>
      </div>
    );
  }
}

export default HashTagInfo;

