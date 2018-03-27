import React from 'react'
import _ from 'lodash'
const removeMd = require('remove-markdown');

export class TextInput extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
        title:this.props.title,
        placeholder:this.props.placeholder || this.props.title,
        target : this.props.target,
        value: _.get(this.props.state, this.props.target, ""),
        element: this.props.element || 'input'
     };
     this.handleTextChange = this.handleTextChange.bind(this);
  }

  componentWillReceiveProps(nextProp){
    this.setState({value:_.get(nextProp.state, this.props.target, "")})
  }

  handleTextChange(event) {
    this.props.updateState(event.target.value,this.props.target);
    if(this.props.alias){
      for(let i=0;i<this.props.alias.length;i++){
        let value = event.target.value
        if(this.props.alias[i].filterMD){value = removeMd(value)}
        this.props.updateState(this.props.alias[i].prefix+value+this.props.alias[i].suffix,this.props.alias[i].target);
      }
    }
  }

  render() {
    return (
      <section className="reactForm">
        <label>{this.state.title} :</label>
        { this.state.element == "input" ? <input type="text" placeholder={this.state.placeholder} value={this.state.value} onChange={this.handleTextChange.bind(this)}/> :
        this.state.element == "textArea" ? <textarea placeholder={this.state.placeholder} value={this.state.value} onChange={this.handleTextChange.bind(this)}/> :
        null }
      </section>
    )
  }
}
