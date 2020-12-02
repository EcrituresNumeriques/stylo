import React, { Component } from 'react';

import ModalTextarea from './ModalTextarea.jsx';
import YAML from 'js-yaml';

let SexyYamlType = new YAML.Type('!sexy', {
  kind: 'sequence', // See node kinds in YAML spec: http://www.yaml.org/spec/1.2/spec.html#kind//
  construct: function (data) {
    return data.map(function (string) { return 'sexy ' + string; });
  }
});
let SEXY_SCHEMA = YAML.Schema.create([ SexyYamlType ]);

export default class ImportYaml extends Component {
  constructor(props){
    super(props);
    this.state = {import:false};
    this.toggleImport = this.toggleImport.bind(this);
    this.importYaml = this.importYaml.bind(this);
  }

  toggleImport(){
    this.setState(function(state){
      state.import = !state.import;
      return state;
    });
  }

  importYaml(overideYaml){
    try{
      const singleYaml = overideYaml.replace(/[-]{3}\n/g, "").replace(/\n[-]{3}/g, "");
      const jsObj = YAML.load(singleYaml, { schema: SEXY_SCHEMA }) || {};
      const newYamlObj = {...this.props.state.obj,...jsObj}
      this.props.updateState(newYamlObj);
      this.toggleImport();
    }
    catch(e){
      alert(e);
    }
  }


  render(){
    return(
      <section className="group">
        {this.state.import && <ModalTextarea  cancel={this.toggleImport} confirm={this.importYaml} title="Import YAML" text="please copy paste below YAML fields you want to replace" placeholder={`---
publisher: Département des littératures de langue française
prod: Sens Public
prodnum: Sens Public
diffnum: Érudit
rights: Creative Commons Attribution-ShareAlike 4.0 International (CC-BY-SA 4.0)
nocite: '@*'
---`}/>}
        <p className="addToArray" onClick={()=>this.toggleImport()}><i className="fa fa-plus" aria-hidden="true"></i> Import YAML</p>
      </section>
    )
  }

}
