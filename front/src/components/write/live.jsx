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
import {Controlled as CodeMirror} from 'react-codemirror2'
require('codemirror/mode/markdown/markdown');


export default class Live extends Component {
  constructor(props) {
    super(props);
    //set state
    this.state = {loaded:false,yaml:"loading",md:"loading",bib:"loading",title:"Title",version:0,revision:0,versions:[], autosave:{}};
    this.updateMD = this.updateMD.bind(this);
    this.updateMDCM = this.updateMDCM.bind(this);
    this.updateBIB = this.updateBIB.bind(this);
    this.updateYAML = this.updateYAML.bind(this);
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
          function(state){
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
  updatingYAML(js){
      console.log(js);
    //let midState = objectAssign({},this.state);
    //midState.live.yaml = YAML.safeDump(js);
    //midState.active.yaml = YAML.safeDump(js);
    //this.setState(midState);
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

      </aside>,
      <section id="writeComponent" key="section">
          <h1>{this.state.title}</h1>
          <div>
            <Link to="/articles"  className="button secondaryButton">Back to My articles</Link>
            <button className="button secondaryButton" onClick={()=>this.sendNewVersion(null,true,false)}>Save as new version {this.state.version+1}.0</button>
            <button className="button secondaryButton" onClick={this.sendNewVersion}>QuickSave {this.state.version}.{this.state.revision+1}</button>
            <button className="button primaryButton" onClick={()=>this.sendNewVersion(null,false,true,true,"HTML")}>Export as HTML</button>
            <button className="button" onClick={()=>this.sendNewVersion(null,false,true,true,"hypothes.is")}>Export on hypothes.is</button>
            <button className="button" onClick={()=>this.sendNewVersion(null,false,true,true,"EruditXML")}>Export as EruditXML</button>
          </div>
          <p>{this.state.loaded?"Up to Date":"Fetching"}</p>
          <Timeline activeId='live' article={this.props.match.params.article} versions={this.state.versions}/>
          <CodeMirror value={this.state.md} onBeforeChange={this.updateMDCM} options={{mode:'markdown',lineNumber:true}}/>
          <textarea value={this.state.yaml} disabled={true} placeholder="YAML editor">
          </textarea>
          <textarea value={this.state.bib}  onChange={this.updateBIB} placeholder="BIBtext">
          </textarea>
      </section>
      ]
    );
  }
}
