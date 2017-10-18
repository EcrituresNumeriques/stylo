import React, { Component } from 'react';
import { BrowserRouter,Route,Switch} from 'react-router-dom'
import Login from 'components/login/Login'
import Register from 'components/login/Register'
import NotFound from 'components/NotFound/NotFound'
import Articles from 'components/articles/articles'

export default class App extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    return(
      <div>
        <Switch>
          <Route exact path="/login" component={Login}/>
          <Route exact path="/register" component={Register}/>
          <Route exact path="/articles" component={Articles}/>
          <Route component={NotFound}/>
        </Switch>
      </div>
    );
  }
}
