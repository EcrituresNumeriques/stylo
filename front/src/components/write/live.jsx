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
import WordCount from 'components/write/WordCount';
import ModalTextarea from 'components/modals/ModalTextarea';
import {Controlled as CodeMirror} from 'react-codemirror2'
require('codemirror/mode/markdown/markdown');


export default class Live extends Component {
  constructor(props) {
    super(props);
    this.instance = null;
    //set state
    this.state = {loaded:false,yaml:"title: loading",md:"",bib:"test",title:"Title",version:0,revision:0,versions:[], autosave:{},modalAddRef:false,modalSourceRef:false,yamlEditor:false,editorYaml:false,biblioClosed:false,versionsClosed:false,sommaireClosed:false,statsClosed:false,previousScroll:0};
    this.updateMD = this.updateMD.bind(this);
    this.updateMDCM = this.updateMDCM.bind(this);
    this.updateBIB = this.updateBIB.bind(this);
    this.addRef = this.addRef.bind(this);
    this.skipRef = this.skipRef.bind(this);
    this.addNewRef = this.addNewRef.bind(this);
    this.sourceRef = this.sourceRef.bind(this);
    this.closeSourceRef = this.closeSourceRef.bind(this);
    this.submitSourceRef = this.submitSourceRef.bind(this);
    this.updateYAML = this.updateYAML.bind(this);
    this.updatingYAML = this.updatingYAML.bind(this);
    this.sendNewVersion = this.sendNewVersion.bind(this);
    this.toggleYamlEditor = this.toggleYamlEditor.bind(this);
    this.toggleEditorYaml = this.toggleEditorYaml.bind(this);
    this.setCodeMirrorCursor = this.setCodeMirrorCursor.bind(this);
    this.handleScroll = this.handleScroll.bind(this);
    this.toggleBiblio = this.toggleBiblio.bind(this);
    this.toggleVersions = this.toggleVersions.bind(this);
    this.toggleSommaire = this.toggleSommaire.bind(this);
    this.toggleStats = this.toggleStats.bind(this);
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
          window.open('https://via.hypothes.is/'+window.location.protocol+'//'+window.location.hostname+'/api/v1/previewArticle/'+json.article,'_blank');
        }
        else if(exportTarget=="eruditXML"){
          window.open('https://ecrituresnumeriques.github.io/saxon-xsl-transform/?source='+window.location.protocol+'//'+window.location.hostname+'/api/v1/previewArticle/'+json.article,'_blank');
        }
        else if(exportTarget=="previewHTML"){
          window.open('/api/v1/exportArticle/'+json.article+'?preview=true','_blank');
        }
        else if(exportTarget=="ZIP"){
          window.open('/api/v1/zipArticle/'+json.article,'_blank');
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
  setCodeMirrorCursor(line){
      this.instance.focus();
      this.instance.setCursor(line,0);
  }
  addRef(){
      this.setState({modalAddRef:true});
  }
  skipRef(){
      this.setState({modalAddRef:false});
  }
  addNewRef(newRef){
      this.setState({bib:this.state.bib+'\n'+newRef,modalAddRef:false});
      this.autosave();
  }
  sourceRef(){
      this.setState({modalSourceRef:true});
  }
  closeSourceRef(){
      this.setState({modalSourceRef:false});
  }
  submitSourceRef(newSource){
              this.setState({bib:newSource,modalSourceRef:false});
              this.autosave();
  }
  toggleYamlEditor(){
      this.setState({yamlEditor:!this.state.yamlEditor});
  }
  toggleEditorYaml(){
      this.setState({editorYaml:!this.state.editorYaml});
  }

      componentDidMount() {
        window.addEventListener('scroll', this.handleScroll);
    }

    componentWillUnmount() {
        window.removeEventListener('scroll', this.handleScroll);
    }

    handleScroll(event) {
        const movement = this.state.previousScroll - window.scrollY;
        this.setState({previousScroll:window.scrollY});
        //Attention, ne pas surcharger cette methode, Peut grandement ralentir le front-end
        const height = window.scrollY + window.innerHeight;
        const headerPlusMargin = 73;
        const diffHeight = height - (this.refs.leftColumn.offsetHeight + headerPlusMargin );
        const previousPadding = parseInt(this.refs.leftColumn.style.paddingTop) || 0;
        if(window.scrollY < headerPlusMargin && previousPadding){
            //console.log("reset Scroll",window.scrollY,headerPlusMargin,previousPadding);
            this.refs.leftColumn.style.paddingTop = 0;
        }
        else if(window.scrollY > headerPlusMargin && diffHeight > 0 && movement < 0){
            //console.log("Add padding",diffHeight,window.scrollY,headerPlusMargin,previousPadding);
            //Need to add paddingTop to the left column
            //console.log(previousPadding);
            //console.log(previousPadding,diffHeight,height);
            this.refs.leftColumn.style.paddingTop = previousPadding + diffHeight + "px";
        }
        else if(window.scrollY > headerPlusMargin && window.scrollY < (headerPlusMargin + previousPadding) && movement > 0){
                //console.log("Remove padding",(headerPlusMargin + previousPadding),window.scrollY);
                this.refs.leftColumn.style.paddingTop = (window.scrollY - headerPlusMargin + 10) + "px";
        }
    }

    toggleBiblio(){
        this.setState({biblioClosed:!this.state.biblioClosed});
    }
    toggleVersions(){
        this.setState({versionsClosed:!this.state.versionsClosed});
    }
    toggleSommaire(){
        this.setState({sommaireClosed:!this.state.sommaireClosed});
    }
    toggleStats(){
        this.setState({statsClosed:!this.state.statsClosed});
    }

  render() {
    return ([
      <aside id="yamlEditor" key="yamlEditor">
        {!this.state.yamlEditor && <nav className="open" onClick={()=>this.toggleYamlEditor()}>Metadata</nav>}
        {this.state.yamlEditor && <nav className="close" onClick={()=>this.toggleYamlEditor()}>close</nav>}
        {this.state.yamlEditor && <nav className="toggleEditor" onClick={()=>this.toggleEditorYaml()}>Mode authors/editor</nav>}
        {this.state.yamlEditor && <YamlEditor editor={this.state.editorYaml} yaml={this.state.yaml} exportChange={this.updatingYAML}/>}
      </aside>,
        <h1 id="title" key="title">{this.state.title} ({this.state.loaded?"Up to Date":"Fetching"})</h1>,
      <section id="writeComponent" key="section" ref="leftColumn">
          <Timeline
              activeId='live'
              active={this.state}
              article={this.props.match.params.article}
              versions={this.state.versions}
              newVersion={()=>this.sendNewVersion(null,true,false)}
              newRevision={()=>this.sendNewVersion()}
              exportHTML={()=>this.sendNewVersion(null,false,true,true,"HTML")}
              exportZIP={()=>this.sendNewVersion(null,false,true,true,"ZIP")}
              previewHTML={()=>this.sendNewVersion(null,false,true,true,"previewHTML")}
              exportHypothesis={()=>this.sendNewVersion(null,false,true,true,"hypothes.is")}
              exportErudit={()=>this.sendNewVersion(null,false,true,true,"eruditXML")}
              downloadAll={()=>this.sendNewVersion(null,false,true,true,"zip")}
              closed={this.state.versionsClosed} toggle={this.toggleVersions}
          />
          <Sommaire md={this.state.md} setCursor={this.setCodeMirrorCursor} closed={this.state.sommaireClosed} toggle={this.toggleSommaire}/>
          <Biblio bib={this.state.bib} addRef={this.addRef} sourceRef={this.sourceRef} closed={this.state.biblioClosed} toggle={this.toggleBiblio}/>
          <WordCount md={this.state.md} closed={this.state.statsClosed} toggle={this.toggleStats}/>
          {this.state.modalAddRef && <ModalTextarea cancel={this.skipRef} confirm={this.addNewRef} title="Add new reference(s)" text="please copy paste below the references you want to add in BiBtex format" placeholder="@misc{schnapp_knowledge_2013, address = {Hannover},	type = {Lecture}, title = {Knowledge {Design} {Incubating} new knowledge forms / genres / spaces in the laboratory of the digital humanities}, shorttitle = {Knowledge {Design}}, url = {https://www.volkswagenstiftung.de/en/news/news-details/news/detail/artikel/herrenhausen-lecture-knowledge-design-1/marginal/4296.html}, language = {EN},	author = {Schnapp, Jeffrey}, month = {12}, year = {2013},	file = {HH_lectures_Schnapp_01.pdf:/home/nicolas/Zotero/storage/6AZA85MP/HH_lectures_Schnapp_01.pdf:application/pdf}}"/>}
          {this.state.modalSourceRef && <ModalTextarea cancel={this.closeSourceRef} confirm={this.submitSourceRef} title="References" text="" placeholder="" value={this.state.bib}/>}
        </section>,
        <section id="input" key="inputs" ref="inputs">
          <CodeMirror value={this.state.md} onBeforeChange={this.updateMDCM} options={{mode:'markdown',lineWrapping:true,viewportMargin:Infinity,autofocus:true}} editorDidMount={editor => { this.instance = editor }}/>
      </section>
      ]
    );
  }
}
