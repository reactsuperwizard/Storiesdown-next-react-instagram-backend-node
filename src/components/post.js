import { Component, Fragment } from 'react';
import Modal from 'react-modal';
import downloader from '../helpers/downloader';
import Slider from 'react-slick';
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
    maxWidth: '500px',
    maxHeight: '90vh',
  },
};

class Post extends Component {
  constructor(props) {
    super(props);

    this.createPostCover = this.createPostCover.bind(this);
    this.createPost = this.createPost.bind(this);
    this.viewPost = this.viewPost.bind(this);
    this.closeModal = this.closeModal.bind(this);
    this.downloadResource = this.downloadResource.bind(this);

    this.state = {};
    this.state.modalIsOpen = false;
  }

  formatDate() {
    const d1 = new Date(this.props.post.taken_at * 1000);
    return (
      d1.toLocaleString('default', { month: 'short' }) +
      ' ' +
      (d1.getDate() < 10 ? '0' + d1.getDate() : d1.getDate()) +
      ', ' +
      d1.getFullYear() +
      ', ' +
      d1.toLocaleTimeString()
    );
  }

  formatCaption() {
    return this.props.post.caption_text
      .replace(/<[^>]*>/g, '')
      .split(' ')
      .map((word) => {
        if (word.trim()[0] === '@' && word.trim().length > 1) {
          try {
            let p = word.match(/[\w.]+/).toString();
            if (p[p.length - 1] === '.') {
              p = p.slice(0, -1);
            }
            return word.replace(/@[\w.]+/, `<a href=/users/${p}>@${p}</a>`);
          } catch (e) {
            // console.log('null: ', word);
            return word;
          }
        }
        return word;
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
        // .replace(/\i/g, String.fromCharCode(1110));
        // .replace(/\h/g, String.fromCharCode(1211));
      })
      .join(' ');
  }

  createPostCover() {
    const postCover = (coverImageUrl, iconUrl) => {
      return (
        <div className='post-cover p-1'>
          <LazyLoad>
            <img src={coverImageUrl} onClick={this.viewPost} />
          </LazyLoad>
          <div className='like-count'>
            <div
              className='caption-text p-2 mb-2'
              dangerouslySetInnerHTML={{ __html: this.formatCaption() }}
            />
            {/* <div>
              <img src='/assets/img/heart.png' />
              {this.props.post.like_count}
            </div> */}
            <div>{this.formatDate()}</div>
          </div>
          {/* <div className="post-icon">
            <img src={iconUrl} />
          </div> */}
        </div>
      );
    };

    if (this.props.post.media_type == 1) {
      return postCover(this.props.post.image_url, '/assets/img/image.png');
    } else if (this.props.post.media_type == 2) {
      return postCover(this.props.post.cover_url, '/assets/img/camera.png');
    } else if (this.props.post.media_type == 8) {
      if (this.props.post.carousel_media[0].media_type == 1) {
        return postCover(
          this.props.post.carousel_media[0].image_url,
          '/assets/img/album.png'
        );
      } else if (this.props.post.carousel_media[0].media_type == 2) {
        return postCover(
          this.props.post.carousel_media[0].cover_url,
          '/assets/img/album.png'
        );
      }
    }
  }

  createPost() {
    const post = (media) => {
      return (
        <Fragment>
          {media}
          <div
            className='caption-text'
            dangerouslySetInnerHTML={{ __html: this.formatCaption() }}
          />
          <div className='text-center post-text'>
            {/* <img src='/assets/img/heart_pink.png' />
            {this.props.post.like_count} */}
            <div className='date text-center'>{this.formatDate()}</div>
          </div>
        </Fragment>
      );
    };
    if (this.props.post.media_type == 1) {
      return post(
        <Fragment>
          <div className='text-center mb-2'>
            <img className='post-media' src={this.props.post.image_url} />
          </div>
          <div className='text-center'>
            <a
              href='#!'
              onClick={(e) =>
                this.downloadResource(e, this.props.post.image_url)
              }
            >
              DOWNLOAD
            </a>
          </div>
        </Fragment>
      );
    } else if (this.props.post.media_type == 2) {
      return post(
        <Fragment>
          <div className='text-center mb-2'>
            <video
              className='post-media'
              controls
              poster={this.props.post.cover_url}
              src={this.props.post.video_url}
            />
          </div>
          <div className='text-center'>
            <a
              href='#!'
              onClick={(e) =>
                this.downloadResource(e, this.props.post.video_url)
              }
            >
              DOWNLOAD
            </a>
          </div>
        </Fragment>
      );
    } else if (this.props.post.media_type == 8) {
      let settings = {
        dots: true,
        speed: 500,
        slidesToShow: 1,
        infinite: false,
        className: 'custom-slick',
      };

      let carouselMedia = [];
      this.props.post.carousel_media.forEach((media) => {
        if (media.media_type == 1) {
          carouselMedia.push(
            <div key={media.id}>
              <div className='text-center mb-2'>
                <img className='post-media mx-auto' src={media.image_url} />
              </div>
              <div className='text-center'>
                <a
                  href='#!'
                  onClick={(e) => this.downloadResource(e, media.image_url)}
                >
                  DOWNLOAD
                </a>
              </div>
            </div>
          );
        } else if (media.media_type == 2) {
          carouselMedia.push(
            <div key={media.id}>
              <div className='text-center mb-2'>
                <video
                  className='post-media'
                  controls
                  poster={media.cover_url}
                  src={media.video_url}
                />
              </div>
              <div className='text-center'>
                <a
                  href='#!'
                  onClick={(e) => this.downloadResource(e, media.video_url)}
                >
                  DOWNLOAD
                </a>
              </div>
            </div>
          );
        }
      });
      return post(
        <Fragment>
          <Slider {...settings}>{carouselMedia}</Slider>
        </Fragment>
      );
    }
  }

  viewPost() {
    this.setState({ modalIsOpen: true });
  }

  closeModal() {
    this.setState({ modalIsOpen: false });
  }

  downloadResource(e, url) {
    e.preventDefault();
    url = url.replace('/images/', '/download/');
    url = url.replace('/videos/', '/download/');

    window.location = url;
  }

  render() {
    return (
      <div className='text-center'>
        <Modal
          isOpen={this.state.modalIsOpen}
          style={customStyles}
          onRequestClose={this.closeModal}
          contentLabel='Post Modal'
        >
          <div className='close-modal' onClick={this.closeModal}>
            CLOSE
          </div>
          {this.createPost()}
        </Modal>
        {this.createPostCover()}
      </div>
    );
  }
}

export default Post;

