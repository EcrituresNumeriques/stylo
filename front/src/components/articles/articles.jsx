import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import store from 'store/configureStore';
import sortByIdDesc from 'helpers/sorts/idDesc';

export default class Articles extends Component {
  constructor(props) {
    super(props);
    //set state
    this.state = {loaded:false};
    this.fetchAPI = this.fetchAPI.bind(this);
    this.addArticle = this.addArticle.bind(this);
    this.emitChangeArticleName = this.emitChangeArticleName.bind(this);
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
      that.entity = json;
      store.dispatch({type:"ARTICLES_ADD",data:json});
      that.setState({loaded:true});
      return null;
    });
  }

  emitChangeArticleName(e){
    let that = this;
    that.setState({loaded:false});
    let corps = {
      id:e.target.getAttribute("data-id"),
      title:e.target.textContent || e.target.innerText
    };
    fetch('/api/v1/articles/'+corps.id,{
      method:'POST',
      body: JSON.stringify(corps),
      credentials: 'same-origin'
    })
    .then(function(response){
      return response.json();
    })
    .then(function(json){
      that.entity = json;
      store.dispatch({type:"ARTICLES_UPDATE",data:json});
      that.setState({loaded:true});
      return null;
    });
  }



  render() {
    return (
      <div className="gridCenter">
        <div className="gridCentered" >
          <h1>Articles</h1>
          <p onClick={this.addArticle}>Create new article</p>
          <p>{this.state.loaded?"Up to Date":"Fetching"}</p>
          {!store.getState().articles.articles.length && <p>No articles found</p>}
          {store.getState().articles.articles.map((article)=>(<p key={"article"+article.id}>{article.id}. <span contentEditable onBlur={this.emitChangeArticleName} data-id={article.id} suppressContentEditableWarning="true">{article.title}</span> [{article.version}-{article.revision}]
          {article.versions && !!article.versions.length && <Link to={"/version/"+article.versions[article.versions.length-1].id}>continue edit</Link>}
        </p>))}
        </div>
      </div>
    );
  }
}
