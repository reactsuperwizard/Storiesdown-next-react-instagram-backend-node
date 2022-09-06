import { Component, Fragment } from 'react';

class Footer extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <Fragment>
        <footer className='py-5 text-center text-small'>
          <div className='container'>
            <p>Copyright © 2020 StoriesDown. All rights reserved.</p>
            <p>
              StoriesDown is not affiliated with Instagram. We do not host any
              of the Instagram Stories on our servers, all rights belong to
              their respective owners.
            </p>
            <ul className='list-inline'>
              <li className='list-inline-item'>
                <a href='/'>Homepage</a>
              </li>
              <li className='list-inline-item'>
                <a href='/blog'>Blog</a>
              </li>
              <li className='list-inline-item'>
                <a href='/privacy-policy'>Privacy Policy</a>
              </li>
              <li className='list-inline-item'>
                <a href='/terms-and-conditions'>Terms and Conditions</a>
              </li>
              <li className='list-inline-item'>
                <a href='/remove-content'>Remove Content</a>
              </li>
              <li className='list-inline-item'>
                <a href='mailto:contact.storiesdown@gmail.com'>Contact Us</a>
              </li>
            </ul>
          </div>
        </footer>
        <div id='waldo-tag-9485'></div>
      </Fragment>
    );
  }
}

export default Footer;

