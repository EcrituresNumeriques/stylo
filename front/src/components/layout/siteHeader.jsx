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
          <h1>_Stylo_</h1>
          <div className="wrapper"/>
          <nav>
            <a href='http://stylo-doc.ecrituresnumeriques.ca' target="_blank">Documentation</a>
            <a href='https://github.com/EcrituresNumeriques/stylo/issues' target="_blank">Report an issue</a>
            {loggedIn && <Link to='/articles'>My articles</Link>}
            {loggedIn && <Link to='/articles'>{store.getState().user.user.username}</Link>}
            {!loggedIn && <Link to="/login">Login</Link>}
            {!loggedIn && <Link to="/register">Register</Link>}
        </nav>
      </header>
    );
  }
}
