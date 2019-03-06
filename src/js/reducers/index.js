import { combineReducers } from 'redux';
import { routerReducer } from 'react-router-redux';

import { ui,    uiInitialState } from './uiReducer';
import { auth,  authInitialState } from './authReducer';
import { data,  dataInitialState } from './dataReducer';

export const appReducers = combineReducers({
  ui,
  auth,
  data,
  routing: routerReducer
});

export const initialStates = {
  ui:   uiInitialState,
  auth: authInitialState,
  data: dataInitialState
};
