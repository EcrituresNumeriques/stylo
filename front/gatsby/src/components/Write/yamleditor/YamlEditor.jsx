import React, { Component } from 'react';
import { TextInput } from './TextInput.jsx';
import { SelectInput } from './SelectInput.jsx';
import { MultipleChoice } from './MultipleChoice.jsx';
import { Resumes} from './Resumes.jsx';
import { TranslationOf } from './TranslationOf.jsx';
import { ArrayOfPeople } from './ArrayOfPeople.jsx';
import { Dossier } from './Dossier.jsx';
import { Date} from './Date.jsx';
import { Rubriques} from './Rubriques.jsx';
import { ControlledKeywords} from './ControlledKeywords.jsx';
import { Keywords} from './Keywords.jsx';
import ImportYaml from './ImportYaml.jsx';
import _ from 'lodash';
import {init} from './default/init.js';
const ST = require('stjs');
const YAML = require('js-yaml');
const removeMd = require('remove-markdown');

require('./default/rubriques.json');
require('./default/transformKeywords.json');

let SexyYamlType = new YAML.Type('!sexy', {
  kind: 'sequence', // See node kinds in YAML spec: http://www.yaml.org/spec/1.2/spec.html#kind//
  construct: function (data) {
    return data.map(function (string) { return 'sexy ' + string; });
  }
});
let SEXY_SCHEMA = YAML.Schema.create([ SexyYamlType ]);


export default class YamlEditor extends Component {
  constructor(props){
    super(props);
    //load defaultYaml, merge it with specified yaml
    const defaultYaml = YAML.load(init.yaml, { schema: SEXY_SCHEMA }) || {};
    const singleYaml = props.yaml.replace(/[\-]{3}\n/g, "").replace(/\n[\-]{3}/g, "");
    let parsed = {}
    try{
      parsed = YAML.load(singleYaml, { schema: SEXY_SCHEMA }) || {};
      props.error("")
    }
    catch(e){
      props.error(e.reason + e.message.split("\n")[0])
    }
    const jsObj = {...defaultYaml,...parsed}
    const miscInit = JSON.parse(JSON.stringify(init.misc));
    this.state = {obj:jsObj,misc:this.computeFromYaml(jsObj,miscInit)};
    this.updateState = this.updateState.bind(this);
    this.updateMisc = this.updateMisc.bind(this);
    this.computeFromYaml = this.computeFromYaml.bind(this);
    const that = this;
    this.readOnly = false;
    if(!props.exportChange){
        this.readOnly = true;
    }

    //load rubriques if provided
    if(props.rubriques){
      //check if it is a string(URL) or Object
      if(typeof props.rubriques == 'string'){
        fetch(props.rubriques)
        .then(function(response) {
          return response.json();
        })
        .then(function(rubriques) {
          console.log("rubriques1",rubriques);
          that.updateMisc(rubriques,'rubriques','rubriques');
        });
      }
      else if (typeof props.rubriques == 'object') {
        console.log("rubriques2",props.rubriques);
        that.updateMisc(props,'rubriques','rubriques');
      }
    }

    //load keywords if provided as an object
    if(props.keywords && typeof props.keywords == 'object'){
      console.log("updating keywords");
    }
    //load keywords if provided as URL
    if(props.keywords && typeof props.keywords == 'string'){
        fetch(props.keywords)
        .then(function(response) {
            return response.json();
            //return {}
        })
        .then(function(keywords) {
            if(props.transformKeywords){
                fetch(props.transformKeywords)
                .then(function(response) {
                    return response.json();
                    //return {}
                })
                .then(function(transformKeywords) {
                    //mot clés controllés
                    const controlled = ST.select(keywords.filter(o=>o.aligned))
                    	.transformWith(transformKeywords.categories)
                    	.root();
                    that.updateMisc(controlled,'categories');

                    //non controllés
                    const uncontrolled = ST.select(keywords.filter(o => !o.aligned))
                        .transformWith(transformKeywords.keywords)
                        .root();

                    //fr
                    const uncontrolled_fr = uncontrolled.filter(k => k.language == "fr").map(k => k.label);
                    that.updateMisc(uncontrolled_fr,'uncontrolled_fr');

                    //en
                    const uncontrolled_en = uncontrolled.filter(k => k.language == "en").map(k => k.label);
                    that.updateMisc(uncontrolled_en,'uncontrolled_en');
                });
            }

            else{
                //mot clés controllés
                let controlled = keywords.filter(k => k.aligned).map(function(k){k.selected=false;return k});
                that.updateMisc(controlled,'categories');

                //mot clés non-controllés
                const uncontrolled = keywords.filter(k => !k.aligned);

                //fr
                const uncontrolled_fr = uncontrolled.filter(k => k.language == "fr").map(k => k.label);
                that.updateMisc(uncontrolled_fr,'uncontrolled_fr');

                //en
                const uncontrolled_en = uncontrolled.filter(k => k.language == "en").map(k => k.label);
                that.updateMisc(uncontrolled_en,'uncontrolled_en');
            }

        });
    }
  }

