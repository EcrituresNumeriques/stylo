import { CheckBoxInput } from './CheckBoxInput.jsx'
import store from 'store/configureStore';
import React from 'react'
import _ from 'lodash'

export function Rubriques(){
  let rubriques = _.get(store.getState().misc,"rubriques",[]);
  return(
      <section className="group">
        <h1><i className="fa fa-check-square-o" aria-hidden="true"></i> Catégories</h1>
        {rubriques.map((o,i)=>(<Rubrique key={i} index={i} label={o.label}/>))}
      </section>
    )
  }

  function Rubrique(props){
    return(
        <CheckBoxInput target={"rubriques["+props.index+"].selected"} title={props.label} />
    )
  }
