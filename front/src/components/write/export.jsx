import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import store from 'store/configureStore';

export default class Export extends Component {
  constructor(props) {
    super(props);
    this.getHTML = this.getHTML.bind(this);
  }

  getHTML(){
    window.open('/api/v1/version/'+this.props.version+"/html",'_blank')
  }

  render() {
    return (
      <div>
        <button className="primaryButton" onClick={this.getHTML}>Export as HTML</button>
      </div>
    );
  }
}