  computeFromYaml(jsObj,misc){
    jsObj = jsObj || {};
    jsObj.typeArticle = jsObj.typeArticle || [];
    jsObj.typeArticle.map((r)=>console.log("r",r));
    //Add rubriques
    jsObj.typeArticle.map(function(r){
      misc.rubriques.filter((o)=>(o.label==r)).map((o)=>(o.selected=true));
      return r;
    });
    //Add controlledKeywords
    jsObj.controlledKeywords = jsObj.controlledKeywords || []
    jsObj.controlledKeywords.map(c=>c.label).map(function(c){
      misc.categories.filter((o)=>(o.label==c)).map((o)=>(o.selected=true));
      return c;
    });
    return misc;
  }

  componentWillReceiveProps(nextProp){
      const singleYaml = nextProp.yaml.replace(/[\-]{3}\n/g, "").replace(/\n[\-]{3}/g, "");
      const singleYamlObj = YAML.load(singleYaml, { schema: SEXY_SCHEMA });
      if(JSON.stringify(singleYamlObj) != JSON.stringify(this.state.obj)){
        //console.log("New props, updating state",JSON.stringify(singleYamlObj),JSON.stringify(this.state.obj));
        this.updateState(singleYamlObj);
      }
  }

  cleanOutput(object){
    let cleaning = JSON.parse(JSON.stringify(object))
    for (var propName in cleaning) { 
      if (cleaning[propName] === null || cleaning[propName] === undefined || cleaning[propName] === "") {
        delete cleaning[propName];
      }
      if(Array.isArray(cleaning[propName]) && cleaning[propName].length === 0){
        delete cleaning[propName];
        //console.log("deleting",propName)  
      }
    }
    return cleaning
  }

  componentWillUpdate(nextProp,nextState){
    //console.log("componentWillUpdate",nextProp.yaml,YAML.safeDump(nextState.obj), nextProp.yaml != '---\n'+YAML.safeDump(nextState.obj)+'---');
    if(this.props.exportChange){
      if(nextProp.yaml != '---\n'+YAML.safeDump(this.cleanOutput(nextState.obj))+'---'){
        console.log(this.cleanOutput(nextState.obj))
        this.props.exportChange('---\n'+YAML.safeDump(this.cleanOutput(nextState.obj))+'---');
      }
    }
  }



  updateState(value,target = undefined,removeFromArray = undefined){
    //No target, update the whole state, don't export
    if(!target){
      const miscInit = JSON.parse(JSON.stringify(init.misc));
      this.setState({obj:value,misc:this.computeFromYaml(value,miscInit)});
    }
    //Update only the key changed, plus export the new state
    else{
      //Remove target array, removing removeFromArray index
      if(typeof(removeFromArray) == "number"){
        this.setState((state)=>{
          let nextArray = _.get(state,'obj.'+target);
          _.set(state, 'obj.'+target, [...nextArray.slice(0,removeFromArray),...nextArray.slice(removeFromArray+1)])
          return state
        })
      }
      //console.log("changing key",target,value);
      else{this.setState((state)=>_.set(state, 'obj.'+target, value))}
    }
  }

  updateMisc(value,target,type = undefined){
    //Update only the key changed, plus export the new state
      //console.log("changing key",target,value);
      this.setState((state)=>_.set(state, 'misc.'+target, value));
      //Need to calculate the next state.obj
      if(type=="rubriques"){
        this.setState((state)=>_.set(state,'obj.typeArticle',state.misc.rubriques.filter((r)=>(r.selected)).map(r=>r.label)));
      }
      else if(type=="controlledKeywords"){
        //Check if a controlled keyword match the search
        this.setState(function(state){
            let toSet = state.misc.categories.filter((c)=>(c.label==value));
            if(toSet.length > 0){
              toSet.map(c=>c.selected=true);
              state.misc.keywordSearch = "";
              state.obj.controlledKeywords = state.misc.categories.filter((c)=>c.selected).map((o)=>(Object.assign({},o))).map(function(o){delete o.selected;return o;});
            }
            return state;
          });
      }
      else if (type=="removeControlled") {
        this.setState(function(state){
          state.obj.controlledKeywords = state.misc.categories.filter((c)=>c.selected).map((o)=>(Object.assign({},o))).map(function(o){delete o.selected;return o;});
          return state;
        });
      }
      else if (type=='uncontrolledKeywords'){
        this.setState(function(state){
          state.obj.keyword_fr_f = state.misc.keywords_fr.join(', ');
          state.obj.keyword_en_f = state.misc.keywords_en.join(', ');
          state.obj.keyword_fr = removeMd(state.misc.keywords_fr.join(', '));
          state.obj.keyword_en = removeMd(state.misc.keywords_en.join(', '));
          return state;
        });
      }
    }
    
