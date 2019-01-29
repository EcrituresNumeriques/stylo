import { People } from './People.jsx'
import React from 'react';
import _ from 'lodash';

export function Authors(props){
  let authors = _.get(props.state,"authors",[]);
  let targetNewAuthor = authors.length;
  return(
    <section>
      <h1><i className="fa fa-users" aria-hidden="true"></i> Auteurs</h1>
      {authors.map((o,i)=>(<People key={i} index={i} keyState="authors" state={props.state} updateState={props.updateState} readOnly={props.readOnly}/>))}
      {!props.readOnly && <p className="addToArray" onClick={function(){props.updateState({"forname": "","surname": "","orcid": "","viaf": "","foaf": "","isni": "","wikidata": ""},"authors["+targetNewAuthor+"]")}}><i className="fa fa-user-plus" aria-hidden="true"></i> Ajouter un auteur</p>}
    </section>
  )
}
