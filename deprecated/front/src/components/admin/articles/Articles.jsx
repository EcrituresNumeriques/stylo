import React, { Component } from 'react';
import Article from './Article.jsx';

export default class Articles extends Component {
  constructor(props) {
    super(props);
    //set state
    this.state = {loaded:false,expanded:false,articles:[]};
    this.fetchAPI = this.fetchAPI.bind(this);
    this.togglePanel = this.togglePanel.bind(this);
    this.fetchAPI();
    //fetch articles from API
  }

  fetchAPI(){
    let that = this;
    fetch('/api/v1/admin/articles',{
      method:'GET',
      credentials: 'same-origin'
    })
    .then(function(response){
      return response.json();
    })
    .then(function(json){
      that.setState({loaded:true,articles:json});
      that.props.updateChart(json.map((o)=>o.createdAt),'articles');
      return null;
    });
  }

  togglePanel(){
    this.setState(function(state){
      state.expanded = !state.expanded;
      return state;
    });
  }

  render() {
    return(
        <section>
          <h1 onClick={()=>this.togglePanel()}>{this.state.expanded?"-":"+"} Articles ({this.state.articles.length})</h1>
          {this.state.expanded && this.state.loaded && <ul>{this.state.articles.map((a,i)=><Article key={"article"+a.id} {...a}/>)}</ul>}
          {this.state.expanded && !this.state.loaded && <ul><li>loading..</li></ul>}
        </section>
    );
  }
}
