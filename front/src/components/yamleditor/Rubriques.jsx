import React from 'react'
import _ from 'lodash'

export function Rubriques(props){
  let rubriques = _.get(props.state,"rubriques",[]);
  return(
      <section className="group">
        <h1><i className="fa fa-check-square-o" aria-hidden="true"></i> Catégories</h1>
        {rubriques.map((o,i)=>(<Rubrique key={i} index={i} label={o.label} value={o.selected} updateMisc={props.updateMisc} readOnly={props.readOnly}/>))}
      </section>
    )
  }

  function Rubrique(props){
    return(
      <section className="reactForm">
        <input type="checkbox" className="icheckbox" checked={props.value} disabled={props.readOnly} onChange={(e)=>props.updateMisc(e.target.checked,"rubriques["+props.index+"].selected","rubriques")}/>
        <label className="lcheckbox">{props.label}</label>
      </section>
    )
  }
