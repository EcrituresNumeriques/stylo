'use strict';

const path = require('path');
const webpack = require('webpack');
const NODE_ENV = process.env.NODE_ENV;
const SaveAssetsJson = require('assets-webpack-plugin');
const CleanWebpackPlugin = require('clean-webpack-plugin');

module.exports = {
  devtool: '#source-map',

  // Capture timing information for each module
  profile: false,

  // Switch loaders to debug mode
  debug: false,

  // Report the first error as a hard error instead of tolerating it
  bail: true,

  entry: [
    'babel-polyfill',
    './assets/main.jsx',
  ],

  output: {
    path: 'public/dist/',
    pathInfo: true,
    publicPath: '/dist/',
    filename: 'bundle.[hash].min.js',
  },

  resolve: {
    root: path.join(__dirname, ''),
    modulesDirectories: [
      'web_modules',
      'node_modules',
      'assets',
      'assets/components',
    ],
    extensions: ['', '.webpack.js', '.web.js', '.js', '.jsx'],
  },

  resolveLoader: {
    root: path.join(__dirname, 'node_modules'),
  },

  plugins: [
    new CleanWebpackPlugin(['public/dist'], {
      verbose: true,
      dry: false,
    }),
    new webpack.optimize.OccurenceOrderPlugin(true),
    new webpack.optimize.DedupePlugin(),
    new webpack.optimize.UglifyJsPlugin({
      output: {
        comments: false,
      },
      compress: {
        warnings: false,
        screw_ie8: true,
      },
    }),
    new SaveAssetsJson({
      path: process.cwd(),
      filename: 'assets.json',
    }),
    new webpack.DefinePlugin({
      'process.env': {
        NODE_ENV: JSON.stringify('production'),
      },
    }),
  ],

  module: {
    loaders: [
      {
        test: /\.scss$/, // sass files
        loader: 'style!css!autoprefixer?browsers=last 2 version!sass?outputStyle=expanded',
      },
      {
        test: /\.(ttf|eot|svg|woff)(\?[a-z0-9]+)?$/, // fonts files
        loader: 'file-loader?name=[path][name].[ext]',
      },
      {
        test: /\.jsx?$/, // react files
        exclude: /node_modules/,
        loaders: ['babel?presets[]=es2015,presets[]=stage-0,presets[]=react'],
        include: path.join(__dirname, 'assets'),
      },
    ],

    noParse: /\.min\.js/,
  },
};
