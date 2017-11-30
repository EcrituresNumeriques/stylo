import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import store from 'store/configureStore';
import objectAssign from 'object-assign';
import sortByIdDesc from 'helpers/sorts/idDesc';
import ExportVersion from 'components/write/export';
import YamlEditor from 'components/yamleditor/Main';
import YAML from 'js-yaml';

export default class Write extends Component {
  constructor(props) {
    super(props);
    //set state
    this.state = {loaded:false,live:{},active:{},activeId:this.props.match.params.version,article:{versions:[]}};
    this.sendNewVersion = this.sendNewVersion.bind(this);
    this.fetchAPI = this.fetchAPI.bind(this);
    this.updateMD = this.updateMD.bind(this);
    this.updateBIB = this.updateBIB.bind(this);
    this.updateYAML = this.updateYAML.bind(this);
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
        newActive = objectAssign({},this.state.article.versions.find(function(version){return that.props.match.params.version == version.id}));
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
    let that = this;
    let version = major?this.state.live.version+1:this.state.live.version;
    let revision = major?0:this.state.live.revision+1;
    let corps = {article:this.state.article.id,owner:this.state.article.owner,version,revision,md:this.state.live.md,yaml:this.state.live.yaml,bib:this.state.live.bib};
    fetch('/api/v1/versions/',{
      method:'POST',
      body: JSON.stringify(corps),
      credentials: 'same-origin'
    })
    .then(function(response){
      return response.json();
    })
    .then(function(json){
      let midState = objectAssign({},that.state);
      //Don't know why this still works
      //midState.article.versions = [json,...midState.article.versions];
      midState.live.version = version;
      midState.live.revision = revision;
      midState.live.yaml = json.yaml;
      that.setState(midState);
      if(exportAfter){
        if(exportTarget== "hypotes.is"){
          window.open('https://via.hypothes.is/https://stylo.14159.ninja/api/v1/export/'+json.id,'_blank');
        }
        else if(exportTarget!="HTML"){
          window.open('file:///home/marcello/Desktop/sp/git/chaineEditorialeSP/templates/xml.xml','_blank');
        }
        else{
          window.open('/api/v1/export/'+json.id,'_blank');
        }
      }
      store.dispatch({type:"ARTICLES_ADDVERSION",data:json});
      return null;
    });
  }

  updateMD(e){
    let midState = objectAssign({},this.state);
    midState.live.md = e.target.value;
    midState.active.md = e.target.value;
    this.setState(midState);

  }
  updateYAML(e){
    let midState = objectAssign({},this.state);
    midState.live.yaml = e.target.value;
    midState.active.yaml = e.target.value;
    this.setState(midState);
  }
  updateBIB(e){
    let midState = objectAssign({},this.state);
    midState.live.bib = e.target.value;
    midState.active.bib = e.target.value;
    this.setState(midState);
  }

  render() {
    return ([
      <aside id="yamlEditor">
        {!this.state.activeId && <YamlEditor {...this.state.live}/>}
      </aside>,
      <section id="writeComponent">
          <h1>{this.state.article.title}</h1>
          <div>
            <Link to="/articles"  className="button secondaryButton">Back to My articles</Link>
            <button className={this.state.activeId?"button disabledButton":"button secondaryButton"} onClick={()=>this.sendNewVersion(null,true,false)}>Save as new version {this.state.live.version+1}.0</button>
            <button className={this.state.activeId?"button disabledButton":"button secondaryButton"} onClick={this.sendNewVersion}>QuickSave {this.state.live.version}.{this.state.live.revision+1}</button>
            {this.state.activeId && <ExportVersion version={this.state.activeId} target="HTML"/>}
            {!this.state.activeId && <button className="button primaryButton" onClick={()=>this.sendNewVersion(null,false,true)}>Export as HTML</button>}
            {this.state.activeId && <ExportVersion version={this.state.activeId} target="hypothes.is"/>}
            {!this.state.activeId && <button className="button" onClick={()=>this.sendNewVersion(null,false,true)}>Annotate</button>}
            {this.state.activeId && <ExportVersion version={this.state.activeId} target="EruditXML"/>}
            {!this.state.activeId && <button className="button" onClick={()=>this.sendNewVersion(null,false,true,"EruditXML")}>Export as EruditXML</button>}
          </div>
          <p>{this.state.loaded?"Up to Date":"Fetching"}</p>
          <div id="timeline">
            <Link to={"/write/"+this.props.match.params.article} className={this.state.activeId?"":"active"}>Edit</Link>
            {this.state.article.versions.map((version)=>(
              <Link to={"/write/"+this.props.match.params.article+"/"+version.id} key={"versionWrite"+version.id} data-id={"versionWrite"+version.id} className={this.state.activeId == version.id?"active":"" }>v{version.version}.{version.revision}</Link>
            ))}
          </div>
          <textarea value={this.state.active.md} disabled={this.state.activeId} onInput={this.updateMD} placeholder="Markdown">
          </textarea>
          <textarea value={this.state.active.yaml} disabled={true} placeholder="YAML editor">
          </textarea>
          <textarea value={this.state.active.bib} disabled={this.state.activeId} onInput={this.updateBIB} placeholder="BIBtext">
          </textarea>
      </section>
      ]
    );
  }
}
