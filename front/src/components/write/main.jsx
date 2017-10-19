import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import store from 'store/configureStore';
import sortByIdDesc from 'helpers/sorts/idDesc';

export default class Write extends Component {
  constructor(props) {
    super(props);
    //set state
    this.state = {loaded:false,live:{},active:{},activeId:this.props.match.params.version,article:{versions:[]}};
    this.sendNewVersion = this.sendNewVersion.bind(this);
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
      json.versions = json.versions.sort(sortByIdDesc);
      that.setState({loaded:true,article:json,live:json.versions[0],compute:true});
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
      this.setState({activeId:this.props.match.params.version,active:newActive,compute:false});
    }
  }

  sendNewVersion(e,major=false){
    let that = this;
    let version = major?this.state.live.version+1:this.state.live.version;
    let revision = major?0:this.state.live.revision+1;
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
      let midState = that.state;
      midState.article.versions = [json,...midState.article.versions];
      midState.live.version = version;
      midState.live.revision = revision;
      that.setState(midState);
      store.dispatch({type:"ARTICLES_ADDVERSION",data:json});
      return null;
    });
  }


  render() {
    return (
      <div>
          <h1>{this.state.article.title}</h1>
          <div>
            <Link to="/articles"  className="secondaryButton">Back to My articles</Link>
            <button className={this.state.activeId?"disabledButton":"secondaryButton"} onClick={()=>this.sendNewVersion(null,true)}>Save as new version</button>
            <button className={this.state.activeId?"disabledButton":"secondaryButton"} onClick={this.sendNewVersion}>QuickSave</button>
          </div>
          <p>{this.state.loaded?"Up to Date":"Fetching"}</p>
          <div id="timeline">
            <Link to={"/write/"+this.props.match.params.article}>{this.state.activeId == undefined && <span>==></span>}live</Link>
            {this.state.article.versions.map((version)=>(
              <Link to={"/write/"+this.props.match.params.article+"/"+version.id} key={"versionWrite"+version.id}>{this.state.activeId == version.id && <span>==></span>}v{version.version}.{version.revision}</Link>
            ))}
          </div>
          <textarea value={this.state.active.xml} disabled={this.state.activeId} placeholder="XML via texture">
          </textarea>
          <textarea value={this.state.active.yaml} disabled={this.state.activeId} placeholder="YAML editor">
          </textarea>
      </div>
    );
  }
}
