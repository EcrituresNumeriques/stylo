import { TextInput } from './TextInput.jsx';
import { SelectInput } from './SelectInput.jsx';
import React from 'react';
import _ from 'lodash';

export function Resumes(props){
  let resumes = _.get(props.state,"abstract",[]);
  let targetNewResume = resumes.length;
  return(
    <section>
      <h1><i className="fa fa-file-text-o" aria-hidden="true"></i> Résumés</h1>
      {resumes.map((o,i)=>(<Resume key={i} index={i} state={props.state} updateState={props.updateState}/>))}
      <p className="addToArray" onClick={function(){props.updateState({"lang":'',"text":'',"text_f":''},"abstract["+targetNewResume+"]")}}><i className="fa fa-plus" aria-hidden="true"></i> Ajouter un résumé dans une autre langue</p>
    </section>
  )
}

function Resume(props){
  return(
    <section className="group">
      <TextInput target={"abstract["+props.index+"].text_f"} alias={[{target:"abstract["+props.index+"].text",prefix:'',suffix:'',filterMD:true}]} title="Résumé" element="textArea"  state={props.state} updateState={props.updateState}/>
      <SelectInput target={"abstract["+props.index+"].lang"} title="Language" placeholder="Choisir la langue du résumé" options={['fr','en','it']}  state={props.state} updateState={props.updateState}/>
    </section>
  )
}
