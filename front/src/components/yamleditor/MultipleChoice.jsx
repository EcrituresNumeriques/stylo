import React from 'react'
import _ from 'lodash'

export function MultipleChoice(props){
    return (
      <section className="reactForm">
        <label>{props.title} :</label>
        <select onChange={(e)=>props.updateState(e.target.value,props.target)} disabled={props.readOnly} value={_.get(props.state,props.target,"")}>
          {props.options.map((o,i)=>(<option value={o.value} key={"select"+o.value}>{o.label}</option>))}
        </select>
      </section>
    )
}
