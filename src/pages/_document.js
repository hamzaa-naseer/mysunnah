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

        {/* Font Awesome CSS - Multiple CDN fallbacks */}
        <link rel="stylesheet" href="https://use.fontawesome.com/releases/v6.4.0/css/all.css" crossOrigin="anonymous" />
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" integrity="sha512-iecdLmaskl7CVkqkXNQ/ZH/XLlvWZOJyj7Yy7tcenmpD1ypASozpmT/E0iPtmFIB46ZmdtAc9eNBvH0H/ZpiBw==" crossOrigin="anonymous" referrerPolicy="no-referrer" />

        {/* Alternative Font Awesome Kit - more reliable */}
        <script src="https://kit.fontawesome.com/a076d05399.js" crossOrigin="anonymous"></script>

        <script type="text/javascript" src="https://cdnjs.cloudflare.com/ajax/libs/mathjax/2.7.5/MathJax.js?config=TeX-MML-AM_CHTML"></script>

        {/* Font Awesome Fallback Check */}
        <script dangerouslySetInnerHTML={{
          __html: `
            window.addEventListener('load', function() {
              setTimeout(function() {
                // Check if Font Awesome is loaded
                var testElement = document.createElement('i');
                testElement.className = 'fas fa-heart';
                testElement.style.position = 'absolute';
                testElement.style.left = '-9999px';
                document.body.appendChild(testElement);

                var computedStyle = window.getComputedStyle(testElement, ':before');
                var content = computedStyle.getPropertyValue('content');

                if (content === 'none' || content === '') {
                  console.warn('Font Awesome not loaded, using fallbacks');
                  document.body.classList.add('fa-fallback');
                }

                document.body.removeChild(testElement);
              }, 100);
            });
          `
        }} />

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

