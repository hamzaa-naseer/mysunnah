// ** React Import
import React from 'react';

// ** Next Import
import { Html, Head, Main, NextScript } from 'next/document';


const CustomDocument = () => {
  const setInitialTheme = `
    function getUserPreference() {
      if (window.localStorage.getItem('theme')) {
        return window.localStorage.getItem('theme');
      }
      return window.matchMedia('(prefers-color-scheme: dark)').matches
        ? 'dark'
        : 'light';
    }
    document.body.dataset.theme = getUserPreference();
  `;


  return (
    <Html lang='en' version='2.1.8' >
      <Head>
        <link rel='preconnect' href='https://fonts.googleapis.com' />
        <link rel='preconnect' href='https://fonts.gstatic.com' />
        <link rel='apple-touch-icon' sizes='180x180' href='/images/apple-touch-icon.png' />
        <script type="text/javascript" src="https://cdnjs.cloudflare.com/ajax/libs/mathjax/2.7.5/MathJax.js?config=TeX-MML-AM_CHTML"></script>
        {/* set your adsense script url here */}
        {/* <!-- <script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-9667891148162497" crossorigin="anonymous"></script> --> */}
      </Head>
      <body>
        {/* <script dangerouslySetInnerHTML={{ __html: setInitialTheme }} /> */}
        <Main />
        <NextScript />
      </body>
    </Html>
  );
};

export default CustomDocument;

