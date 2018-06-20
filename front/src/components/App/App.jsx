import React, { Component } from 'react';
import { BrowserRouter,Route,Switch} from 'react-router-dom'
import Login from 'components/login/Login'
import Register from 'components/login/Register'
import Profile from 'components/login/Profile';
import NotFound from 'components/NotFound/NotFound'
import Articles from 'components/articles/articles'
import Write from 'components/write/main'
import Live from 'components/write/live'
import Layout from 'components/layout/layout'
import WriteWrapper from 'components/layout/WriteWrapper'
import 'font-awesome-webpack'
import store from 'store/configureStore';

export default class App extends Component {
  constructor(props) {
    super(props);
    this.checkStatus = this.checkStatus.bind(this);
    this.checkStatus();
  }

  checkStatus(){
    let that = this;
    fetch('/api/v1/status',{
      method:'GET',
      credentials: 'same-origin'
    })
    .then(function(response){
      return response.json();
    })
    .then(function(json){
      store.dispatch({type:"USER_STATUS",data:json});
      return null;
    });
  }

  render() {
    return(
        <Switch>
          <Route exact path="/login" component={Login}/>
          <Route exact path="/register" component={Register}/>
          <Route exact path="/articles" component={Layout}/>
          <Route exact path="/profile" component={Profile}/>
          <Route exact path="/" component={Login} />
          <Route path="/write/" component={WriteWrapper}/>
          <Route component={NotFound}/>
        </Switch>
    );
  }
}