  render(){
    return(
      <section className={this.readOnly?"readOnly":""}>

        {this.props.editor && <ImportYaml state={this.state} updateState={this.updateState} />}
        
        {this.props.editor && <TextInput target="id" title="ID" placeholder="XXXXX" state={this.state.obj} updateState={this.updateState} readOnly={this.readOnly}/>}
        {this.props.editor && <TextInput target="url_article" title="URL of the article" state={this.state.obj} updateState={this.updateState}  readOnly={this.readOnly}/>}
        <TextInput target="title_f" alias={[{target:'title',prefix:'',suffix:'',filterMD:true}]} title="Title" state={this.state.obj} updateState={this.updateState}  readOnly={this.readOnly}/>
        <TextInput target="subtitle_f" alias={[{target:'subtitle',prefix:'',suffix:'',filterMD:true}]} title="Subtitle" state={this.state.obj} updateState={this.updateState}  readOnly={this.readOnly}/>
        <Date target="date" title="Date" state={this.state.obj} updateState={this.updateState} readOnly={this.readOnly} />
        <SelectInput target={"lang"} title="Lang" placeholder="Choose lang of the text" options={['fr','en','it','es','es','pt','de','uk','ar']}  state={this.state.obj} updateState={this.updateState} readOnly={this.readOnly}/>
        <TextInput target="rights" title="Licence" state={this.state.obj} updateState={this.updateState}  readOnly={this.readOnly}/>
        <section>
          <h1>Bibliographie</h1>
          
          {this.props.editor && <MultipleChoice target={"link-citations"} title="Citation Link" options={[{label:"yes",value:true},{label:"no link", value:false}]}  state={this.state.obj} updateState={this.updateState} readOnly={this.readOnly}/>}
          
          <MultipleChoice target={"nocite"} title="Display" options={[{label:"All citations",value:"@*"},{label:"Only used", value:""}]}  state={this.state.obj} updateState={this.updateState} readOnly={this.readOnly}/>
        </section>
        
        <ArrayOfPeople target="authors" titre="Authors" action="author" state={this.state.obj} updateState={this.updateState} readOnly={this.readOnly}/>
        <Resumes state={this.state.obj}  updateState={this.updateState}  readOnly={this.readOnly}/>
        <Keywords state={this.state} updateMisc={this.updateMisc} updateState={this.updateState} readOnly={this.readOnly}/>
        {this.props.editor && <ControlledKeywords state={this.state.misc} updateMisc={this.updateMisc} readOnly={this.readOnly} />}
        {this.props.editor && <Rubriques state={this.state.misc} updateMisc={this.updateMisc} readOnly={this.readOnly} />}
        
        {this.props.editor && <section>
          <h1>Diffusion</h1>
          {this.props.editor && <TextInput target="publisher" title="Publisher" state={this.state.obj} updateState={this.updateState}  readOnly={this.readOnly}/>}
          {this.props.editor && <TextInput target="journal" title="Journal" state={this.state.obj} updateState={this.updateState}  readOnly={this.readOnly}/>}
          {this.props.editor && <ArrayOfPeople target="director" titre="Directors" action="director" state={this.state.obj} updateState={this.updateState} readOnly={this.readOnly}/>}  
          {this.props.editor && <TextInput target="issnum" title="ISSN" state={this.state.obj} updateState={this.updateState}  readOnly={this.readOnly}/>}  
          {this.props.editor && <TextInput target="prod" title="Productor" state={this.state.obj} updateState={this.updateState}  readOnly={this.readOnly}/>}
          {this.props.editor && <TextInput target="prodnum" title="Prodnum" state={this.state.obj} updateState={this.updateState}  readOnly={this.readOnly}/>}
          {this.props.editor && <TextInput target="diffnum" title="Diffnum" state={this.state.obj} updateState={this.updateState}  readOnly={this.readOnly}/>}
          {this.props.editor && <Dossier state={this.state.obj} updateState={this.updateState} readOnly={this.readOnly} />}
          {this.props.editor && <ArrayOfPeople target="issueDirectors" titre="Directeurs du dossier" action="directeur" state={this.state.obj} updateState={this.updateState} readOnly={this.readOnly}/>}
        </section>}

        {this.props.editor && <ArrayOfPeople target="reviewers" titre="Réviseurs" action="réviseur" state={this.state.obj} updateState={this.updateState} readOnly={this.readOnly}/>}
        
        {this.props.editor && <ArrayOfPeople target="translators" titre="Translators" action="translator" state={this.state.obj} updateState={this.updateState} readOnly={this.readOnly}/>}
        
        {this.props.editor && <TranslationOf state={this.state.obj}  updateState={this.updateState}  readOnly={this.readOnly}/>}
        
        {this.props.editor && <ArrayOfPeople target="transcriber" titre="Transcribers" action="transcriber" state={this.state.obj} updateState={this.updateState} readOnly={this.readOnly}/>}
      
      </section>
    )
  }
}
