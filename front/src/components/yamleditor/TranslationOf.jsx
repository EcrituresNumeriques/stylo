import { TextInput } from './TextInput.jsx';
import { SelectInput } from './SelectInput.jsx';
import React from 'react';
import _ from 'lodash';

export function TranslationOf(props){
  let translationsOf = _.get(props.state,"translationOf",[]);
  let targetNewTranslationsOf = translationsOf.length;
  return(
    <section>
      <h1><i className="fa fa-file-text-o" aria-hidden="true"></i> Traductions de</h1>
      {translationsOf.map((o,i)=>(<Translation key={i} index={i} state={props.state} updateState={props.updateState} readOnly={props.readOnly}/>))}
      {!props.readOnly && <p className="addToArray" onClick={function(){props.updateState({"lang":'',"title":'',"url":''},"translationOf["+targetNewTranslationsOf+"]")}}><i className="fa fa-plus" aria-hidden="true"></i> Ajouter une autre traduction</p>}
    </section>
  )
}

function Translation(props){
  return(
    <section className="group">
      <TextInput target={"translationOf["+props.index+"].titre"} title="Titre"  state={props.state} updateState={props.updateState} readOnly={props.readOnly}/>
      <TextInput target={"translationOf["+props.index+"].url"} title="URL"  state={props.state} updateState={props.updateState} readOnly={props.readOnly}/>
      <SelectInput target={"translationOf["+props.index+"].lang"} title="Langue" placeholder="Choisir la langue du résumé" options={['fr','en','it','es','es','pt','de','uk','ar']}  state={props.state} updateState={props.updateState} readOnly={props.readOnly}/>
      {!props.readOnly && <p onClick={function(){props.updateState("","translationOf",props.index)}}><i className="fa fa-user-minus" aria-hidden="true"></i> Supprimer</p>}
    </section>
  )
}
