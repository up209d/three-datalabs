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

// WEBPACK DEV
import webpack from 'webpack';
import webpackConfig from 'webpack.config.prod';

const compiler = webpack(webpackConfig);

// COMPILE WEBPACK
compiler.run((err,currentStats) => {});
