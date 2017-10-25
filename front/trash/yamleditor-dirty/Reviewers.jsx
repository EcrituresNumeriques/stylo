import { TextInput } from './TextInput.jsx';
import { SelectInput } from './SelectInput.jsx';
import store from 'store/configureStore';
import React from 'react';
import _ from 'lodash';

export function Reviewers(){
  let reviewers = _.get(store.getState().obj,"reviewers",[]);
  let targetNewReviewer = reviewers.length;
  return(
    <section>
      <h1><i className="fa fa-eye" aria-hidden="true"></i> Réviseurs</h1>
      {reviewers.map((o,i)=>(<Reviewer key={i} index={i} />))}
      <p className="addToArray" onClick={function(){store.dispatch({type:"FORM_UPDATE",target:"reviewers["+targetNewReviewer+"]",value: {"name": "","surname": "","orcid": "","viaf": "","foaf": "","isni": ""}})}}><i className="fa fa-user-plus" aria-hidden="true"></i> Ajouter un réviseur</p>
    </section>
  )
}

function Reviewer(props){
  return(
    <section className="group">
      <TextInput target={"reviewers["+props.index+"].name"} title="Nom"/>
      <TextInput target={"reviewers["+props.index+"].forname"} title="Prénom"/>
      <TextInput target={"reviewers["+props.index+"].orcid"} title="Orcid"/>
      <TextInput target={"reviewers["+props.index+"].viaf"} title="VIAF"/>
      <TextInput target={"reviewers["+props.index+"].foaf"} title="FOAF"/>
      <TextInput target={"reviewers["+props.index+"].isni"} title="ISNI"/>
    </section>
  )
}
