import * as ui from './uiActions';
import * as auth from './authActions';
import * as data from './dataActions';

export default {
  ...ui,
  ...auth,
  ...data
}
