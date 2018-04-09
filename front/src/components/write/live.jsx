import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import store from 'store/configureStore';
import objectAssign from 'object-assign';
import ExportVersion from 'components/write/export';
import YamlEditor from 'components/yamleditor/YamlEditor';
import YAML from 'js-yaml';

export default class Live extends Component {
  constructor(props) {
    super(props);
    //set state
    this.state = {loaded:false,yaml:"loading",md:"loading",bib:"loading",title:"Title",version:0,revision:0,versions:[]};
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
      that.setState({loaded:true, title:json.title, versions:json.versions,md:json.versions[json.versions.length-1].md,yaml:json.versions[json.versions.length-1].yaml,bib:json.versions[json.versions.length-1].bib});
      return null;
    });
  }

  componentDidUpdate(prevProps, prevState){
  }

  sendNewVersion(){

  }

  render() {
    return ([
      <aside id="yamlEditor">

      </aside>,
      <section id="writeComponent">
          <h1>{this.state.title}</h1>
          <div>
            <Link to="/articles"  className="button secondaryButton">Back to My articles</Link>
            <button className="button secondaryButton" onClick={()=>this.sendNewVersion(null,true,false)}>Save as new version {this.state.version+1}.0</button>
            <button className="button secondaryButton" onClick={this.sendNewVersion}>QuickSave {this.state.version}.{this.state.revision+1}</button>
            <button className="button primaryButton" onClick={()=>this.sendNewVersion(null,false,true,"HTML")}>Export as HTML</button>
            <button className="button" onClick={()=>this.sendNewVersion(null,false,true,"hypothes.is")}>Export on hypothes.is</button>
            <button className="button" onClick={()=>this.sendNewVersion(null,false,true,"EruditXML")}>Export as EruditXML</button>
          </div>
          <p>{this.state.loaded?"Up to Date":"Fetching"}</p>
          <div id="timeline">
            <Link to={"/write/"+this.props.match.params.article} className="active">Edit</Link>
            {this.state.versions.map((version)=>(
              <Link to={"/write/"+this.props.match.params.article+"/"+version.id} key={"versionWrite"+version.id} data-id={"versionWrite"+version.id} className={this.state.activeId == version.id?"active":"" }>v{version.version}.{version.revision}</Link>
            ))}
          </div>
          <textarea value={this.state.md} onInput={this.updateMD} placeholder="Markdown">
          </textarea>
          <textarea value={this.state.yaml} disabled={true} placeholder="YAML editor">
          </textarea>
          <textarea value={this.state.bib}  onInput={this.updateBIB} placeholder="BIBtext">
          </textarea>
      </section>
      ]
    );
  }
}
