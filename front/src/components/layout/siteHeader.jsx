import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import store from 'store/configureStore';

export default class SiteHeader extends Component {
  constructor(props) {
    super(props);
  }

render() {
    const loggedIn = store.getState().user.log;
    return (
      <header>
          <h1>Stylo</h1>
          <div className="wrapper"/>
          {
            loggedIn && <nav><Link to='/articles'>{store.getState().user.user.username}</Link></nav>
          }
          {
            !loggedIn &&   <nav>
                    <Link to="/login">Login</Link>
                    <Link to="/register">Register</Link>
              </nav>
          }
      </header>
    );
  }
}
