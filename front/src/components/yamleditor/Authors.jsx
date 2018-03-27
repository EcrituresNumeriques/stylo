import { TextInput } from './TextInput.jsx';
import React from 'react';
import _ from 'lodash';

export function Authors(props){
  let authors = _.get(props.state,"authors",[]);
  let targetNewAuthor = authors.length;
  return(
    <section>
      <h1><i className="fa fa-users" aria-hidden="true"></i> Auteurs</h1>
      {authors.map((o,i)=>(<Author key={i} index={i} state={props.state} updateState={props.updateState}/>))}
      <p className="addToArray" onClick={function(){props.updateState({"forname": "","surname": "","orcid": "","viaf": "","foaf": "","isni": "","wikidata": ""},"authors["+targetNewAuthor+"]")}}><i className="fa fa-user-plus" aria-hidden="true"></i> Ajouter un auteur</p>
    </section>
  )
}

function Author(props){
  return(
    <section className="group">
      <TextInput target={"authors["+props.index+"].surname"} title="Nom" state={props.state} updateState={props.updateState}/>
      <TextInput target={"authors["+props.index+"].forname"} title="Prénom" state={props.state} updateState={props.updateState}/>
      <TextInput target={"authors["+props.index+"].orcid"} title="Orcid" state={props.state} updateState={props.updateState}/>
      <TextInput target={"authors["+props.index+"].viaf"} title="VIAF" state={props.state} updateState={props.updateState}/>
      <TextInput target={"authors["+props.index+"].foaf"} title="FOAF" state={props.state} updateState={props.updateState}/>
      <TextInput target={"authors["+props.index+"].isni"} title="ISNI" state={props.state} updateState={props.updateState}/>
      <TextInput target={"authors["+props.index+"].wikidata"} title="Wikidata" state={props.state} updateState={props.updateState}/>
    </section>
  )
}
