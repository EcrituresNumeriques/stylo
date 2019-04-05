import React, { Component } from 'react';
import SiteHeader from 'components/layout/siteHeader';
import store from 'store/configureStore';
import { defaultYaml } from 'data/defaultYaml.js';
import YAML from 'js-yaml';
import _ from 'lodash';

export default class Profile extends Component {
  constructor(props) {
    super(props);
    const baseState = {yaml:'---\n'+YAML.dump(defaultYaml)+'\n---'};
    this.state = {...baseState,...store.getState().user.user};
    this.handleYaml = this.handleYaml.bind(this);
    this.save= this.save.bind(this);
  }

handleYaml(e){
    const value = e.target.value;
    this.setState((state)=>_.set(state, 'yaml', value));
}

componentWillReceiveProps(nextProp){
    const thisUser = store.getState().user.user;
    if(thisUser && thisUser.yaml){
        this.setState((state)=>_.set(state, 'yaml', thisUser.yaml));
    }
}

save(){
    let corps = this.state;
    fetch('/api/v1/profile',{
      method:'POST',
      body: JSON.stringify(corps),
      credentials: 'same-origin'
    })
    .then(function(response){
      return response.json();
    })
    .then(function(json){
        store.dispatch({type:"USER_LOGIN",data:json});
    });
}

render() {
    let thisUser = store.getState().user.user;
    console.log('loaded',thisUser);
    return (
      [
        <SiteHeader key="header" />,
        <main id="mainView" key="mainview">
            <section>
                <h1>Profile</h1>
                {thisUser && Object.keys(thisUser).map((key, index) => (<p key={'atribute'+key}>{key + ' : ' + thisUser[key]}</p>))}
            </section>
            <section>
                <label>DefaultYaml:</label>
                <textarea value={this.state.yaml} onChange={this.handleYaml} placeholder={'---\ndefaultYaml: true\n---'}>
                </textarea>
                <button onClick={this.save}>Save</button>
            </section>
        </main>
      ]
    );}
}
