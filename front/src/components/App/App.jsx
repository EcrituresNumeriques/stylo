import React, { Component } from 'react';
import Router, { Link, RouteHandler } from 'react-router';

export default class App extends Component {
  constructor(props) {
    super(props);
  }

  render() {

    return (
      [
        <p key="a">test numero6</p>,
        <p key="b">nops</p>,
        <p key="c">test 3</p>
      ]
    );
  }
}
