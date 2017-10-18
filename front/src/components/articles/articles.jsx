import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import store from 'store/configureStore';


export default class Articles extends Component {
  constructor(props) {
    super(props);
    //set state
    this.state = {loaded:false};
    this.fetchAPI = this.fetchAPI.bind(this);
    this.fetchAPI();
    //fetch articles from API
  }

  fetchAPI(){
    let that = this;
    fetch('/api/v1/articles',{
      method:'GET',
      credentials: 'same-origin'
    })
    .then(function(response){
      return response.json();
    })
    .then(function(json){
      that.entity = json;
      store.dispatch({type:"ARTICLES_LOAD",data:json});
      that.setState({loaded:true});
      //that.refs.city_born = json.city_born;
      return null;
    });
  }




  render() {
    return (
      <div className="gridCenter">
        <div className="gridCentered" >
          <h1>Articles</h1>
          <p>{this.state.loaded?"Up to Date":"Fetching"}</p>
          {!store.getState().articles.articles.length && <p>No articles found</p>}
        </div>
      </div>
    );
  }
}
