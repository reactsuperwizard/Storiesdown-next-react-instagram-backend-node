import { Component } from 'react';
import Link from 'next/link';
import Modal from 'react-modal';
import downloader from '../helpers/downloader';
import AdSense from 'react-adsense';
import LazyLoad from 'react-lazyload';

Modal.setAppElement('#__next');

const customStyles = {
  content: {
    top: '50%',
    left: '50%',
    right: 'auto',
    bottom: 'auto',
    marginRight: '-50%',
    transform: 'translate(-50%, -50%)',
    textAlign: 'center',
  },
};

class UserInfo extends Component {
  constructor(props) {
    super(props);
    this.viewProfilePicture = this.viewProfilePicture.bind(this);
    this.closeModal = this.closeModal.bind(this);

    this.state = {};
    this.state.modalIsOpen = false;
  }

  formatNumber(num) {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  }

  viewProfilePicture() {
    this.setState({ modalIsOpen: true });
  }

  closeModal() {
    this.setState({ modalIsOpen: false });
  }

  render() {
    return (
      <div className='text-center text-lg-left d-block d-lg-flex justify-content-center align-items-center'>
        <Modal
          isOpen={this.state.modalIsOpen}
          style={customStyles}
          onRequestClose={this.closeModal}
          contentLabel='Profile Picture Modal'
        >
          <div className='mb-2'>
            <img
              className='profile-pic-full-size'
              src={this.props.userInfo.profile_pic_url_hd}
            />
          </div>

          <a
            href='#!'
            onClick={(e) =>
              downloader(e, this.props.userInfo.profile_pic_url_hd)
            }
          >
            DOWNLOAD
          </a>
        </Modal>
        <div className='text-center mb-2 mx-4'>
          {/* <Link
            href="/users/[username]"
            as={`/users/${this.props.userInfo.username}`}
          >
            <img
              className="profile-pic"
              src={this.props.userInfo.profile_pic_url}
            />
          </Link> */}
          <a href={`/users/${this.props.userInfo.username}`}>
            <LazyLoad>
              <img
                className='profile-pic'
                src={
                  'https://cdn' +
                  ['', '2', '3'][Math.floor(Math.random() * 3)] +
                  '.storiesdown.com/images/?url=' +
                  encodeURIComponent(
                    Buffer.from(this.props.userInfo.profile_pic_url).toString(
                      'base64'
                    )
                  )
                }
              />
            </LazyLoad>

            {/* <div
              className='profile-pic-bg'
              style={{
                backgroundImage: `url(${this.props.userInfo.profile_pic_url})`,
              }}
            ></div> */}
          </a>
          {/* {this.props.userInfo.profile_pic_url_hd ? (
            <div
              className='view-profile-picture'
              onClick={this.viewProfilePicture}
            >
              View profile picture full size
            </div>
          ) : (
            ''
          )} */}
        </div>

        <div className='user-info'>
          <p className='name'>
            {this.props.userInfo.full_name + ' '}
            {/* <Link
              href="/users/[username]"
              as={`/users/${this.props.userInfo.username}`}
            >
              <span>{"@" + this.props.userInfo.username}</span>
            </Link> */}
            <a href={`/users/${this.props.userInfo.username}`}>
              <span>{'@' + this.props.userInfo.username}</span>
            </a>
          </p>
          {/* <div className="mb-3">
            <AdSense.Google
              client="ca-pub-9461418923686817"
              slot="9830027130"
              style={{
                display: "block",
                width: "100%",
                textAlign: "center",
              }}
              format="auto"
              responsive="true"
            />
          </div> */}
          {this.props.userInfo.biography ? (
            <p
              dangerouslySetInnerHTML={{
                __html: this.props.userInfo.biography
                  // .replace(/\I/g, String.fromCharCode(1030))
                  // .replace(/\A/g, String.fromCharCode(1040))
                  // .replace(/\E/g, String.fromCharCode(1072))
                  // .replace(/\K/g, String.fromCharCode(1050))
                  // .replace(/\O/g, String.fromCharCode(1054))
                  // .replace(/\P/g, String.fromCharCode(1056))
                  // .replace(/\C/g, String.fromCharCode(1057))
                  // .replace(/\X/g, String.fromCharCode(1061))
                  // .replace(/\a/g, String.fromCharCode(1072))
                  // .replace(/\p/g, String.fromCharCode(1088))
                  // .replace(/\c/g, String.fromCharCode(1089))
                  // .replace(/\y/g, String.fromCharCode(1091))
                  // .replace(/\x/g, String.fromCharCode(1093))
                  // .replace(/\i/g, String.fromCharCode(1110))
                  // .replace(/\h/g, String.fromCharCode(1211))
                  .replace(/\n/g, '<br />')
                  .replace(/<[^>]*>/g, ''),
              }}
            ></p>
          ) : (
            ''
          )}

          {this.props.userInfo.media_count ? (
            <div className='user-info-count justify-content-center justify-content-lg-start'>
              <div className='num-count ml-lg-0'>
                {this.formatNumber(this.props.userInfo.media_count)}
                <br />
                <span>posts</span>
              </div>
              <div className='num-count'>
                {this.formatNumber(this.props.userInfo.follower_count)}
                <br />
                <span>followers</span>
              </div>
              <div className='num-count'>
                {this.formatNumber(this.props.userInfo.following_count)}
                <br />
                <span>following</span>
              </div>
            </div>
          ) : (
            ''
          )}
        </div>
      </div>
    );
  }
}

export default UserInfo;
