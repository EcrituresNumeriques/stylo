import React, { Component } from 'react';
import { BrowserRouter,Route,Switch} from 'react-router-dom'
import Login from 'components/login/Login'
import Register from 'components/login/Register'
import NotFound from 'components/NotFound/NotFound'
import Articles from 'components/articles/articles'
import Write from 'components/write/main'
import Layout from 'components/layout/layout'
import 'font-awesome-webpack'

export default class App extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    return(
        <Switch>
          <Route exact path="/login" component={Login}/>
          <Route exact path="/register" component={Register}/>
          <Layout>
            <Route exact path="/articles" component={Articles}/>
            <Route exact path="/write/:article/:version" component={Write} />
            <Route exact path="/write/:article" component={Write} />
          </Layout>
          <Route component={NotFound}/>
        </Switch>
    );
  }
}
