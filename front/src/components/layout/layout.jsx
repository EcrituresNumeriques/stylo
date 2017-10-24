import React, { Component } from 'react';
import SiteHeader from 'components/layout/siteHeader';

export default class Layout extends Component {
  constructor(props) {
    super(props);
    console.log(this.props);
  }

render() {
    return (
      [
        <SiteHeader />,
        <main id="mainView">
          {this.props.children}
        </main>
      ]
    )}
}
