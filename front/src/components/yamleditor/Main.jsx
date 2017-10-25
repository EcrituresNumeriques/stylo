import React, { Component } from 'react';
import { TextInput } from './TextInput';
import { Date} from './Date.jsx';
import objectAssign from 'object-assign';
import YAML from 'js-yaml';
import store from 'store/configureStore';


//import { SelectInput } from './SelectInput.jsx';
//import { Resumes} from './Resumes.jsx';
//import { Authors } from './Authors.jsx';
//import { Dossier } from './Dossier.jsx';
//import { Reviewers } from './Reviewers.jsx';
//import { Collaborateurs} from './Collaborateurs.jsx';
//import { MotsClefs} from './MotsClefs.jsx';
//import { Rubriques} from './Rubriques.jsx';
//import { Keywords} from './Keywords.jsx';
//import { Types} from './Types.jsx';

export default class YamlEditor extends Component{
  constructor(props) {
    super(props);
    this.state = {id:null};
  }

  componentDidUpdate(){
    if(this.props.id != this.state.id && this.props.id){
      //YAML to JS
      let SexyYamlType = new YAML.Type('!sexy', {
        kind: 'sequence', // See node kinds in YAML spec: http://www.yaml.org/spec/1.2/spec.html#kind//
        construct: function (data) {
          return data.map(function (string) { return 'sexy ' + string; });
        }
      });
      let SEXY_SCHEMA = YAML.Schema.create([ SexyYamlType ]);
      let yamlOBJ = YAML.load(this.props.yaml.replace(/[\-]{3}\n/g, "").replace(/\n[\-]{3}/g, ""), { schema: SEXY_SCHEMA });
      store.dispatch({type:"FORM_IMPORT", value:yamlOBJ});
      this.setState({id:this.props.id,yaml:yamlOBJ});
    }
  }
  componentWillUnmount(){
    store.dispatch({type:"FORM_WIPE"});
  }

  render() {
    return(
      <section>
        <p>Yaml EDitor here</p>
        <TextInput target="id_sp" title="Identifiant" placeholder="SPxxxx" forceValue={this.state.id?this.state.yaml.id_sp:null}/>
        <TextInput target="title" title="Titre" forceValue={this.state.id?this.state.yaml.title:null}/>
        <TextInput target="subtitle" title="Sous-titre" forceValue={this.state.id?this.state.yaml.subtitle:null}/>
        <Date target="date" title="Date" forceValue={this.state.id?this.state.yaml.date:null}/>
      </section>
    )
  }
}


/*
<Resumes/>
<Dossier />
<Authors />
<Reviewers />
<Keywords/>
<Rubriques/>
*/
