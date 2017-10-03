import React, { Component } from 'react';
import Router, { Link, RouteHandler } from 'react-router';

// components
import Header from 'Header/Header';

export default class App extends Component {
  constructor(props) {
    super(props);
  }

  render() {

    return (
      <div class="app">
        <Header />
        <div class="container">
          <h3>Backend Features</h3>

          <ul>
            <li><a href="https://sailsjs.org">Sails v0.12.2</a></li>
            <li><a href="https://github.com/sgress454/sails-hook-autoreload">Sails Autoreload Hook</a></li>
          </ul>

          <h3>Frontend Features</h3>
          <ul>
            <li><a href="https://facebook.github.io/react/">React v15.0.1</a></li>
            <li><a href="https://github.com/reactjs/react-router">React Router</a></li>
            <li><a href="https://babeljs.io/">Babel</a></li>
            <li><a href="https://github.com/gaearon/react-hot-loader">React Hot Loader</a></li>
            <li><a href="https://webpack.github.io/docs/webpack-dev-server.html">Webpack Dev Server</a></li>
            <li><a href="https://github.com/jtangelder/sass-loader">SCSS</a></li>
            <li><a href="https://github.com/passy/autoprefixer-loader">Autoprefixer</a></li>
          </ul>
        </div>
      </div>
    );
  }
}
