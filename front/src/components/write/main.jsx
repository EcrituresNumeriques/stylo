import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import store from 'store/configureStore';
import objectAssign from 'object-assign';
import sortByIdDesc from 'helpers/sorts/idDesc';
import ExportVersion from 'components/write/export';
import YamlEditor from 'components/yamleditor/YamlEditor';
import YAML from 'js-yaml';
import Timeline from 'components/write/Timeline';
import {Controlled as CodeMirror} from 'react-codemirror2'
require('codemirror/mode/markdown/markdown');

export default class Write extends Component {
  constructor(props) {
    super(props);
    //set state
    this.state = {loaded:false,live:{yaml:"",md:"",bib:""},active:{yaml:"",md:"",bib:""},activeId:this.props.match.params.version,article:{versions:[]}};
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
      let live = objectAssign({},json.versions[0]);
      that.setState({loaded:true,article:json,live,compute:true});
      return null;
    });
  }

  componentDidUpdate(prevProps, prevState){
    if(this.state.activeId != this.props.match.params.version || this.state.compute){
      let newActive;
      if(this.props.match.params.version == undefined){
        //set the live as the active view
        newActive = objectAssign({},this.state.live);
      }
      else{
        //find the correct version
        let that = this;
        newActive = objectAssign({yaml:'',md:'',bib:''},this.state.article.versions.find(function(version){return that.props.match.params.version == version.id}));
      }
      this.setState({activeId:this.props.match.params.version,active:newActive,compute:false});
    }
    if(store.getState().yamleditor.misc.changed){
      //updateYAML textarea here on yamleditor change;
      store.dispatch({type:"FORM_REGISTERED"});
      let midState = objectAssign({},this.state);
      //console.log("dumping : ",store.getState().yamleditor.obj);
      let yaml = '---\n'+YAML.safeDump(store.getState().yamleditor.obj)+'---';
      midState.live.yaml = yaml;
      midState.active.yaml = yaml;
      this.setState(midState);
    }
  }

  sendNewVersion(e,major=false,exportAfter=false,exportTarget="HTML"){
      if(exportAfter){
        if(exportTarget== "hypothes.is"){
          window.open('https://via.hypothes.is/https://stylo.14159.ninja/api/v1/export/'+json.id,'_blank');
        }
        else if(exportTarget!="HTML"){
          window.open('file:///home/marcello/Desktop/sp/git/chaineEditorialeSP/templates/xml.xml','_blank');
        }
        else{
          window.open('/api/v1/export/'+json.id,'_blank');
        }
      }
      return null;
  }
  render() {
    return (
      <section id="writeComponent">
          <h1>{this.state.article.title}</h1>
          <div>
            <Link to="/articles"  className="button secondaryButton">Back to My articles</Link>
            <button className={this.state.activeId?"button disabledButton":"button secondaryButton"} onClick={()=>this.sendNewVersion(null,true,false)}>Save as new version {this.state.live.version+1}.0</button>
            <button className={this.state.activeId?"button disabledButton":"button secondaryButton"} onClick={this.sendNewVersion}>QuickSave {this.state.live.version}.{this.state.live.revision+1}</button>
            <ExportVersion version={this.state.activeId} target="HTML"/>
            <ExportVersion version={this.state.activeId} target="hypothes.is"/>
            <ExportVersion version={this.state.activeId} target="EruditXML"/>
            </div>
          <p>{this.state.loaded?"Up to Date":"Fetching"}</p>
          <Timeline activeId={this.state.activeId} article={this.props.match.params.article} versions={this.state.article.versions}/>
          <CodeMirror value={this.state.active.md} options={{mode:'markdown',readOnly:true}}/>
          <textarea value={this.state.active.yaml} disabled={true} placeholder="YAML editor">
          </textarea>
          <textarea value={this.state.active.bib} disabled={true} placeholder="BIBtext">
          </textarea>
      </section>
    );
  }
}
