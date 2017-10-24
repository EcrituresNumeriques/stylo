import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import store from 'store/configureStore';

export default class NewVersion extends Component {
  constructor(props) {
    super(props);
    this.newVersion = this.newVersion.bind(this);
  }

  newVersion(){
    let corps = {article:this.props.article,owner:this.props.owner,version:this.props.version+1,revision:0,xml:this.props.xml,yaml:this.props.yaml,md:this.props.md,bib:this.props.bib};
    fetch('/api/v1/versions/',{
      method:'POST',
      body: JSON.stringify(corps),
      credentials: 'same-origin'
    })
    .then(function(response){
      return response.json();
    })
    .then(function(json){
      store.dispatch({type:"ARTICLES_ADDVERSION",data:json});
      return null;
    });
  }

  render() {
    return (
      <span className="button duplicateButton" onClick={this.newVersion}><i class="fa fa-files-o"></i> New version</span>
    );
  }
}
