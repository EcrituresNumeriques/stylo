const webpack = require('webpack');
const WebpackDevServer = require('webpack-dev-server');
const config = require('./webpack.config.dev');
const FRONTEND_PORT = 8080;
const BACKEND_PORT = 3000;
const colors = require('colors');

var server = new WebpackDevServer(webpack(config), {
  publicPath: config.output.publicPath,
  hot: true,
  noInfo: true,
  historyApiFallback: true,
  headers: { 'Access-Control-Allow-Origin': `http://localhost:${BACKEND_PORT}` },
}).listen(FRONTEND_PORT, 'localhost', function (err, result) {
  if (err) console.log(err);

  console.log('===================================='.magenta);
  console.log('         WEBPACK DEV SERVER         ');
  console.log('===================================='.magenta);
  console.log('Configuration:', 'webpack.config.dev.js'.magenta);
  console.log('Listening at', `http://localhost:${FRONTEND_PORT}`.magenta);
  console.log('===================================='.magenta);
});
