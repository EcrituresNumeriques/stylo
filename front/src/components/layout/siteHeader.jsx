import React, { Component } from 'react';
import { Link } from 'react-router-dom';

export default class SiteHeader extends Component {
  constructor(props) {
    super(props);
  }

render() {
    return (
      <header>
          <h1>Stylo</h1>
          <div className="wrapper"/>
          <nav>
                <Link to="/login">Login</Link>
                <Link to="/register">Register</Link>
          </nav>
      </header>
    );
  }
}
