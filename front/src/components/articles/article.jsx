import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import store from 'store/configureStore';
import sortByIdDesc from 'helpers/sorts/idDesc';

export default class Articles extends Component {
  constructor(props) {
    super(props);
    this.state = {edit:false};
    this.emitChangeArticleName = this.emitChangeArticleName.bind(this);
    this.startEdit = this.startEdit.bind(this);
  }

  startEdit(e){
      this.setState({edit:true});
  }

  componentDidUpdate(){
    if(this.state.edit){
      this.refs.title.focus();
      this.refs.title.select();
    }
  }

  componentDidMount(){
    if(!this.props.article.versions){
      this.setState({edit:true});
    }
  }

  emitChangeArticleName(e){
    let that = this;
    that.setState({loaded:false});
    let corps = {
      id:this.props.article.id,
      title:e.target.value
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
      that.setState({edit:false});
      store.dispatch({type:"ARTICLES_UPDATE",data:json});
      return null;
    });
  }

  render() {
    return (
      <ul className="unstyled">
        {!this.state.edit && <p>{this.props.article.title} <span onClick={this.startEdit}>[edit title]</span></p>}
        {this.state.edit && [
          <input type="text" ref="title"  defaultValue={this.props.article.title} data-id={this.props.article.id} onBlur={this.emitChangeArticleName}/>,
          <button className="primaryButton">OK</button>]}
          {this.props.article.versions && this.props.article.versions.map((version)=>(
          <li key={"versions"+version.id}>
            v{version.version}.{version.revision} <Link to={"/version/"+version.id}>continue edit</Link>
          </li>))}
      </ul>
    );
  }
}
