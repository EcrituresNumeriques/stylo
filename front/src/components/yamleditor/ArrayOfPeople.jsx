import { People } from './People.jsx'
import React from 'react';
import _ from 'lodash';

export function ArrayOfPeople(props){
  let peoples = _.get(props.state,props.target,[]);
  let targetNewPeople = peoples.length;
  return(
    <section>
      <h1><i className="fa fa-users" aria-hidden="true"></i>{props.titre}</h1>
      {peoples.map((o,i)=>(<People key={i} index={i} keyState={props.target} state={props.state} updateState={props.updateState} readOnly={props.readOnly}/>))}
      {!props.readOnly && <p className="addToArray" onClick={function(){props.updateState({"forname": "","surname": "","orcid": "","viaf": "","foaf": "","isni": "","wikidata": ""},props.target+"["+targetNewPeople+"]")}}><i className="fa fa-user-plus" aria-hidden="true"></i> Ajouter un {props.action}</p>}
    </section>
  )
}
