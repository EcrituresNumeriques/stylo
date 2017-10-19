import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import store from 'store/configureStore';
import sortByIdDesc from 'helpers/sorts/idDesc';
import Fork from 'components/articles/fork'
import NewVersion from 'components/articles/newVersion'

export default class Articles extends Component {
  constructor(props) {
    super(props);
    this.state = {edit:false,delete:false};
    this.emitChangeArticleName = this.emitChangeArticleName.bind(this);
    this.deleteArticle = this.deleteArticle.bind(this);
    this.startEdit = this.startEdit.bind(this);
    this.startDelete = this.startDelete.bind(this);
  }

  //Set state needed
  startEdit(){
      this.setState({edit:true,delete:false});
  }
  startDelete(){
      this.setState({delete:true});
  }
  componentDidMount(){
    if(!this.props.article.versions){
      this.setState({edit:true,delete:false});
    }
  }
  //focus title if edit mode
  componentDidUpdate(){
    if(this.state.edit){
      this.refs.title.focus();
      this.refs.title.select();
    }
  }

  emitChangeArticleName(e){
    let that = this;
    let corps = {
      title:e.target.value
    };
    fetch('/api/v1/articles/'+this.props.article.id,{
      method:'POST',
      body: JSON.stringify(corps),
      credentials: 'same-origin'
    })
    .then(function(response){
      return response.json();
    })
    .then(function(json){
      that.setState({edit:false,delete:false});
      store.dispatch({type:"ARTICLES_UPDATE",data:json});
      return null;
    });
  }

  deleteArticle(e){
    let that = this;
    fetch('/api/v1/articles/'+this.props.article.id,{
      method:'DELETE',
      credentials: 'same-origin'
    })
    .then(function(response){
      return response.json();
    })
    .then(function(json){
      that.setState({edit:false});
      store.dispatch({type:"ARTICLES_DELETE",data:json});
      return null;
    });
  }

  render() {
    console.log(this.props.article);
    return (
      <ul className="unstyled">
        {!this.state.edit && <p>
          {this.props.article.title}
          <span onClick={this.startEdit}>[edit title]</span>
          <span onClick={this.startDelete}>[Delete article]</span>
          {this.state.delete && <button className="alertButton" onDoubleClick={this.deleteArticle}>DANGER! Doubleclick to delete</button>}
        </p>}
        {this.state.edit && [
          <input key={"input"+this.props.article.id} type="text" ref="title"  defaultValue={this.props.article.title} onBlur={this.emitChangeArticleName}/>,
          <button key={"button"+this.props.article.id} className="primaryButton">OK</button>]}
          {this.props.article.versions && this.props.article.versions.map((version,i)=>(
          <li key={"versions"+version.id}>
            v{version.version}.{version.revision}
            {i==0 && <span>[Edit]</span>}
            {i==0 && <NewVersion {...version}/>}
            {i>0 && <Link to={"/version/"+version.id}>[see]</Link>}
            <Fork {...version}/>
          </li>))}
      </ul>
    );
  }
}
