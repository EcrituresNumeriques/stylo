import { TextInput } from './TextInput.jsx'
import { SelectInput } from './SelectInput.jsx'
import store from 'store/configureStore';
import React from 'react'
import _ from 'lodash'

export function Collaborateurs(){
  let resumes = _.get(store.getState().obj,"abstract",[]);
  let targetNewResume = resumes.length;
  return(
    <section>
      <TextInput title="Auteurs"/>
      <TextInput title="Reviseurs"/>
    </section>
  )
}
