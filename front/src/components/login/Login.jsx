import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import store from 'store/configureStore';
import SiteHeader from 'components/layout/siteHeader';


export default class Login extends Component {
  constructor(props) {
    super(props);
    this.handleSubmit = this.handleSubmit.bind(this);
  }
  handleSubmit = function(e){
    e.preventDefault();
    let that = this;
    let corps = {
      password:this.refs.password.value,
      email:this.refs.email.value
    }
    fetch("/api/v1/login",
    {
        method: "POST",
        body: JSON.stringify(corps),
        credentials: 'same-origin'
    })
    .then(function(res){
      if(!res.ok){throw res.json();}
      return res.json()})
    .then(function(data){
      store.dispatch({type:"USER_LOGIN",data:data});
      that.props.history.push("/articles");
      return null})
    .catch(function(error){return error})
    .then(function(error){if(error != null){alert(error.message)};}.bind(this));
  }




  render() {
    return (
      <div className="gridCenter">
        <SiteHeader/>
        <form className="gridCentered" onSubmit={this.handleSubmit}>
          <input type="text" placeholder="email" ref="email"/>
          <input type="password" placeholder="password" ref="password" />
          <input type="submit" value="go" />
          <p className="note">or <Link to="/register">create an account</Link></p>
          <p>Login status : {store.getState().user.log?"true":"false"}</p>
        </form>
      </div>
    );
  }
}
