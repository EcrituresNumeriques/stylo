import { TextInput } from './TextInput.jsx';
import React from 'react';
import _ from 'lodash';

export function Reviewers(props){
  let reviewers = _.get(props.state,"reviewers",[]);
  let targetNewReviewer = reviewers.length;
  return(
    <section>
      <h1><i className="fa fa-eye" aria-hidden="true"></i> Réviseurs</h1>
      {reviewers.map((o,i)=>(<Reviewer key={i} index={i} state={props.state} updateState={props.updateState}/>))}
      <p className="addToArray" onClick={function(){props.updateState({"name": "","surname": "","orcid": "","viaf": "","foaf": "","isni": ""},"reviewers["+targetNewReviewer+"]")}}><i className="fa fa-user-plus" aria-hidden="true"></i> Ajouter un réviseur</p>
    </section>
  )
}

function Reviewer(props){
  return(
    <section className="group">
      <TextInput target={"reviewers["+props.index+"].name"} title="Nom" state={props.state} updateState={props.updateState}/>
      <TextInput target={"reviewers["+props.index+"].surname"} title="Prénom" state={props.state} updateState={props.updateState}/>
      <TextInput target={"reviewers["+props.index+"].orcid"} title="Orcid" state={props.state} updateState={props.updateState}/>
      <TextInput target={"reviewers["+props.index+"].viaf"} title="VIAF" state={props.state} updateState={props.updateState}/>
      <TextInput target={"reviewers["+props.index+"].foaf"} title="FOAF" state={props.state} updateState={props.updateState}/>
      <TextInput target={"reviewers["+props.index+"].isni"} title="ISNI" state={props.state} updateState={props.updateState}/>
    </section>
  )
}
