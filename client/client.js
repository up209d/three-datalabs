// Babel Polyfill for all dependencies importing
require('babel-polyfill');

// Require Global CSS (For Client Only)
require('scss/app.scss');

let ClientRouter = require('js/router').ClientRouter;

import storeGenerator from 'js/store';

const store = storeGenerator({
  auth: __USER__ || undefined,
  data: __DATA__ || undefined,
});

// React
import React from 'react';
import ReactDOM from 'react-dom';
import { AppContainer, hot, setConfig } from 'react-hot-loader';
setConfig({ logLevel: 'debug' });

// Material UI
// const createGenerateClassName = require('material-ui/styles').createGenerateClassName;
// const createGenerateClassName = () => {
//   let counter = 0;
//   return (rule, sheet) => {
//     console.log(sheet);
//     counter++;
//     console.log(counter);
//     return `custom--${rule.key}-${counter}`
//   }
// };
// let generateClassName = createGenerateClassName();

// RENDER CLIENT DOM
const DOMRendererCallback = ()=>{
  // When all DOM are rendered we shall removed the Sever-side MUI CSS here
  const jssStyles = document.getElementById('mui-css-server-side');
  if (jssStyles && jssStyles.parentNode) {
    jssStyles.parentNode.removeChild(jssStyles);
  }
  console.log('Server Side CSS is removed!')
};

const DOMRenderer = (Component) => {
  ReactDOM.hydrate(
    <AppContainer warnings={false}>
      <Component store={store}/>
    </AppContainer>
    ,document.getElementById('root'),DOMRendererCallback);
};

// FOR HOT MODULE REPLACEMENT
if (module.hot) {
  // Whenever a new version of App.js is available
  module.hot.accept('js/router', function () {
    console.log('[HMR]: replaced --> [Components]');
    ClientRouter = require('js/router').ClientRouter;
    setTimeout(()=>{
      DOMRenderer(ClientRouter);
    });
    // !!! IMPORTANT !!!
    // Force full reload permanent here
    // Disable it if you don't want
    console.log('!!!!! DO FULL RELOAD NOW!!!');
    window.location.reload();
  });
}

// PRELOAD FONTS
import WebFontLoader from 'webfontloader';
WebFontLoader.load({
  google: {
    families: ['Roboto:100, 300,400,900','Material Icons']
  },
  // custom: {
  //   families: ['Futura:100,200,300,400,500,600,700,800'],
  //   urls: [basename + '/assets/fonts/stylesheet.css']
  // },
  fontactive: (familyName, fvd) => {
    console.log(`${familyName} ${fvd} is loaded!`);
  },
  active: ()=>{
    // Make it run in queue so the unstyle content at flash wont show up
    DOMRenderer(ClientRouter);
    // Hide preload here, or can hide it somewhere after login check
    // document.getElementById('preload').setAttribute('class','hidden');
    console.log('All fonts are loaded!');
  }
});

