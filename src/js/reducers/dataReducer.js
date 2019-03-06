import actionTypes from 'js/actionTypes';

export const dataInitialState = {
  isDataFetching: false
};

export const data = function(state = dataInitialState,action) {
  switch (action.type) {
    case actionTypes.DATA_FOR_APP_REQUEST: {
      return {
        ...state,
        ...action.payload,
        isDataFetching: true
      }
    }
    case actionTypes.DATA_FOR_APP_SUCCESS: {
      return {
        ...state,
        ...action.payload,
        isDataFetching: false
      }
    }
    case actionTypes.DATA_FOR_APP_FAILURE: {
      return {
        ...state,
        ...action.payload,
        isDataFetching: false
      }
    }

    case actionTypes.DATA_FOR_LOGIN_REQUEST: {
      return {
        ...state,
        ...action.payload,
        isDataFetching: true
      }
    }
    case actionTypes.DATA_FOR_LOGIN_SUCCESS: {
      return {
        ...state,
        ...action.payload,
        isDataFetching: false
      }
    }
    case actionTypes.DATA_FOR_LOGIN_FAILURE: {
      return {
        ...state,
        ...action.payload,
        isDataFetching: false
      }
    }

    case actionTypes.DATA_FOR_HOME_REQUEST: {
      return {
        ...state,
        ...action.payload,
        isDataFetching: true
      }
    }
    case actionTypes.DATA_FOR_HOME_SUCCESS: {
      return {
        ...state,
        ...action.payload,
        isDataFetching: false
      }
    }
    case actionTypes.DATA_FOR_HOME_FAILURE: {
      return {
        ...state,
        ...action.payload,
        isDataFetching: false
      }
    }

    default: {
      return state;
    }
  }
};