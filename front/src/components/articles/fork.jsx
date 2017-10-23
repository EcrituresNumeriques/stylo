import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import store from 'store/configureStore';

export default class Fork extends Component {
  constructor(props) {
    super(props);
    this.fork = this.fork.bind(this);
  }

  fork(){
    //create new Article
    fetch('/api/v1/versions/'+this.props.id+"/fork",{
      method:'POST',
      credentials: 'same-origin'
    })
    .then(function(response){
      return response.json();
    })
    .then(function(json){
      store.dispatch({type:"ARTICLES_ADD",data:json});
      return null;
    });
  }

  render() {
    return (
      <span className="primaryButton forkButton" onClick={this.fork}><i class="fa fa-external-link"></i> Fork</span>
    );
  }
}
