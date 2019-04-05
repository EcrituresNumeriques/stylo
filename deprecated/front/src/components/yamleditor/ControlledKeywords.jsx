import React from 'react'
import _ from 'lodash'

export function ControlledKeywords(props){
  let categories = _.get(props.state,"categories",[]);
  categories = categories.map((o)=>(Object.assign({},o))).map(function(c,i){c.id=i;return c;});
  return(
      <section className="group">
        <h1><i className="fa fa-tag" aria-hidden="true"></i> Mots clés Contrôlés</h1>
        <datalist id="keywordsFR">
          {categories.map((o,i)=>(<option key={"keywordsFR"+i} value={o.label}/>))}
        </datalist>
        {categories.filter((c)=>c.selected).map((o,i)=>(<Keyword key={"keywords"+i} object={o} controlled={true} updateMisc={props.updateMisc} readOnly={props.readOnly}/>))}
        {!props.readOnly && <InputKeyword updateMisc={props.updateMisc} state={props.state}/>}
      </section>
    )
  }

function Keyword(props){
      return(
        <div className="keywords">
          <input className="controlled" type="text" placeholder="label" value={props.object.label} readOnly="true"/>
          {!props.readOnly && <i className="fa fa-minus-circle" aria-hidden="true" data-id={props.index} onClick={()=>props.updateMisc(false,"categories["+props.object.id+"].selected","removeControlled")}></i>}
        </div>
      )
  }


function InputKeyword(props){
    return(
      <div className="keywords">
        <input type="text" id="kwFR" placeholder="mot clé" list="keywordsFR" value={props.state.keywordSearch || ""} onInput={(e)=>props.updateMisc(e.target.value,'keywordSearch','controlledKeywords')}/>
      </div>
    )
}
