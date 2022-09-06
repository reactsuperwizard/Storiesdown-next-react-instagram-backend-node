import { Component } from 'react';
import LazyLoad from 'react-lazyload';

class Story extends Component {
  constructor(props) {
    super(props);

    this.createStory = this.createStory.bind(this);
    this.downloadResource = this.downloadResource.bind(this);
  }

  forceDownload(blob, filename) {
    let a = document.createElement('a');
    a.download = filename;
    a.href = blob;
    // For Firefox https://stackoverflow.com/a/32226068
    document.body.appendChild(a);
    a.click();
    a.remove();
  }

  downloadResource(e) {
    e.preventDefault();
    let url = (() => {
      if (this.props.story.media_type == 1) {
        return this.props.story.image_url.replace('/images/', '/download/');
      } else if (this.props.story.media_type == 2) {
        return this.props.story.video_url.replace('/videos/', '/download/');
      }
    })();

    // let filename = url.split('\\').pop().split('/').pop().split('?').shift();
    // fetch(url, {
    //   headers: new Headers({
    //     Origin: window.location.origin,
    //   }),
    //   mode: 'cors',
    // })
    //   .then((response) => response.blob())
    //   .then((blob) => {
    //     let blobUrl = window.URL.createObjectURL(blob);
    //     this.forceDownload(blobUrl, filename);
    //   })
    //   .catch((e) => console.error(e));

    window.location = url;
  }

  formatDate() {
    if (isNaN(this.props.story.taken_at)) {
      return this.props.story.taken_at;
    }
    const d1 = new Date(
      this.props.story.taken_at.toString().length > 10
        ? this.props.story.taken_at
        : this.props.story.taken_at * 1000
    );
    const d2 = new Date();
    let minutes = (d2 - d1) / (1000 * 60);
    if (minutes > 1440) {
      return (
        d1.toLocaleString('default', { month: 'short' }) +
        ' ' +
        (d1.getDate() < 10 ? '0' + d1.getDate() : d1.getDate()) +
        ', ' +
        d1.getFullYear() +
        ', ' +
        d1.toLocaleTimeString()
      );
    } else if (minutes < 1) {
      return 'A few seconds ago';
    }
    let hours = Math.floor(minutes / 60);
    minutes = Math.floor(minutes % 60);

    let hourStr = '';
    if (hours > 1) {
      hourStr = hours + ' hours';
    } else if (hours == 1) {
      hourStr = hours + ' hour';
    }

    let minuteStr = '';
    if (minutes > 1) {
      minuteStr = minutes + ' minutes';
    } else if (minutes == 1) {
      minuteStr = minutes + ' minute';
    }

    if (hours > 0 && minutes > 0) {
      hourStr += ' and ';
    }

    return hourStr + minuteStr + ' ago';
  }

  createStory() {
    if (this.props.story.media_type == 1) {
      return (
        <LazyLoad>
          <img className='story-img mb-2' src={this.props.story.image_url} />
        </LazyLoad>
      );
    } else if (this.props.story.media_type == 2) {
      return (
        <LazyLoad>
          <video
            controls
            preload='none'
            className='story-video mb-2'
            poster={this.props.story.cover_url}
            src={this.props.story.video_url}
          />
        </LazyLoad>
      );
    }
  }

  render() {
    return (
      <div className='text-center'>
        {this.createStory()}
        <a href='#!' onClick={this.downloadResource.bind(this)}>
          DOWNLOAD
        </a>
        {/* <div>{this.formatDate()}</div> */}
      </div>
    );
  }
}

export default Story;

