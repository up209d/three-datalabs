import basename from 'base.config';
import {
  createBrowserHistory,
  createMemoryHistory,
  createHashHistory,
  createLocation,
  createPath
} from 'history';

// export const browserHistory = createBrowserHistory({
//   basename: basename
// });
//
// export const hashHistory = createHashHistory({
//   hashType: 'slash',
//   basename: basename
// });
//
// export const location = createLocation();
// export const memoryHistory = createMemoryHistory({ basename: basename });
// export const createPath = createPath({ basename: basename });

export default process.env.BROWSER ? createBrowserHistory({basename: basename}) : createLocation();