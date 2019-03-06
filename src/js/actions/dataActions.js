import actionTypes from 'js/actionTypes';
import utils from 'js/utils';

export function getData(name){
  return (dispatch,getState) => {
    const state = getState();
    const request = utils.createFetch(state.auth)({
      url: '/data?type='+name,
      contentType: 'application/x-www-form-urlencoded; charset=UTF-8',
      method: 'GET'
    });

    dispatch({
      type: name + '_REQUEST'
    });

    request
      .then(res => {
        dispatch({
          type: name + '_SUCCESS',
          payload: res.data
        });
      })
      .catch(err => {
        dispatch({
          type: name + '_FAILURE'
        });
      });
    return request;
  }
}