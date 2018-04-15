import React, { Component } from 'react';
import SiteHeader from 'components/layout/siteHeader';

export default class Layout extends Component {
  constructor(props) {
    super(props);
  }

render() {
    return (
      [
        <SiteHeader key="header" />,
        <main id="mainView" key="mainview">
          {this.props.children}
        </main>
      ]
    )}
}
