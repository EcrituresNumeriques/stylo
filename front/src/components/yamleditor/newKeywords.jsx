import React from 'react'
import {SelectInput} from './SelectInput.jsx'
import {TextInput} from './TextInput.jsx'
import _ from 'lodash'

export function Keywords(props){
  const keywords_lang = _.get(props.state,"obj.keywords",[]);
  const targetNewKeywordLang = keywords_lang.length
  return(
      <section className="group">
        <h1><i className="fa fa-tag" aria-hidden="true"></i> Mots-clés</h1>
        {keywords_lang.map((o,i)=>(<KeywordLang key={"keyword"+i} object={o} index={i} state={props.state} updateState={props.updateState} readOnly={props.readOnly}/>))}
        {!props.readOnly && <p className="addToArray" onClick={function(){props.updateState({lang:"",list:"",list_f:""},"keywords["+targetNewKeywordLang+"]")}}><i className="fa fa-user-plus" aria-hidden="true"></i> Ajouter une langue</p>}
      </section>
    )
  }

  function KeywordLang(props){
      const updateKeywords = (keywords,indexLang,keyword,index)=>{
        keywords[index] = keyword
        if(keyword.endsWith(",")){
          {keywords = [...keywords.slice(0,index),"",keyword.replace(/\,$/, ''),keywords.slice(index+1)]}
        }
        else if(keyword === ""){keywords = [...keywords.slice(0,index),...keywords.slice(index+1)]}
        props.updateState(keywords.join(',').replace(/\,$/, ''),"keywords["+indexLang+"].list_f")
      }
      const keywords = props.object.list_f.split(',')
      return(
        <div className="keywords">
          <SelectInput target={"keywords["+props.index+"].lang"} title="Language" placeholder="Choisir la langue des mot-clés" options={['fr','en','ita','es','es','pt','de','uk','ar']}  state={props.state.obj} updateState={props.updateState} readOnly={props.readOnly}/>

          {keywords.map((k,i)=>(<input key={"keywordLang"+props.index+"-"+i} value={k} onChange={(e)=>updateKeywords(keywords,props.index,e.target.value,i)}/>))}
          {!props.readOnly && <p onClick={function(){props.updateState("","keywords",props.index)}}><i className="fa fa-user-minus" aria-hidden="true"></i> Supprimer</p>}
        </div>
      )
  }