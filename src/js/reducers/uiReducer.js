import actionTypes from 'js/actionTypes';
import { createMuiTheme } from 'material-ui';
import themes from 'js/themes';

export const uiInitialState = {
  theme: createMuiTheme(themes.default),
  breakpoint: 'md',
  alert: {
    type: null,
    message: null
  },
  threeRenderer: {
    step: 0,
    limit: 5
  }
};

export const ui = function(state = uiInitialState,action) {
  switch (action.type) {
    case actionTypes.UPDATE_BREAKPOINT: {
      return {
        ...state,
        breakpoint: action.payload
      }
    }

    case actionTypes.ALERT_WARNING: {
      return {
        ...state,
        alert: {
          ...action.payload
        }
      };
    }

    case actionTypes.ALERT_SUCCESS: {
      return {
        ...state,
        alert: {
          ...action.payload
        }
      };
    }

    case actionTypes.ALERT_CLEAR: {
      return {
        ...state,
        alert: {
          ...action.payload
        }
      };
    }

    case actionTypes.THREE_RENDERER_CHANGE_STEP: {
      return {
        ...state,
        threeRenderer: {
          ...state.threeRenderer,
          step: action.payload
        }
      }
    }

    default: {
      return state;
    }
  }
};