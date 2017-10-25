import { TextInput } from './TextInput.jsx';
import { SelectInput } from './SelectInput.jsx';
import store from 'store/configureStore';
import React from 'react';
import _ from 'lodash';

export function Dossier(){
  let redacteurDossier = _.get(store.getState().yamleditor.obj,"redacteurDossier",[]);
  let targetNewDossier = redacteurDossier.length;
  return(
    <section>
      <h1><i className="fa fa-users" aria-hidden="true"></i> Dossier</h1>
        <TextInput target={"dossier[0].title"} title="Titre du dossier"/>
        <TextInput target={"dossier[0].id"} title="Id du dossier"/>
      {redacteurDossier.map((o,i)=>(<Redacteur key={i} index={i} />))}
      <p className="addToArray" onClick={function(){store.dispatch({type:"FORM_UPDATE",target:"redacteurDossier["+targetNewDossier+"]",value: {"forname": "","surname": "","orcid": "","viaf": "","foaf": "","isni": "","wikidata": ""}})}}><i className="fa fa-user-plus" aria-hidden="true"></i> Ajouter un Redacteur du dossier</p>
    </section>
  )
}

function Redacteur(props){
  return(
    <section className="group">
      <TextInput target={"redacteurDossier["+props.index+"].surname"} title="Nom"/>
      <TextInput target={"redacteurDossier["+props.index+"].forname"} title="Prénom"/>
      <TextInput target={"redacteurDossier["+props.index+"].orcid"} title="Orcid"/>
      <TextInput target={"redacteurDossier["+props.index+"].viaf"} title="VIAF"/>
      <TextInput target={"redacteurDossier["+props.index+"].foaf"} title="FOAF"/>
      <TextInput target={"redacteurDossier["+props.index+"].isni"} title="ISNI"/>
      <TextInput target={"redacteurDossier["+props.index+"].wikidata"} title="Wikidata"/>
    </section>
  )
}
