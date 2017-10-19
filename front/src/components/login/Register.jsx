import React, { Component } from 'react';
import { Link } from 'react-router-dom';

export default class Register extends Component {
  constructor(props) {
    super(props);
    this.handleSubmit = this.handleSubmit.bind(this);
  }
  handleSubmit = function(e){
    e.preventDefault();
    //send to the backend a Register
    let that = this;
    let corps = {
      email:this.refs.email.value,
      password:this.refs.password.value,
      username:this.refs.username.value
    }
    if(this.refs.password.value == this.refs.Cpassword.value){
      fetch("/api/v1/register",
      {
        method: "POST",
        body: JSON.stringify(corps),
        credentials: 'same-origin'
      })
      .then(function(res){
        if(!res.ok){throw res.json();}
        return res.json()})
        .then(function(data){
          that.props.history.push("/login");
          return null})
          .catch(function(error){return error})
          .then(function(error){if(error != null){alert(error.message)};}.bind(this));
    }
    else{
      alert('Passwords should match');
    }
  }


  render() {
    return (
      <div className="gridCenter">
        <form className="gridCentered" onSubmit={this.handleSubmit}>
          <input type="text" placeholder="Email" ref="email"/>
          <input type="text" placeholder="Username" ref="username"/>
          <input type="password" placeholder="Password" ref="password"/>
          <input type="password" placeholder="Confirm Password" ref="Cpassword"/>
          <input type="submit" value="create" />
          <p className="note">or <Link to="/login">go to login</Link></p>
        </form>
      </div>
    );
  }
}
