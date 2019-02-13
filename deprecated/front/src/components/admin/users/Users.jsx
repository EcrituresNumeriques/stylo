import React, { Component } from 'react';
import User from './User.jsx';

export default class Users extends Component {
  constructor(props) {
    super(props);
    //set state
    this.state = {loaded:false,expanded:false,users:[]};
    this.fetchAPI = this.fetchAPI.bind(this);
    this.togglePanel = this.togglePanel.bind(this);
    this.fetchAPI();
    //fetch articles from API
  }

  fetchAPI(){
    let that = this;
    fetch('/api/v1/admin/users',{
      method:'GET',
      credentials: 'same-origin'
    })
    .then(function(response){
      return response.json();
    })
    .then(function(json){
      that.setState({loaded:true,users:json});
      that.props.updateChart(json.map((o)=>o.createdAt),'users');
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
          <h1 onClick={()=>this.togglePanel()}>{this.state.expanded?"-":"+"} Users ({this.state.users.length})</h1>
          {this.state.expanded && this.state.loaded && <ul>{this.state.users.map((u,i)=><User key={"users"+u.id} {...u}/>)}</ul>}
          {this.state.expanded && !this.state.loaded && <ul><li>loading..</li></ul>}
        </section>
    );
  }
}
