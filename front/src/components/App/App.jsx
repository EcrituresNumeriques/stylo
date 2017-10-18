import React, { Component } from 'react';
import { BrowserRouter,Route} from 'react-router-dom'
import Login from 'components/login/Login'
import Register from 'components/login/Register'
import NotFound from 'components/NotFound/NotFound'

export default class App extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    return(
      <div>
        <Route exact path="/login" component={Login}/>
        <Route exact path="/register" component={Register}/>
        <Route path="/*" component={NotFound}/>
      </div>
    );
  }
}
