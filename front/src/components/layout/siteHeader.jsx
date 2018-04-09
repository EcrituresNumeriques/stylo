import React, { Component } from 'react';
import Login from './Login';

export default class SiteHeader extends Component {
  constructor(props) {
    super(props);
  }

render() {
    return (
      <header>
          <h1>Stylo</h1>
          <div className="wrapper"/>
          <Login />
      </header>
    );
  }
}
