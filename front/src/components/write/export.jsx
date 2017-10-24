import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import store from 'store/configureStore';

export default class Export extends Component {
  constructor(props) {
    super(props);
    this.getHTML = this.getHTML.bind(this);
  }

  getHTML(){
    window.open('/api/v1/export/'+this.props.version,'_blank')
  }

  render() {
    return (
      <div>
        <button className="button" onClick={this.getHTML}>Export as HTML</button>
      </div>
    );
  }
}
