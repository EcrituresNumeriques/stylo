import React from 'react'
import _ from 'lodash'

export function SelectInput(props){
    return (
      <section className="reactForm">
        <label>{props.title} :</label>
        <select onChange={(e)=>props.updateState(e.target.value,props.target)} disabled={props.readOnly} value={_.get(props.state,props.target,"")}>
          <option value="" disabled>{props.placeholder}</option>
          {props.options.map((o,i)=>(<option value={o} key={i}>{o}</option>))}
        </select>
      </section>
    )
}
