import { TextInput } from './TextInput.jsx';
import React from 'react';
import _ from 'lodash';

export function Dossier(props){
  let redacteurDossier = props.state.redacteurDossier || [];
  let targetNewDossier = redacteurDossier.length;
  return(
    <section>
      <h1><i className="fa fa-users" aria-hidden="true"></i> Dossier</h1>
        <TextInput target={"dossier[0].title"} title="Titre du dossier"  state={props.state} updateState={props.updateState} readOnly={props.readOnly}/>
        <TextInput target={"dossier[0].id"} title="Id du dossier"  state={props.state} updateState={props.updateState} readOnly={props.readOnly}/>
      {redacteurDossier.map((o,i)=>(<Redacteur key={i} index={i} state={props.state} updateState={props.updateState} readOnly={props.readOnly}/>))}
      {!props.readOnly && <p className="addToArray" onClick={function(){props.updateState({"forname": "","surname": "","orcid": "","viaf": "","foaf": "","isni": "","wikidata": ""},"redacteurDossier["+targetNewDossier+"]");}}><i className="fa fa-user-plus" aria-hidden="true"></i> Ajouter un Redacteur du dossier</p>}
    </section>
  )
}

function Redacteur(props){
  return(
    <section className="group">
      <TextInput target={"redacteurDossier["+props.index+"].surname"} title="Nom"  state={props.state} updateState={props.updateState} readOnly={props.readOnly}/>
      <TextInput target={"redacteurDossier["+props.index+"].forname"} title="Prénom"  state={props.state} updateState={props.updateState} readOnly={props.readOnly}/>
      <TextInput target={"redacteurDossier["+props.index+"].orcid"} title="Orcid"  state={props.state} updateState={props.updateState} readOnly={props.readOnly}/>
      <TextInput target={"redacteurDossier["+props.index+"].viaf"} title="VIAF"  state={props.state} updateState={props.updateState} readOnly={props.readOnly}/>
      <TextInput target={"redacteurDossier["+props.index+"].foaf"} title="FOAF"  state={props.state} updateState={props.updateState} readOnly={props.readOnly}/>
      <TextInput target={"redacteurDossier["+props.index+"].isni"} title="ISNI"  state={props.state} updateState={props.updateState} readOnly={props.readOnly}/>
      <TextInput target={"redacteurDossier["+props.index+"].wikidata"} title="Wikidata"  state={props.state} updateState={props.updateState} readOnly={props.readOnly}/>
    </section>
  )
}
