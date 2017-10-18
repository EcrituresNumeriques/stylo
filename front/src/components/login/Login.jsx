import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import store from 'store/configureStore';


export default class Login extends Component {
  constructor(props) {
    super(props);
    console.log(store.getState());
  }
  handleSubmit = function(e){
    e.preventDefault();
    store.dispatch({type:"TEST",data:"test"})
  }


  render() {
    return (
      <div className="gridCenter">
        <form className="gridCentered" onSubmit={this.handleSubmit}>
          <input type="text" placeholder="email"/>
          <input type="password" placeholder="password"/>
          <input type="submit" value="go" />
          <p className="note">or <Link to="/register">create an account</Link></p>
        </form>
        {store.getState().articles.articles.map((article,i)=>(<p key={i}>article.newarticle</p>))}
      </div>
    );
  }
}
