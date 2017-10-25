import { TextInput } from './TextInput.jsx';
import { SelectInput } from './SelectInput.jsx';
import store from 'store/configureStore';
import React from 'react';
import _ from 'lodash';

export function Resumes(){
  let resumes = _.get(store.getState().obj,"abstract",[]);
  let targetNewResume = resumes.length;
  return(
    <section>
      <h1><i className="fa fa-file-text-o" aria-hidden="true"></i> Résumés</h1>
      {resumes.map((o,i)=>(<Resume key={i} index={i} />))}
      <p className="addToArray" onClick={function(){store.dispatch({type:"FORM_UPDATE",target:"abstract["+targetNewResume+"]",value:{"lang":'',"text":''}})}}><i className="fa fa-plus" aria-hidden="true"></i> Ajouter un résumé dans une autre langue</p>
    </section>
  )
}

function Resume(props){
  return(
    <section className="group">
      <TextInput target={"abstract["+props.index+"].text"} title="Résumé" element="textArea"/>
      <SelectInput target={"abstract["+props.index+"].lang"} title="Language" placeholder="Choisir la langue du résumé" options={['fr','en','it']}/>
    </section>
  )
}
