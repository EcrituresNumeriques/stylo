import React, { Component } from 'react';
import { Link } from 'react-router-dom';

export default class Login extends Component {
  constructor(props) {
    super(props);
  }

render() {
    return (
      <nav>
          <Link to="/login">Login</Link>
          <Link to="/register">Register</Link>
      </nav>
    );
  }
}
