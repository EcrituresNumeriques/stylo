import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import store from 'store/configureStore';

export default class Fork extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <span>[fork to new Article]</span>
    );
  }
}
