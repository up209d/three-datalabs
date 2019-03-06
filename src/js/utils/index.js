import basename from 'base.config';
// import cookie from 'cookie';
import _ from 'lodash';
import axios from 'axios';

import actions from 'js/actions';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

const utils = {
  generateUID: function() {
    let counter = 0;
    return function(prefix) {
      return (prefix || 'uid') + '--' + counter++;
    }
  },
  toggleClassNames: (object = {}) => {
    let classNames = [];
    if (object instanceof Array) {
      classNames = object.map(function(key){
        if (key) {
          return key;
        }
      });
      return classNames.join(' ');
    } else {
      classNames = Object.keys(object).map(function(key){
        if (object[key]) {
          return key;
        }
      });
      return classNames.join(' ');
    }
  },
  ..._,
  getAllStates: function(additionalData) {
    return state => ({
      ...state
    })
  },
  getAllActions: function() {
    return dispatch => ({
      storeDispatch: dispatch,
      ...bindActionCreators(actions,dispatch)
    })
  },
  getConnectAllStateActions: function(Component) {
    return connect(utils.getAllStates(),utils.getAllActions())(Component);
  },
  createFetch: function(auth = {}) {
    let currentOptions = process.env.BROWSER ?
      {
        baseURL: basename,
        headers: {
          Authorization: auth.token ? 'Bearer ' + auth.token : ''
        }
      } : {
        baseURL: 'http://localhost:' + __BASE_PORT__ + basename,
        headers: {
          Cookie: (auth.session && auth.token) ? `connect.sid=${encodeURIComponent(auth.session)};token=${encodeURIComponent(auth.token)}` : '',
          Authorization: auth.token ? 'Bearer ' + auth.token : ''
        }
      };

    return (options) => {
      return axios({
        ...currentOptions,
        ...options
      });
    }
  },
  whenAllPromisesFinish: function(promises,cb) {
    return new Promise(resolve => {
      let count = promises.length;
      let results = [];
      if (count) {
        promises.forEach((promise,index) => {
          promise.then((response)=>{
            results[index] = cb ? cb(response) : response;
            count--;
            if (count === 0) {
              resolve(results);
            }
          }).catch((err)=>{
            results[index] = cb ? cb(err.response) : err.response;
            count--;
            if (count === 0) {
              resolve(results);
            }
          });
        })
      } else {
        resolve(null);
      }
    })
  }
};

export default utils