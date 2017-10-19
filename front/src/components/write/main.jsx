import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import store from 'store/configureStore';
import sortByIdDesc from 'helpers/sorts/idDesc';

export default class Write extends Component {
  constructor(props) {
    super(props);
    //set state
    this.state = {loaded:false,live:{},active:{},activeId:this.props.match.params.version,article:{versions:[]}};
    this.newVersion = this.newVersion.bind(this);
    this.fetchAPI = this.fetchAPI.bind(this);
    this.fetchAPI();
  }

  fetchAPI(){
    let that = this;
    fetch('/api/v1/articles/'+this.props.match.params.article,{
      method:'GET',
      credentials: 'same-origin'
    })
    .then(function(response){
      return response.json();
    })
    .then(function(json){
      store.dispatch({type:"ARTICLES_UPDATE",data:json});
      that.setState({loaded:true,article:json,live:json.versions[json.versions.length-1],compute:true});
      return null;
    });
  }

  componentDidUpdate(){
    if(this.state.activeId != this.props.match.params.version || this.state.compute){
      let newActive;
      if(this.props.match.params.version == undefined){
        //set the live as the active view
        newActive = this.state.live;
      }
      else{
        //find the correct version
        let that = this;
        newActive = this.state.article.versions.find(function(version){return that.props.match.params.version == version.id});
      }
      console.log(newActive);
      this.setState({activeId:this.props.match.params.version,active:newActive,compute:false});
    }
  }

  newVersion(major=false){
    console.log("newversion");
    let that = this;
    let version = major?this.state.active+1:this.state.active;
    let revision = major?0:this.state.active+1;
    let corps = {article:this.state.article.id,owner:this.state.article.owner,version,revision,xml:this.state.live.xml,yaml:this.state.live.yaml};
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
      let midState = that.state.article;
      midState.versions = [json,...midState.versions];
      that.setState({article:midState});
      return null;
    });
  }


  render() {
    return (
      <div>
          <h1>{this.state.article.title}</h1>
          <div>
            <Link to="/articles"  className="secondaryButton">Back to My articles</Link>
            <button className={this.state.activeId?"disabledButton":"secondaryButton"} onClick={()=>(this.NewVersion(true))}>Save as new version</button>
            <button className={this.state.activeId?"disabledButton":"secondaryButton"} onClick={this.NewVersion}>QuickSave</button>
          </div>
          <p>{this.state.loaded?"Up to Date":"Fetching"}</p>
          <div id="timeline">
            <Link to={"/write/"+this.props.match.params.article}>{this.state.activeId == undefined && <span>==></span>}live</Link>
            {this.state.article.versions.map((version)=>(
              <Link to={"/write/"+this.props.match.params.article+"/"+version.id} key={"versionWrite"+version.id}>{this.state.activeId == version.id && <span>==></span>}v{version.version}.{version.revision}</Link>
            ))}
          </div>
          <textarea value={this.state.active.xml} placeholder="XML via texture">
          </textarea>
          <textarea value={this.state.active.yaml} placeholder="YAML editor">
          </textarea>
      </div>
    );
  }
}
