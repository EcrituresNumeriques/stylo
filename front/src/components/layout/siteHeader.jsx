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
          {
            loggedIn && <nav>
                          <Ling to='http://stylo-doc.ecrituresnumeriques.ca'>Documentation</Link>
                          <Link to='/articles'>Mes articles</Link>
                          <Link to='/articles'>{store.getState().user.user.username}</Link>
                       </nav>
          }
          {
            !loggedIn &&   <nav>
                    <Ling to='http://stylo-doc.ecrituresnumeriques.ca'>Documentation</Link>
                    <Link to="/login">Login</Link>
                    <Link to="/register">Register</Link>
              </nav>
          }
      </header>
    );
  }
}
