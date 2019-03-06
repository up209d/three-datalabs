import path from 'path';
import webpack from 'webpack';
import basename from './base.config';

process.env.NODE_ENV = 'development';

export default {
  devtool: 'source-map',
  mode: 'development',
  entry: {
    vendorBundle: [
      "axios",
      "babel-runtime/core-js",
      "babel-polyfill",
      "babel-register",
      "lodash",
      "material-ui",
      "material-ui-icons",
      "popmotion",
      "react",
      "react-dom",
      "react-hot-loader",
      "react-jss",
      "react-motion",
      "react-pose",
      "react-redux",
      "react-router",
      "react-router-dom",
      "react-router-redux",
      "redux",
      "redux-thunk",
      "reselect",
      "three",
      "three-bas",
      "webfontloader"
    ]
  },
  plugins: [
    new webpack.DllPlugin({
      path: path.resolve(__dirname + '/lib' + basename) + '/[name]_manifest.json',
      name: '[name]_dll'
    })
  ],
  module: {
    rules: [
      {
        test: /\.(vert|frag|cs|html)$/,
        use: 'raw-loader'
      }
    ]
  },
  output: {
    path: path.resolve(__dirname + '/lib' + basename),
    filename: '[name]_dll.js',
    sourceMapFilename: '[name]_dll.js.map',
    library: '[name]_dll'
  }
}