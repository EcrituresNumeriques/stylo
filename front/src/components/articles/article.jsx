import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import store from 'store/configureStore';
import sortByIdDesc from 'helpers/sorts/idDesc';
import Fork from 'components/articles/fork'
import NewVersion from 'components/articles/newVersion'
import Sommaire from 'components/write/Sommaire'
var dateFormat = require('dateformat');



export default class Articles extends Component {
  constructor(props) {
    super(props);
    this.state = {edit:false,delete:false,open:false};
    this.emitChangeArticleName = this.emitChangeArticleName.bind(this);
    this.deleteArticle = this.deleteArticle.bind(this);
    this.startEdit = this.startEdit.bind(this);
    this.toggleDelete = this.toggleDelete.bind(this);
    this.toggleOpen = this.toggleOpen.bind(this);
    this.startShare = this.startShare.bind(this);
  }

  //Set state needed
  startEdit(){
      this.setState({edit:true,delete:false});
  }
  toggleDelete(){
      this.setState({delete:!this.state.delete});
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
  startShare(){
    let that = this;
    let recipient = window.prompt("Share this article with","test@stylo.io");
    if(recipient == null || recipient == ""){}
    else{
        fetch('/api/v1/share-articles/'+this.props.article.id,{
            method:'POST',
            body: JSON.stringify({add:recipient}),
            credentials: 'same-origin'
        })
        .then(function(response){
            return response.json();
        })
        .then(function(json){
            return null;
        });
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
  toggleOpen(){
    this.setState({open:!this.state.open});
  }

  render() {
    return (
      <ul className="unstyled articleBox" key={"article"+this.props.article.id}>
        {!this.state.edit && [<p className="articleTitle"  onClick={this.toggleOpen} key={"articletitle"+this.props.article.id}>
          {!this.state.open && <i className="fa fa-plus" aria-hidden="true"/>}
          {this.state.open && <i className="fa fa-minus" aria-hidden="true"/>}
          {this.props.article.title} ({dateFormat(new Date(this.props.article.updatedAt),"dd/mm/yy, HH:MM")})
        </p>,
          <nav key={"articlenav"+this.props.article.id}>
            <Link to={"/write/"+this.props.article.id} className="button primaryButton"><i className="fa fa-pencil"></i> Edit</Link>
            <span onClick={this.startShare} className="button"><i className="fa fa-pencil"></i> Share</span>
            <span onClick={this.startSend} className="button"><i className="fa fa-pencil"></i> Send</span>
            <span onClick={this.startEdit} className="button"><i className="fa fa-pencil"></i> Rename</span>
            <span onClick={this.toggleDelete} className="button"><i className="fa fa-trash"></i> Delete</span>
            {this.state.delete && <button className="button alertButton" onDoubleClick={this.deleteArticle}>DANGER! Doubleclick to delete</button>}
          </nav>]

        }
        {this.state.edit && [
          <input key={"input"+this.props.article.id} type="text" ref="title"  defaultValue={this.props.article.title} onBlur={this.emitChangeArticleName}/>,
          <button key={"button"+this.props.article.id} className="button">OK</button>]}
          {this.state.open && this.props.article.versions && this.props.article.versions.map((version,i)=>(
          <div key={"versions"+version.id}>
            <p>Last version : v{version.version}.{version.revision}</p>
            <div className="actions">
            <Link to={"/write/"+this.props.article.id+"/"+version.id} className="button"><i className="fa fa-eye"></i> See</Link>
            {i==0 && <NewVersion {...version} />}
            <Fork {...version} />
            </div>
            <Sommaire md={version.md}/>
          </div>))}
      </ul>
    );
  }
}
