import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import '../../public/assets/css/style.css';
import Router from 'next/router';
import withGA from 'next-ga';
import TagManager from 'react-gtm-module';
import { useEffect } from 'react';
// import {Link} from "ss"
function App({ Component, pageProps }) {
  useEffect(() => {
    TagManager.initialize({
      gtmId: 'GTM-KZR37RC',
    });
  }, []);
  return <Component {...pageProps} />;
}

export default withGA('UA-169731965-1', Router)(App);
