import React, { Component } from 'react';
import { TextInput } from './TextInput.jsx';
import { Resumes} from './Resumes.jsx';
import { Authors } from './Authors.jsx';
import { Dossier } from './Dossier.jsx';
import { Reviewers } from './Reviewers.jsx';
import { Date} from './Date.jsx';
import { Rubriques} from './Rubriques.jsx';
import { ControlledKeywords} from './ControlledKeywords.jsx';
import { Keywords} from './Keywords.jsx';
import _ from 'lodash';
import {init} from './default/init.js';
require('./default/rubriques.json');
require('./default/transformKeywords.json');
const removeMd = require('remove-markdown');
const ST = require('stjs');


export default class YamlEditor extends Component {
  constructor(props){
    super(props);
    this.state = {obj:_.get(props,'yaml',init.obj),misc:init.misc};
    console.log(this.state);
    this.updateState = this.updateState.bind(this);
    this.updateMisc = this.updateMisc.bind(this);
    this.addKeyword = this.addKeyword.bind(this);
    this.removeKeyword = this.removeKeyword.bind(this);
    const that = this;

    //load rubriques if provided
    if(props.rubriques){
        fetch(props.rubriques)
        .then(function(response) {
            return response.json();
        })
        .then(function(rubriques) {
            that.updateMisc(rubriques,'rubriques','rubriques');
        });
    }

    //load keywords if provided
    if(props.keywords){
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

  componentWillReceiveProps(nextProp){
      this.updateState(nextProp.yaml);
  }

  componentWillUpdate(nextProp,nextState){
    this.props.exportChange(nextState.obj);
  }

  updateState(value,target = undefined){
    //No target, update the whole state, don't export
    if(!target){
      this.setState({obj:value});
      //Need to decompile rubriques/MotsClefs
      this.setState(function(state){
        //set all rubriques to not selected then select from yaml
        state.misc.rubriques.map((r)=>(r.selected=false));
        if(state.obj)
        {state.obj.typeArticle.map(function(r){
          state.misc.rubriques.filter((o)=>(o.label==r)).map((o)=>(o.selected=true));
          return r;
        });
        //Set all controlled keyword to not selected then select from yaml
        state.misc.categories.map((c)=>(c.selected=false));
        if(!state.obj.controlledKeywords){state.obj.controlledKeywords = []}
        state.obj.controlledKeywords.map(c=>c.label).map(function(c){
          state.misc.categories.filter((o)=>(o.label==c)).map((o)=>(o.selected=true));
          return c;
        });
        }
        return state;
      });



    }
    //Update only the key changed, plus export the new state
    else{
      //console.log("changing key",target,value);
      this.setState((state)=>_.set(state, 'obj.'+target, value));
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
  addKeyword(values){
    //Update only the key changed, plus export the new state
      console.log("adding",this.state.misc.keyword_fr_f,this.state.misc.keyword_en_f);
      this.setState(function(state){
        //Padd arrays in case they are not the same length
        while(state.misc.keywords_en.length < state.misc.keywords_fr.length){
          state.misc.keywords_en.push("");
        }
        while(state.misc.keywords_fr.length < state.misc.keywords_en.length){
          state.misc.keywords_fr.push("");
        }

        //Add new keyword
        state.misc.keywords_fr.push(this.state.misc.keyword_fr_f || "");
        state.misc.keywords_en.push(this.state.misc.keyword_en_f || "");
        state.obj.keyword_fr_f = state.misc.keywords_fr.join(', ');
        state.obj.keyword_en_f = state.misc.keywords_en.join(', ');
        state.obj.keyword_fr = removeMd(state.misc.keywords_fr.join(', '));
        state.obj.keyword_en = removeMd(state.misc.keywords_en.join(', '));
        state.misc.keyword_fr_f = "";
        state.misc.keyword_en_f = "";
        return state;
      });
  }
  removeKeyword(index){
    //Update only the key changed, plus export the new state
      console.log("removing",index);
      this.setState(function(state){
        state.misc.keywords_fr.splice(index,1);
        state.misc.keywords_en.splice(index,1);
        state.obj.keyword_fr_f = state.misc.keywords_fr.join(', ');
        state.obj.keyword_en_f = state.misc.keywords_en.join(', ');
        state.obj.keyword_fr = removeMd(state.misc.keywords_fr.join(', '));
        state.obj.keyword_en = removeMd(state.misc.keywords_en.join(', '));
        return state;
      });
  }



  render(){
    return(
      <section>
        <TextInput target="id_sp" alias={[{target:'bibliography',prefix:'',suffix:'.bib'}]} title="Identifiant" placeholder="SPxxxx" state={this.state.obj} updateState={this.updateState} />
        <TextInput target="title_f" alias={[{target:'title',prefix:'',suffix:'',filterMD:true}]} title="Titre" state={this.state.obj} updateState={this.updateState} />
        <TextInput target="subtitle_f" alias={[{target:'subtitle',prefix:'',suffix:'',filterMD:true}]} title="Sous-titre" state={this.state.obj} updateState={this.updateState} />
        <Date target="date" title="Date" state={this.state.obj} updateState={this.updateState} />
        <TextInput target="url_article_sp" title="URL sens public" placeholder="http://sens-public.org/articleXXXX.html" state={this.state.obj} updateState={this.updateState} />
        <Resumes state={this.state.obj}  updateState={this.updateState} />
        <Dossier state={this.state.obj} updateState={this.updateState} />
        <Authors state={this.state.obj} updateState={this.updateState} />
        <Reviewers state={this.state.obj} updateState={this.updateState} />
        <ControlledKeywords state={this.state.misc} updateMisc={this.updateMisc} />
        <Keywords state={this.state} updateMisc={this.updateMisc} addKeyword={this.addKeyword} removeKeyword={this.removeKeyword} updateState={this.updateState}/>
        <Rubriques state={this.state.misc} updateMisc={this.updateMisc} />
      </section>
    )
  }
}
