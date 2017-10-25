import React from 'react'
import _ from 'lodash'
import store from 'store/configureStore';

export class CheckBoxInput extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
        title:this.props.title,
        placeholder:this.props.placeholder || this.props.title,
        target : this.props.target,
        value: _.get(store.getState().misc, this.props.target, ""),
        element: this.props.element || 'input'
     };
  }

  componentDidMount(){
    let context = this;
    this.setState({unsubscribe : store.subscribe(function(){
      let value = _.get(store.getState().misc, context.props.target, undefined);
      if(typeof(value) != "undefined" && context.state.value != value){
        context.setState({value:value});
      }
    })});
  }

  componentWillUnmount(){
    this.state.unsubscribe();
  }


  handleTextChange(event) {
    let answer = event.target.checked;
    store.dispatch({type:"MISC_UPDATE",target:this.state.target, value:answer});
  }

  render() {
    return (
      <section className="reactForm">
        <input type="checkbox" className="icheckbox" checked={this.state.value} onChange={this.handleTextChange.bind(this)}/>
        <label className="lcheckbox">{this.state.title}</label>
      </section>
    )
  }
}
