import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import store from 'store/configureStore';
import objectAssign from 'object-assign';
import ExportVersion from 'components/write/export';
import YamlEditor from 'components/yamleditor/YamlEditor';
import sortByDateDesc from 'helpers/sorts/dateDesc';
import _ from 'lodash';
import YAML from 'js-yaml';
import Timeline from 'components/write/Timeline';
import Sommaire from 'components/write/Sommaire';
import Biblio from 'components/write/Biblio';
import {Controlled as CodeMirror} from 'react-codemirror2'
require('codemirror/mode/markdown/markdown');


export default class Live extends Component {
  constructor(props) {
    super(props);
    //set state
    this.state = {loaded:false,yaml:"title: loading",md:"# loading",bib:"loading",title:"Title",version:0,revision:0,versions:[], autosave:{}};
    this.updateMD = this.updateMD.bind(this);
    this.updateMDCM = this.updateMDCM.bind(this);
    this.updateBIB = this.updateBIB.bind(this);
    this.updateYAML = this.updateYAML.bind(this);
    this.updatingYAML = this.updatingYAML.bind(this);
    this.sendNewVersion = this.sendNewVersion.bind(this);
    this.autosave = _.debounce(this.autosave,1000);
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
      json.versions = json.versions.sort(sortByDateDesc);
      that.setState({loaded:true, title:json.title,version:json.versions[0].version,revision:json.versions[0].revision, versions:json.versions,md:json.versions[0].md,yaml:json.versions[0].yaml,bib:json.versions[0].bib});
      return null;
    });
  }

  componentDidUpdate(prevProps, prevState){
  }

  sendNewVersion(e,major=false,autosave=false,exportAfter=false,exportTarget='HTML'){
    let that = this;
    let title = 'a';
    let version = that.state.version;
    let revision = that.state.revision;
    let target = 'autosave';
    if(!autosave){
      target = '';
    }
    let corps = {autosave,major,article:that.state.id,version,revision,md:that.state.md,yaml:that.state.yaml,bib:that.state.bib,article:that.props.match.params.article};
    fetch('/api/v1/versions/'+target,{
      method:'POST',
      body: JSON.stringify(corps),
      credentials: 'same-origin'
    })
    .then(function(response){
      return response.json();
    })
    .then(function(json){
      that.setState(
          function(stateOld){
              let state = objectAssign({},stateOld);
              if(json.autosave){
                state.versions = state.versions.filter(version => !(version.version == state.version && version.revision == state.revision && version.autosave == true && version.owner == json.owner));
              }
              else{
                state.versions = state.versions.filter(version => !(version.version == state.version && version.revision == state.revision && version.autosave == true && version.owner == json.owner));
              }
              state.versions.push(json);
              state.versions = state.versions.sort(sortByDateDesc);
              state.version = json.version;
              state.revision = json.revision;
              return state;
          }
      );
      if(exportAfter){
        if(exportTarget== "hypothes.is"){
          window.open('https://via.hypothes.is/https://stylo.14159.ninja/api/v1/previewArticle/'+json.article,'_blank');
        }
        else if(exportTarget=="eruditXML"){
          window.open('file:///home/marcello/Desktop/sp/git/chaineEditorialeSP/templates/xml.xml','_blank');
        }
        else if(exportTarget=="previewHTML"){
          window.open('/api/v1/previewArticle/'+json.article,'_blank');
        }
        else{
          window.open('/api/v1/exportArticle/'+json.article,'_blank');
        }
      }

      return null;
    });
  }

  autosave(){
      this.sendNewVersion(null,false,true);
  }

  updateMD(e){
    const md = e.target.value;
    this.setState(
        function(state){
            state.md = md;
            return state;
        }
    );
    this.autosave();
  }

  updateMDCM(editor, data, md){
    this.setState(
        function(state){
            state.md = md;
            return state;
        }
    );
    this.autosave();
  }

  updateYAML(e){
      const yaml = e.target.value;
      this.setState(
          function(state){
              state.yaml = yaml;
              return state;
          }
      );
  }
  updatingYAML(yaml){
      //console.log("exported",yaml);
      this.setState(
          function(state){
              state.yaml = yaml;
              return state;
      });
      this.autosave();
  }
  updateBIB(e){
      const bib = e.target.value;
      this.setState(
          function(state){
              state.bib = bib;
              return state;
          }
      );
      this.autosave();
  }


  render() {
    return ([
      <aside id="yamlEditor" key="yamlEditor">
        <YamlEditor editor={false} yaml={this.state.yaml} exportChange={this.updatingYAML}/>
      </aside>,
      <section id="writeComponent" key="section">
        <h1>{this.state.title} ({this.state.loaded?"Up to Date":"Fetching"})</h1>
          <Timeline
              activeId='live'
              active={this.state}
              article={this.props.match.params.article}
              versions={this.state.versions}
              newVersion={()=>this.sendNewVersion(null,true,false)}
              newRevision={()=>this.sendNewVersion()}
              exportHTML={()=>this.sendNewVersion(null,false,true,true,"HTML")}
              previewHTML={()=>this.sendNewVersion(null,false,true,true,"previewHTML")}
              exportHypothesis={()=>this.sendNewVersion(null,false,true,true,"hypothes.is")}
              exportErudit={()=>this.sendNewVersion(null,false,true,true,"eruditXML")}
              downloadAll={()=>this.sendNewVersion(null,false,true,true,"zip")}
          />
          <Sommaire md={this.state.md}/>
          <Biblio bib={this.state.bib}/>
        </section>,
        <section id="input" key="inputs">
          <CodeMirror value={this.state.md} onBeforeChange={this.updateMDCM} options={{mode:'markdown',lineWrapping:true,viewportMargin:Infinity}}/>
          <textarea value={this.state.yaml} disabled={true}  placeholder="yaml">
          </textarea>
          <textarea value={this.state.bib}  onChange={this.updateBIB} placeholder="BIBtext">
          </textarea>
      </section>
      ]
    );
  }
}
