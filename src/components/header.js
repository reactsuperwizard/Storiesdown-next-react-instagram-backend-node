import { Component } from 'react';
import Link from 'next/link';

class Header extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <header className='py-5'>
        <div className='container'>
          <div className='row'>
            <div className='col-12 d-block d-md-flex justify-content-between align-items-center text-center'>
              <div>
                {/* <Link href="/">
                  <img className="logo-img" src="/assets/img/logo.png" />
                </Link> */}
                <a href='/'>
                  <img className='logo-img' src='/assets/img/logo.png' />
                </a>
              </div>
              <div className='desktop-menu d-none d-md-block'>
                <a className='ml-3' href='/'>
                  HOMEPAGE
                </a>
                <a className='ml-3' href='/blog'>
                  BLOG
                </a>
                <a className='ml-3' href='/remove-content'>
                  REMOVE CONTENT
                </a>
                <a className='ml-3' href='mailto:storiesdown.com@gmail.com'>
                  CONTACT US
                </a>
              </div>
              <div className='mobile-menu d-block d-md-none'>
                <nav>
                  <input type='checkbox' id='nav' className='hidden' />
                  <label htmlFor='nav' className='nav-open'>
                    <i></i>
                    <i></i>
                    <i></i>
                  </label>
                  <div className='nav-container'>
                    <ul>
                      <li>
                        <a href='/'>HOMEPAGE</a>
                      </li>
                      <li>
                        <a href='/blog'>BLOG</a>
                      </li>
                      <li>
                        <a href='/remove-content'>REMOVE CONTENT</a>
                      </li>
                      <li>
                        <a href='mailto:contact.storiesdown@gmail.com'>
                          CONTACT US
                        </a>
                      </li>
                    </ul>
                  </div>
                </nav>
              </div>
            </div>
          </div>
        </div>
      </header>
    );
  }
}

export default Header;
