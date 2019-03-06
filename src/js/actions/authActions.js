import * as uiActions from './uiActions';
import actionTypes from 'js/actionTypes';
import utils from 'js/utils';

function userLoginRequest(payload) {
  return {
    type: actionTypes.USER_LOGIN_REQUEST,
    payload
  }
};

function userLoginSuccess(payload) {
  return {
    type: actionTypes.USER_LOGIN_SUCCESS,
    payload
  }
};

function userLoginFailure(payload) {
  return {
    type: actionTypes.USER_LOGIN_FAILURE,
    payload
  }
};

function userLogoutRequest(payload) {
  return {
    type: actionTypes.USER_LOGOUT_REQUEST,
    payload
  }
};

function userLogoutSuccess(payload) {
  return {
    type: actionTypes.USER_LOGOUT_SUCCESS,
    payload
  }
};

function userLogoutFailure(payload) {
  return {
    type: actionTypes.USER_LOGOUT_FAILURE,
    payload
  }
};

function userCheckRequest(payload) {
  return {
    type: actionTypes.USER_CHECK_REQUEST,
    payload
  }
};

function userCheckSuccess(payload) {
  return {
    type: actionTypes.USER_CHECK_SUCCESS,
    payload
  }
};

function userCheckFailure(payload) {
  return {
    type: actionTypes.USER_CHECK_FAILURE,
    payload
  }
};

export function userLogin(user,pwd) {
  return (dispatch,getState) => {
    const state = getState();
    const request = utils.createFetch()({
      url: '/auth',
      contentType: 'application/x-www-form-urlencoded; charset=UTF-8',
      method: 'POST',
      data: {
        user: user,
        pwd: pwd
      }
    });
    dispatch(userLoginRequest());

    request.then(res => {
      // !!! IMPORTANT !!!
      // JWT is created but not ready to use in 1 second, // See /authentication.js
      // We have to deffer this dispatch otherwise the request wont work
      setTimeout(()=>{
        console.log('Logged In!!!');
        dispatch(userLoginSuccess({
          ...res.data
        }));
        dispatch(uiActions.alertClear());
      },1111);
    }).catch(err => {
      console.log('Not Logged In!!!',err);
      dispatch(userLoginFailure());
      dispatch(uiActions.alertWarning('Something went wrong, please check your username/password.'));
    });

    return request;
  }
}

export function userCheck() {
  return (dispatch,getState) => {
    const state = getState();
    const request = utils.createFetch(state.auth)({
      url: '/check',
      method: 'GET'
    });
    dispatch(userCheckRequest());
    request.then(res => {
      dispatch(userCheckSuccess({
        ...res.data
      }));
    }).catch(err => {
      dispatch(userCheckFailure());
    });

    return request;
  }
}


export function userLogout() {
  return (dispatch,getState) => {
    const state = getState();
    const request = utils.createFetch(state.auth)({
      url: '/logout',
      method: 'GET'
    });
    dispatch(userLogoutRequest());
    request.then(res => {
      dispatch(userLogoutSuccess({
        ...res.data
      }));
      dispatch(uiActions.alertSuccess('User is logged out successfully!!!'));
    }).catch(err => {
      dispatch(userLogoutFailure());
      dispatch(uiActions.alertClear());
    });

    return request;
  }
}