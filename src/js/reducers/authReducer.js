import actionTypes from 'js/actionTypes';

export const authInitialState = {
  isLoggedIn: false,
  isRequesting: false,
  user: null
};

export const auth = function(state = authInitialState,action) {
  switch (action.type) {
    case actionTypes.USER_LOGIN_REQUEST: {
      return {
        ...state,
        ...action.payload,
        isRequesting: true,
        isLoggedIn: false
      };
    }

    case actionTypes.USER_LOGIN_SUCCESS: {
      return {
        ...state,
        ...action.payload,
        isRequesting: false,
        isLoggedIn: true
      };
    }

    case actionTypes.USER_LOGIN_FAILURE: {
      return {
        ...state,
        ...action.payload,
        isRequesting: false,
        isLoggedIn: false
      };
    }

    case actionTypes.USER_LOGOUT_REQUEST: {
      return {
        ...state,
        ...action.payload,
        isRequesting: true
      }
    }

    case actionTypes.USER_LOGOUT_SUCCESS: {
      return {
        ...state,
        ...action.payload,
        isRequesting: false,
        isLoggedIn: false,
        user: null,
        cookie: null
      }
    }

    case actionTypes.USER_LOGOUT_FAILURE: {
      return {
        ...state,
        ...action.payload,
        isRequesting: false
      }
    }

    case actionTypes.USER_CHECK_REQUEST: {
      return {
        ...state,
        ...action.payload,
        isRequesting: true
      }
    }

    case actionTypes.USER_CHECK_SUCCESS: {
      return {
        ...state,
        ...action.payload,
        isLoggedIn: true,
        isRequesting: false
      }
    }

    case actionTypes.USER_CHECK_FAILURE: {
      return {
        ...state,
        ...action.payload,
        isLoggedIn: false,
        isRequesting: false
      }
    }

    default: {
      return state;
    }
  }
};