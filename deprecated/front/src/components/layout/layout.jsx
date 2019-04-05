import React, { Component } from 'react';
import SiteHeader from 'components/layout/siteHeader';
import { BrowserRouter,Route,Switch} from 'react-router-dom'
import Articles from 'components/articles/articles'
import Admin from 'components/admin/Main'

export default class Layout extends Component {
  constructor(props) {
    super(props);
  }

render() {
    return (
      [
        <SiteHeader key="header" />,
          <main id="mainView" key="mainview">
            <Switch key="map">
              <Route exact path="/articles" component={Articles}/>
              <Route exact path="/admin" component={Admin}/>
            </Switch>
          </main>
      ]
    )}
}
