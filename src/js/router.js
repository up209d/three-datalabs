import React from 'react';

import { Provider } from 'react-redux';
import { HashRouter, StaticRouter } from 'react-router-dom';
import { ConnectedRouter } from 'react-router-redux';
import { JssProvider, jss } from 'react-jss/lib';

import basename from 'base.config';
import customHistory from './history';

import App from './components/App';

const createCustomGenerateClassName = (random = '') => {
  let counter = 0;
  return (rule, sheet) => {
    // console.log(counter);
    counter++;
    return `up-app-${random}-${rule.key}-${counter}`
  };
};

export const ClientRouter = props => {
  return (
    <Provider store={props.store}>
      <ConnectedRouter history={customHistory}>
        <JssProvider jss={jss} generateClassName={createCustomGenerateClassName()}>
          <App/>
        </JssProvider>
      </ConnectedRouter>
    </Provider>
  );
};

// Client Side Static App
export const AppHashRouter = (props) => {
  return (
    <Provider store={props.store}>
      <HashRouter basename={basename}>
        <JssProvider jss={jss} generateClassName={createCustomGenerateClassName()}>
          <App/>
        </JssProvider>
      </HashRouter>
    </Provider>
  )
};

export const ServerRouter = props => {
  return (
    <Provider store={props.store}>
      <StaticRouter basename={basename} location={props.location} context={props.context}>
        <JssProvider jss={jss} registry={props.registry} generateClassName={createCustomGenerateClassName()}>
          <App/>
        </JssProvider>
      </StaticRouter>
    </Provider>
  );
};
