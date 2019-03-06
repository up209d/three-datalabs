// Set ENVIRONMENT to DEVELOPMENT
process.env.NODE_ENV = 'production';

// FILE SYSTEM
import fs from 'fs';
const babelConfig = JSON.parse(fs.readFileSync('.babelrc'));

// Babel Register to enable Babel transform in all dependencies importing
import babelRegister from 'babel-register';
babelRegister(babelConfig);

// Babel Polyfill for all dependencies importing
require('babel-polyfill');

// BASE PATH OF APP
import path from 'path';
import basename from 'base.config';

// HOST CONFIG
import hostConfig from 'host.config';
import portFinder from 'portfinder';

// FILE TYPE CHECK
import getFileType from 'types.config';

// WEBPACK DEV
import webpack from 'webpack';
import webpackConfig from 'webpack.config.prod';

const compiler = webpack(webpackConfig);

// EXPRESS SERVER
import express from 'express';
import session from 'express-session';
import cookieParser from 'cookie-parser';
import expressJwt from 'express-jwt';
import basicAuth from 'basic-auth';

// API
import {authentication, checkAuthentication, dropAuthentication, getData} from 'api/authentication';

// UTILS
import utils from 'js/utils';

// INITIAL APP
const app = express();

// COMPILE WEBPACK
compiler.run((err,currentStats) => {
  
  // MAKE A REF LIST OF ASSETS REQUIRE IN SERVER SIDE
  let stats = currentStats.toJson();
  let currentModules = stats.modules;

  // Just need all module from of our src directory
  let srcModules = currentModules.filter(eachModule => {
    return typeof eachModule['id'] === 'string' &&
      eachModule['id'].indexOf('./src/') === 0 &&
      eachModule['source'].indexOf('module.exports') === 0
  });

  // Get References of all modules in our src folder
  // Key the References by module ID
  let srcModulesById = utils.keyBy(
   srcModules.map(srcModule => {
    // we need only the source & id
    let getSource = function() {
      let module = {};
      let __webpack_public_path__ = stats.publicPath;
      return srcModule['source'] ? eval(srcModule['source']) : null;
    };

    let id = srcModule.id;
    let source = getSource();
    let name = id.substring(id.lastIndexOf('/') + 1, id.length);
    // WEBPACK BUNDLED ASSETS FILE TYPE REFERENCES
    // let ext = source.indexOf('data:') !== -1 ? 'uri' : name.substring(name.lastIndexOf('.') + 1, name.length);
    // let fileType = getFileType(ext);
    // let contentType = fileType.contentType;

    return {
      id,
      name,
      // ext,
      // contentType,
      source,
      reasons: srcModule.reasons ? ( srcModule.reasons.length ? srcModule.reasons : [srcModule.reasons] ) : []
    }
  }),
  'id'
  );

  // Collect all Reason of UserRequest in each of our src Module
  let srcReasons = utils.flatten(srcModules.map(srcModule => {
    return srcModule.reasons.map(reason => {
      return {
        ...reason,
        sourceId: srcModule.id,
        sourceIdPath: path.resolve(srcModule.id),
        source: srcModulesById[srcModule.id].source,
        modulePath: path.resolve(reason.moduleName || reason.module)
      }
    })
  }));

  // Create a object reference key by the userRequest and the source context of that userRequest
  let srcReasonsByRequest = utils.keyBy(srcReasons,function(srcReason){
    return srcReason['userRequest'] + '-----' + srcReason['modulePath'];
  });

  // HACK THE REQUIRE BY STATS
  let Module = require('module');
  let _require = Module.prototype.require;
  Module.prototype.require = function() {
    // User Request
    let currentPath = arguments[0];
    // Module ID (Full Path)
    let contextId = this.id;
    try {
      // IF JS JSON, JUST RETURN A ORIGINAL REQUIRE
      return _require.call(this,arguments[0]);
    } catch (err) {
      // FALLBACK OF UNSUPPORT CASES ( NON JS & JSON FILES)
      // THE FALLBACK WILL RETURN THE ASSESTS PATH MATCHED WITH WEBPACK DOES IN THE BUNDLE
      // If we want to add hash on assets that we shall require in our app,
      // thus we cannot predict what the hash is
      // so by making the ref list here once for server initialize
      // we can easily access to the correct
      // assets path with no matter if the hash of the asset is changed

      // So we have currentPath as userRequest
      // and we have contextId as full path of the source context of this require
      let foundReason = srcReasonsByRequest[currentPath + '-----' + contextId];
      return foundReason ? foundReason['source'] : '';
    }
  };

  // !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
  // WEBPACK COMPILING DONE NOW WE CAN START APP
  // !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!

  // APP SESSION
  app.use(session({
    secret: hostConfig.secret,
    maxAge: hostConfig.globalMaxAge, // 2 weeks (fortnight) Session
    cookie: {
      maxAge: hostConfig.globalMaxAge, // expire the session(-cookie) after 2 weeks (fortnight)
      // If httpOnly set to true it won't let connect.sid can be accessed by client javascript
      // Only req on server can access to the cookie
      // Thus, if we need inject cookie for server-side ajax request, we have to make cookie from Redux store
      httpOnly: true,
      path: basename ? basename : '/'
    },
    resave: false,
    saveUninitialized: false
  }));

  app.use(cookieParser());

  // USER AUTHENTICATION
  app.use(basename + '/auth', express.json());
  app.use(basename + '/auth', express.urlencoded({extended: false})); // body-parser options
  app.use(basename + '/auth', authentication);

  app.use(basename + '/check', express.json());
  app.use(basename + '/check', express.urlencoded({extended: false})); // body-parser options
  app.use(basename + '/check',
    expressJwt({
      secret: hostConfig.secret
    }),
    // If the expressJwt return error, treat it here
    function (err, req, res, next) {
      if (err) {
        // console.log(err)
        return res.status(401).json({
          message: err.status + ': You have failed, invalid token!!!',
          session: req.session.id
        });
      } else {
        // If no error, next() to next middleware
        return next();
      }
    },
    checkAuthentication
  );

  app.use(basename + '/logout', express.json());
  app.use(basename + '/logout', express.urlencoded({extended: false})); // body-parser options
  app.use(basename + '/logout',
    expressJwt({
      secret: hostConfig.secret
    }),
    // If the expressJwt return error, treat it here
    function (err, req, res, next) {
      if (err) {
        // console.log(err)
        return res.status(401).json({
          message: err.status + ': You have failed, invalid token!!!',
          session: req.session.id
        });
      } else {
        // If no error, next() to next middleware
        return next();
      }
    },
    dropAuthentication
  );

  app.use(basename + '/data', express.json());
  app.use(basename + '/data', express.urlencoded({extended: false}));
  app.use(basename + '/data',
    expressJwt({
      secret: hostConfig.secret
    }),
    // Skip error from JwtExpress
    function (err, req, res, next) {
      return next();
    },
    getData
  );

  // MAKE SURE RESTFUL API ABOVE HAS TO ENDED UP WITH RESPONSE SENT
  // Dont use them with next() to fall down here

  // BASIC AUTHORIZATION
  // Put it after API Route because we gonna use BEARER AUTHORIZATION for API
  // And we gonna use Basic Authorization to access the server's assets
  // app.use(function(req,res,next){
  //   const credentials = basicAuth(req);
  //   if (
  //     !credentials ||
  //     credentials.name !== hostConfig.basicAuth.username ||
  //     credentials.pass !== hostConfig.basicAuth.password
  //   ) {
  //     res.setHeader('WWW-Authenticate', 'Basic realm="Basic Authorization Required"');
  //     return res.status(401).send('Unauthorized');
  //   } else {
  //     // console.log(credentials);
  //     return next();
  //   }
  // });

  // NO ACCESS TO MAIN.HTML REDIRECT BACK TO ROOT
  app.use(basename + '/main.html',function(req,res,next){
    res.redirect(basename ? basename : '/');
  });

  // SERVE SERVER STATIC ASSETS BY THIS ROUTE
  app.use(express.static('./dist',{index: null}));

  // OTHERWISE FALLBACK TO THE MAIN ROUTE HERE
  app.use((req, res, next) => {
    // Log the WebpackStats
    // console.log(res.locals.webpackStats);

    // REACT REACT DOM ROUTER REDUX
    const React = require('react');
    const ReactDOMServer = require('react-dom/server');
    const matchPath = require('react-router-dom').matchPath;

    // Read file main.html processed by Webpack HTML Plugin
    fs.readFile('./dist' + basename + '/main.html', 'utf-8',function(err,result) {
      if (err) {
        console.log(err);
        next(err);
        return res.status(401).set('content-type', 'text/html').send(err.stack).end();
      }
      // Basically, every code in ./src need to be updated in each request have to be required again and again here
      // We are doing this by the helping from the RemoveRequireCachePlugin we wrote in webpack configuration
      // if the code is changed and you didn't require it again, hence there will be error thrown or
      // a data from memory caching get in the way. But we need the code updated so we need to delete the require cache
      // and require it again to overwrite the memory cache.
      const routeConfig = require('js/routeConfig').default;

      // Redux Store Server Side
      const context = {};
      const actions = require('js/actions').default;
      const storeGenerator = require('js/store').default;

      // Material UI SSR
      const SheetsRegistry = require('react-jss').SheetsRegistry;
      let registry = new SheetsRegistry();

      // React Router Server Side
      const ServerRouter = require('js/router').ServerRouter;
      const randomSeed = Math.random().toString(36).substring(0,5);

      // Inject Cookie / Session to Store in preloadedState
      let store = storeGenerator({
        auth: {
          ...require('js/reducers').initialStates.auth,
          session: req.cookies['connect.sid'],
          token: req.cookies['token'],
          randomSeed: '' // randomSeed
        }
      });

      // !!! IMPORTANT !!!
      // THE USER AUTHENTICATION CHECK DATA
      // The very first data we need to fetch from our server is the user authentication
      // To see whether user is logged in or not, also to retrieve user information
      // After that a store and routeConfig will be create based on the user information from checking request
      // When store have the session/cookie info, we can inject those info to each ajax request
      // Thus, we can call action thunks from both client and server and still have them with same behaviors
      // basically for every request, here we shall check user login status
      store
        .dispatch(actions.userCheck())
        .then(initRender,initRender);

      // Create Store and Render ReactDOM Server content and send Response out here
      function initRender() {
        let allFetchPromises = [
          // DATA: COMMONS DATA FOR THE APP
          // in some simple app, we might need to call all data for one time only
          // thus, DATA_FOR_APP will be very suitable
          store.dispatch(actions.getData('DATA_FOR_APP'))
        ];

        routeConfig(store.getState().auth.isLoggedIn).some(route => {
          const match = matchPath(req.path, route);
          if (match && !!route.loadData) {
            // DATA: DATA FOR EACH ROUTE
            // in complex app, each route is a small app in our whole app
            // thus, it might need special data for only it
            // calling Data for Route in server side here in combination with
            // calling Data for Route in client side in App (see Components/App.js)
            allFetchPromises.push(
              store.dispatch(route.loadData())
            );
          }
          return match;
        });

        // WHEN COMMONS DATA AND SPECIFIC DATA ARE SOLVED
        // Mean that we have the store ready to render React app
        // Do all the server DOM content rendering and sending out here
        utils
          .whenAllPromisesFinish(allFetchPromises,eachResponse => {
            return eachResponse ? eachResponse.data : null;
          })
          .then((allResults) => {
            // console.log(allResults);

            let content = ReactDOMServer
              .renderToString(
                <ServerRouter
                  store={store}
                  registry={registry}
                  location={req.url}
                  context={context}
                  randomSeed={randomSeed}
                />
              );

            let state = store.getState();
            // Inject store data to HTML content so
            // Client side can generate a store in initial phase with those data
            // Thus, the store from client will be matched with store from server
            result = result.replace('/*-STATIC-CONTENT-*/', content);
            result = result.replace('/*-MUI-CSS-*/', registry.toString());
            result = result.replace('"/*-USER-*/"', JSON.stringify(state.auth));
            result = result.replace('"/*-DATA-*/"', JSON.stringify(state.data));

            // Send out response
            res
              .status(200)
              .set('content-type', 'text/html')
              .send(result);

            // End Request Response
            return res.end();
          });
      };
    });
    // Return true for this express route
    return true;
  });

  // SERVER START
  portFinder.basePort = global.__BASE_PORT__ = hostConfig.port;
  portFinder.getPort((err, port) => {
    if (err) {
      console.log(err);
      return err;
    }
    portFinder.basePort = global.__BASE_PORT__ = port;
    app.listen(port, (err) => {
      if (err) {
        console.log(err);
        return err;
      } else {
        console.log('----------------------------------------------------------');
        console.log();
        console.log('\x1b[36m', 'Server Started at Port: ', 'http://localhost:' + port);
        console.log('\x1b[36m', 'Server Started at Port: ', 'http://' + hostConfig.lan + ':' + port);
        console.log('\x1b[37m');
        console.log('\x1b[39m','----------------------------------------------------------');
        // Open Browser when Server is started
        // require('opn')('http://localhost:' + port, {
        //   app: 'google chrome'
        // });
      }
    });
  });
});
