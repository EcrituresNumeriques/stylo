import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import store from 'store/configureStore';
import sortByIdDesc from 'helpers/sorts/idDesc';
import Article from 'components/articles/article';
import SiteHeader from 'components/layout/siteHeader';
import sortByUpdateDesc from 'helpers/sorts/updateDesc';

export default class Articles extends Component {
  constructor(props) {
    super(props);
    //set state
    this.state = {loaded:false};
    this.fetchAPI = this.fetchAPI.bind(this);
    this.addArticle = this.addArticle.bind(this);
    this.fetchAPI();
    //fetch articles from API
  }

  fetchAPI(){
    let that = this;
    fetch('/api/v1/my-articles',{
      method:'GET',
      credentials: 'same-origin'
    })
    .then(function(response){
      return response.json();
    })
    .then(function(json){
      store.dispatch({type:"ARTICLES_LOAD",data:json});
      that.setState({loaded:true});
      //that.refs.city_born = json.city_born;
      return null;
    });
  }

  addArticle(){
    let that = this;
    that.setState({loaded:false});
    let corps = {
      title:"New article"
    };
    fetch('/api/v1/articles',{
      method:'POST',
      body: JSON.stringify(corps),
      credentials: 'same-origin'
    })
    .then(function(response){
      return response.json();
    })
    .then(function(json){
      store.dispatch({type:"ARTICLES_ADD",data:json});
      that.setState({loaded:true});
      return null;
    });
  }


  render() {
    return (
            <section>
              <h1>My Articles</h1>
              <p onClick={this.addArticle} className="button primaryButton">Create new article</p>
              <p>{this.state.loaded?"Up to Date":"Fetching"}</p>
              {!store.getState().articles.articles.length && <p>No articles found</p>}
              {store.getState().articles.articles.sort(sortByUpdateDesc).map((article)=>(<Article key={"article"+article.id} article={article} />))}
            </section>
    );
  }
}
