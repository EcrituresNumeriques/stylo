import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import store from 'store/configureStore';
import objectAssign from 'object-assign';
import sortByIdDesc from 'helpers/sorts/idDesc';
import ExportVersion from 'components/write/export';
import YamlEditor from 'components/yamleditor/YamlEditor';
import YAML from 'js-yaml';
import Timeline from 'components/write/Timeline';
import Sommaire from 'components/write/Sommaire';
import Biblio from 'components/write/Biblio';
import {Controlled as CodeMirror} from 'react-codemirror2';
import promptUser from 'helpers/UI/prompt';
require('codemirror/mode/markdown/markdown');

export default class Write extends Component {
  constructor(props) {
    super(props);
    //set state
    this.state = {loaded:false,live:{yaml:"",md:"",bib:""},active:{yaml:"",md:"",bib:""},activeId:this.props.match.params.version,article:{versions:[]}};
    this.exportVersion = this.exportVersion.bind(this);
    this.fetchAPI = this.fetchAPI.bind(this);
    this.tagVersion = this.tagVersion.bind(this);
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
      json.versions = [...json.versions].sort(sortByIdDesc);
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
  }

  exportVersion(exportTarget="HTML"){
          if(exportTarget== "hypothes.is"){
            window.open('https://via.hypothes.is/https://stylo.14159.ninja/api/v1/exportVersion/'+this.state.active.id,'_blank');
          }
          else if(exportTarget=="eruditXML"){
            window.open('file:///home/marcello/Desktop/sp/git/chaineEditorialeSP/templates/xml.xml','_blank');
          }
          else if(exportTarget=="previewHTML"){
            window.open('/api/v1/previewVersion/'+this.state.active.id,'_blank');
          }
          else{
            window.open('/api/v1/exportVersion/'+this.state.active.id,'_blank');
          }
      return null;
  }

  tagVersion(id){
      const that = this;
      const callback = function(title){
          fetch('/api/v1/versions/'+that.state.activeId,{
              method:'PATCH',
              body: JSON.stringify({title:title}),
              credentials: 'same-origin'
          })
          .then(function(response){
              return response.json();
          })
          .then(function(json){
              return json.title;
          });
          return title;
      }
      const title = promptUser('Tag this versions',this.state.active.title || this.state.active.version+"."+this.state.active.revision,callback);
      this.setState(function(state){
          let newState = objectAssign({},state);
          newState.active.title = title;
          //find out why this mutate any state when going to live
          let versions = [...newState.article.versions]
          versions.find(function(version){return that.state.active.id == version.id}).title = title;
          const returnState = objectAssign({},newState);
          //active.title = title;
          return returnState;
      });
  }

  render() {
    return (
      <section id="writeComponent">
          <h1>{this.state.article.title}</h1>
          <p>{this.state.loaded?"Up to Date":"Fetching"}</p>
          <Timeline activeId={this.state.activeId}
              active={this.state.active}
              article={this.props.match.params.article}
              versions={this.state.article.versions}
              tagVersion={this.tagVersion}
              exportHTML={()=>this.exportVersion("HTML")}
              previewHTML={()=>this.exportVersion("previewHTML")}
              exportHypothesis={()=>this.exportVersion("hypothes.is")}
              exportErudit={()=>this.exportVersion("eruditXML")}
          />
          <CodeMirror value={this.state.active.md} options={{mode:'markdown',readOnly:true,lineWrapping:true}}/>
          <textarea value={this.state.active.yaml} disabled={true} placeholder="YAML editor">
          </textarea>
          <textarea value={this.state.active.bib} disabled={true} placeholder="BIBtext">
          </textarea>
      </section>
    );
  }
}
