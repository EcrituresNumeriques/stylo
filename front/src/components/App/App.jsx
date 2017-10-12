import React, { Component } from 'react';
import Router, { Link, RouteHandler } from 'react-router';
import Login from 'components/login/Login'

export default class App extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    return(
      <Login />
    );
  }
}
