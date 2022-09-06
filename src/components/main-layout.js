import { Component, Fragment } from 'react';
import Head from 'next/head';

import Footer from './footer';
import NextNprogress from 'nextjs-progressbar';

class MainLayout extends Component {
  constructor(props) {
    super(props);
  }

  componentDidMount() {
    const installGoogleAds = () => {
      const elem = document.createElement('script');
      elem.src = '//pagead2.googlesyndication.com/pagead/js/adsbygoogle.js';
      elem.async = true;
      elem.defer = true;
      elem.setAttribute('data-ad-client', 'ca-pub-9461418923686817');
      document.head.appendChild(elem);
    };
    installGoogleAds();
  }

  render() {
    return (
      <Fragment>
        <Head>
          <meta charSet='utf-8' />
          <meta name='viewport' content='width=device-width, initial-scale=1' />
          <meta
            httpEquiv='Content-Security-Policy'
            content="default-src * self blob: data: gap:; style-src * self 'unsafe-inline' blob: data: gap:; script-src * 'self' 'unsafe-eval' 'unsafe-inline' blob: data: gap:; object-src * 'self' blob: data: gap:; img-src * self 'unsafe-inline' blob: data: gap:; connect-src self * 'unsafe-inline' blob: data: gap:; frame-src * self blob: data: gap:;"
          />
          <link rel='shortcut icon' href='/favicon.ico' type='image/x-icon' />
          <link rel='icon' href='/favicon.ico' type='image/x-icon' />
          <link
            rel='stylesheet'
            href='https://cdnjs.cloudflare.com/ajax/libs/twitter-bootstrap/4.1.3/css/bootstrap.min.css'
          />
        </Head>
        <NextNprogress color='#3df711' />

        {this.props.children}
        <Footer />
      </Fragment>
    );
  }
}

export default MainLayout;
