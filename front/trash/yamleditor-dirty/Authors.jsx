import { TextInput } from './TextInput.jsx';
import { SelectInput } from './SelectInput.jsx';
import store from 'store/configureStore';
import React from 'react';
import _ from 'lodash';

export function Authors(){
  let authors = _.get(store.getState().obj,"authors",[]);
  let targetNewAuthor = authors.length;
  return(
    <section>
      <h1><i className="fa fa-users" aria-hidden="true"></i> Auteurs</h1>
      {authors.map((o,i)=>(<Author key={i} index={i} />))}
      <p className="addToArray" onClick={function(){store.dispatch({type:"FORM_UPDATE",target:"authors["+targetNewAuthor+"]",value: {"forname": "","surname": "","orcid": "","viaf": "","foaf": "","isni": "","wikidata": ""}})}}><i className="fa fa-user-plus" aria-hidden="true"></i> Ajouter un auteur</p>
    </section>
  )
}

function Author(props){
  return(
    <section className="group">
      <TextInput target={"authors["+props.index+"].surname"} title="Nom"/>
      <TextInput target={"authors["+props.index+"].forname"} title="Prénom"/>
      <TextInput target={"authors["+props.index+"].orcid"} title="Orcid"/>
      <TextInput target={"authors["+props.index+"].viaf"} title="VIAF"/>
      <TextInput target={"authors["+props.index+"].foaf"} title="FOAF"/>
      <TextInput target={"authors["+props.index+"].isni"} title="ISNI"/>
      <TextInput target={"authors["+props.index+"].wikidata"} title="Wikidata"/>
    </section>
  )
}
