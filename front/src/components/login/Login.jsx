import React, { Component } from 'react';
import Router, { Link, RouteHandler } from 'react-router';

export default class Login extends Component {
  constructor(props) {
    super(props);
  }
  handleSubmit = function(e){
    e.preventDefault();
  }

  render() {
    return (
      <div className="gridCenter">
        <form className="gridCentered" onSubmit={this.handleSubmit}>
          <input type="text" placeholder="email"/>
          <input type="password" placeholder="password"/>
          <input type="submit" value="go" />
          <p className="note">or create an account</p>
        </form>
      </div>
    );
  }
}
