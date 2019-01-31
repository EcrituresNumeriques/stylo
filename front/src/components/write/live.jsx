import React, { Component } from 'react';
import objectAssign from 'object-assign';
import YamlEditor from 'components/yamleditor/YamlEditor';
import sortByDateDesc from 'helpers/sorts/dateDesc';
import _ from 'lodash';
import Timeline from 'components/write/Timeline';
import Sommaire from 'components/write/Sommaire';
import Biblio from 'components/write/Biblio';
import WordCount from 'components/write/WordCount';
import ModalTextarea from 'components/modals/ModalTextarea';
import ModalDualInput from 'components/modals/ModalDualInput';
import ModalExport from 'components/modals/ModalExport';
import {Controlled as CodeMirror} from 'react-codemirror2';
import Select from 'react-select';
import DiffMatchPatch from 'diff-match-patch';
require('codemirror/mode/markdown/markdown');


export default class Live extends Component {
  constructor(props) {
    super(props);
    this.instance = null;
    let defaultConfig = {biblioClosed:false,versionsClosed:false,sommaireClosed:false,statsClosed:false,previousScroll:0}
    if(window.innerWidth < 850){
      defaultConfig = {biblioClosed:true,versionsClosed:true,sommaireClosed:true,statsClosed:true,previousScroll:0}
    }
    //set state
    this.state = {
      ...defaultConfig,
      loaded:false,yaml:"title: loading",md:"",bib:"test",title:"Title",version:0,revision:0,versions:[],
      autosave:{},modalAddRef:false,modalSourceRef:false,modalExport:false,yamlEditor:false,editorYaml:false,compareTo:null,
      modalSourceZotero:false,
      zoteroURL:null,
      zoteroGroupID:null,
      zoteroCollectionKey:null,
      zoteroFetch:false
    };
    this.updateMD = this.updateMD.bind(this);
    this.updateMDCM = this.updateMDCM.bind(this);
    this.updateBIB = this.updateBIB.bind(this);
    this.addRef = this.addRef.bind(this);
    this.skipRef = this.skipRef.bind(this);
    this.openExportModal = this.openExportModal.bind(this);
    this.closeExportModal = this.closeExportModal.bind(this);
    this.addNewRef = this.addNewRef.bind(this);
    this.sourceRef = this.sourceRef.bind(this);
    this.closeSourceRef = this.closeSourceRef.bind(this);
    this.submitSourceRef = this.submitSourceRef.bind(this);
    this.sourceZotero = this.sourceZotero.bind(this);
    this.closeSourceZotero = this.closeSourceZotero.bind(this);
    this.submitSourceZotero = this.submitSourceZotero.bind(this);
    this.refreshZotero = this.refreshZotero.bind(this);
    this.updateYAML = this.updateYAML.bind(this);
    this.updatingYAML = this.updatingYAML.bind(this);
    this.sendNewVersion = this.sendNewVersion.bind(this);
    this.toggleYamlEditor = this.toggleYamlEditor.bind(this);
    this.toggleEditorYaml = this.toggleEditorYaml.bind(this);
    this.setCodeMirrorCursor = this.setCodeMirrorCursor.bind(this);
    this.handleScroll = _.throttle(this.handleScroll.bind(this),500);
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
      that.setState({loaded:true, title:json.title,version:json.versions[0].version,revision:json.versions[0].revision, versions:json.versions,md:json.versions[0].md,yaml:json.versions[0].yaml,bib:json.versions[0].bib,zoteroCollectionKey:json.versions[0].zoteroCollectionKey,zoteroURL:json.versions[0].zoteroURL,zoteroGroupID:json.versions[0].zoteroGroupID});
      return null;
    });
  }

  componentDidUpdate(prevProps, prevState){
  }

  sendNewVersion(e,major=false,autosave=false,exportAfter=false,exportTarget='HTML',preview=false,citations=false){
    let that = this;
    let title = 'a';
    let version = that.state.version;
    let revision = that.state.revision;
    let target = 'autosave';
    if(!autosave){
      target = '';
    }
    let corps = {autosave,major,version,revision,md:that.state.md,yaml:that.state.yaml,bib:that.state.bib,article:that.props.match.params.article,zoteroURL:this.state.zoteroURL,zoteroGroupID:this.state.zoteroGroupID,zoteroCollectionKey:this.state.zoteroCollectionKey};
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
        console.log(exportAfter,exportTarget,exportTarget=="PDF")
        if(exportTarget== "hypothes.is"){
          window.open('https://via.hypothes.is/'+window.location.protocol+'//'+window.location.hostname+'/api/v1/htmlArticle/'+json.article+'?preview=true','_blank');
        }
        else if(exportTarget=="eruditXML"){
          let parameters = "?preview=true";
          if(citations){parameters += "&citation="+citations}
          window.open('https://ecrituresnumeriques.github.io/saxon-xsl-transform/?source='+window.location.protocol+'//'+window.location.hostname+'/api/v1/htmlArticle/'+json.article+parameters,'_blank');
        }
        else if(exportTarget=="PDF"){
          console.log("HELLO")
          let format = "pdf";
          console.log(that.state)
          let parameters = "";
          if(citations){parameters += "&citation="+citations}
          if(format){parameters += "&format="+format}
          parameters += "&bibstyle=chicagomodified";
          window.open('http://localhost:9090/cgi-bin/exportArticle/exec.cgi?id='+that.state.title.replace(" ","_")+'v'+that.state.version+'-'+that.state.revision+'&version='+json.id+'&processor=xelatex&source='+window.location.protocol+'//'+window.location.hostname+'/'+parameters,'_blank');
        }
        else if(exportTarget=="ZIP"){
          window.open('/api/v1/zipArticle/'+json.article,'_blank');
        }
        else{
          let parameters = "?";
          if(preview){parameters += "preview=true&"}
          if(citations){parameters += "citation="+citations}
          window.open('/api/v1/htmlArticle/'+json.article+parameters,'_blank');
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
  openExportModal(){
      this.setState({modalExport:true});
  }
  closeExportModal(){
      this.setState({modalExport:false});
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
  sourceZotero(){
      this.setState({modalSourceZotero:true});
  }
  closeSourceZotero(){
      this.setState({modalSourceZotero:false});
  }
  submitSourceZotero(groupID,collectionKey = null){
      let zoteroURL =  'https://api.zotero.org/groups/';
      if(collectionKey){zoteroURL += `${groupID}/collections/${collectionKey}/items/?v=3&format=bibtex`}
      else{zoteroURL += groupID+'/items?v=3&format=bibtex';}
              this.setState({zoteroURL:zoteroURL,zoteroGroupID:groupID,zoteroCollectionKey:collectionKey,modalSourceZotero:false});
              this.refreshZotero(zoteroURL);
  }
  refreshZotero(zoteroURL = this.state.zoteroURL){
    this.setState({zoteroFetch:true});
    let that = this;
    fetch(zoteroURL,{
      method:'GET',
      credentials: 'same-origin'
    })
    .then(function(response){
      return response.text();
    })
    .then(function(bib){
      console.log('Fetched', bib)
      that.setState({zoteroFetch:false,bib:bib});
      that.autosave();
    });
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
      //Enable the left column tracking only for wider screens
        if(window.innerWidth > 850){
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
        else{
          this.refs.leftColumn.style.paddingTop = 0;
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

    computeDiff(text1,text2){
      let dmp = new DiffMatchPatch();
      let d = dmp.diff_main(text1, text2);
      dmp.diff_cleanupSemantic(d);
      return dmp.diff_prettyHtml(d);
    }

  render() {
    return ([
      <aside id="yamlEditor" key="yamlEditor">
        {!this.state.yamlEditor && <nav className="open" onClick={()=>this.toggleYamlEditor()}>Metadata</nav>}
        {this.state.yamlEditor && <nav className="close" onClick={()=>this.toggleYamlEditor()}>close</nav>}
        {this.state.yamlEditor && <nav className="toggleEditor" onClick={()=>this.toggleEditorYaml()}>Mode authors/editor</nav>}
        {this.state.yamlEditor && <YamlEditor editor={this.state.editorYaml} yaml={this.state.yaml} exportChange={this.updatingYAML}/>}
      </aside>,
      <section id="writeComponent" key="section" ref="leftColumn">
          <Timeline
              activeId='live'
              active={this.state}
              article={this.props.match.params.article}
              versions={this.state.versions}
              newVersion={()=>this.sendNewVersion(null,true,false)}
              newRevision={()=>this.sendNewVersion()}
              exportHypothesis={()=>this.sendNewVersion(null,false,true,true,"hypothes.is")}
              export = {()=>this.openExportModal()}
              closed={this.state.versionsClosed} toggle={this.toggleVersions}
          />
          {this.state.modalExport &&
            <ModalExport
              cancel={this.closeExportModal}
              exportHTML={(preview,citations)=>this.sendNewVersion(null,false,true,true,"HTML",preview,citations)}
              exportZIP={()=>this.sendNewVersion(null,false,true,true,"ZIP")}
              exportErudit={(preview,citations)=>this.sendNewVersion(null,false,true,true,"eruditXML",preview,citations)}
              exportPDF={(preview,citations)=>this.sendNewVersion(null,false,true,true,"PDF",preview,citations)}
            />
          }
          <Sommaire md={this.state.md} setCursor={this.setCodeMirrorCursor} closed={this.state.sommaireClosed} toggle={this.toggleSommaire}/>
          <Biblio bib={this.state.bib} addRef={this.addRef} sourceRef={this.sourceRef} closed={this.state.biblioClosed} toggle={this.toggleBiblio} sourceZotero={this.sourceZotero} refreshZotero={this.refreshZotero} zoteroURL={this.state.zoteroURL} zoteroFetch={this.state.zoteroFetch}/>
          <WordCount md={this.state.md} closed={this.state.statsClosed} toggle={this.toggleStats}/>
          {this.state.modalAddRef && <ModalTextarea cancel={this.skipRef} confirm={this.addNewRef} title="Add new reference(s)" text="please copy paste below the references you want to add in BiBtex format" placeholder={`@book{goody_raison_1979,
  series = {Le sens commun},
  title = {La {Raison} graphique. {La} domestication de la pensée sauvage.},
  publisher = {Les Editions de Minuit},
  author = {Goody, Jack},
  year = {1979},
}`}/>}
          {this.state.modalSourceRef && <ModalTextarea cancel={this.closeSourceRef} confirm={this.submitSourceRef} title="References" text="" placeholder="" value={this.state.bib}/>}
          {this.state.modalSourceZotero && <ModalDualInput cancel={this.closeSourceZotero} confirm={this.submitSourceZotero} title="Config Zotero" text={"Enter here the ID number of the group (needs to be public), and collection key if desired, as found in https://www.zotero.org/groups/{IDnumber}/{name}. Currently set to fetch from : "+this.state.zoteroURL} placeholder="IDnumber, ex 2229019"
          text2='(optional) Please enter the collection Key you want to fetch from, as found in https://www.zotero.org/groups/{IDnumber}/{name}/items/collectionKey/{collectionKey}' value={this.state.zoteroGroupID}
          value2={this.state.zoteroCollectionKey}
        />}
        </section>,
        <section id="input" key="inputs" ref="inputs" className={this.state.compareTo?"compared":"solo"}>
          <h1 id="title" key="title">{this.state.title} ({this.state.loaded?"Up to Date":"Fetching"})</h1>
          <Select
            id="citation-style"
            ref={(ref) => { this.versions = ref; }}
            onBlurResetsInput={false}
            onSelectResetsInput={false}
            options={[{value:null,label:'No compare'},...this.state.versions.filter((v)=>(!v.autosave)).map((v)=>({value:v.id,label:v.version+'.'+v.revision}))]}
            simpleValue
            clearable={false}
            name="citationStyle"
            disabled={false}
            value={this.state.compareTo}
            onChange={(e)=>(this.setState(function(state){state.compareTo = e;return state}))}
            rtl={false}
            searchable={false}
          />
          <CodeMirror value={this.state.md} onBeforeChange={this.updateMDCM} options={{mode:'markdown',lineWrapping:true,viewportMargin:Infinity,autofocus:true,spellcheck:true,extraKeys:{"Shift-Ctrl-Space": function(cm) {cm.replaceSelection("\u00a0");}}}} editorDidMount={editor => { this.instance = editor }}/>
          {this.state.compareTo && <div id="compareTo" dangerouslySetInnerHTML={{__html:this.computeDiff(this.state.versions.find((v)=>v.id==this.state.compareTo).md,this.state.md)}}></div>}
      </section>
      ]
    );
  }
}
