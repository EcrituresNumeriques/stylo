import { TextInput } from './TextInput.jsx';
import React from 'react';

export function People(props){
  return(
    <section className="group">
      <TextInput target={props.keyState+"["+props.index+"].surname"} title="Nom" state={props.state} updateState={props.updateState} readOnly={props.readOnly}/>
      <TextInput target={props.keyState+"["+props.index+"].forname"} title="Prénom" state={props.state} updateState={props.updateState} readOnly={props.readOnly}/>
      <TextInput target={props.keyState+"["+props.index+"].orcid"} title="Orcid" state={props.state} updateState={props.updateState} readOnly={props.readOnly}/>
      <TextInput target={props.keyState+"["+props.index+"].viaf"} title="VIAF" state={props.state} updateState={props.updateState} readOnly={props.readOnly}/>
      <TextInput target={props.keyState+"["+props.index+"].foaf"} title="FOAF" state={props.state} updateState={props.updateState} readOnly={props.readOnly}/>
      <TextInput target={props.keyState+"["+props.index+"].isni"} title="ISNI" state={props.state} updateState={props.updateState} readOnly={props.readOnly}/>
      <TextInput target={props.keyState+"["+props.index+"].wikidata"} title="Wikidata" state={props.state} updateState={props.updateState} readOnly={props.readOnly}/>
      {!props.readOnly && <p onClick={function(){props.updateState("",props.keyState,props.index)}}><i className="fa fa-user-minus" aria-hidden="true"></i> Supprimer</p>}
    </section>
  )
}