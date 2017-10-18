import React, { Component } from 'react';
import { Link } from 'react-router-dom';

export default class Register extends Component {
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
          <input type="password" placeholder="confirm password"/>
          <input type="submit" value="create" />
          <p className="note">or <Link to="/login">go to login</Link></p>
        </form>
      </div>
    );
  }
}
