import React from 'react'
import _ from 'lodash'
import store from 'store/configureStore';

export class TextInput extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
        title:this.props.title,
        placeholder:this.props.placeholder || this.props.title,
        target : this.props.target,
        value: _.get(store.getState().yamleditor.obj, this.props.target, ""),
        element: this.props.element || 'input',
        changed:false
     };
  }

  handleTextChange(event) {
    this.setState({value:event.target.value,changed:true});
    store.dispatch({type:"FORM_UPDATE",target:this.state.target, value:event.target.value});
  }


  render() {
    return (
      <section className="reactForm">
        {this.state.element != "textArea" && <label>{this.state.title} :</label>}
        { this.state.element == "input" ? <input type="text" placeholder={this.state.placeholder} value={this.props.forceValue && !this.state.changed?this.props.forceValue:this.state.value} onChange={this.handleTextChange.bind(this)}/> :
        this.state.element == "textArea" ? <textarea placeholder={this.state.placeholder} value={this.state.value} onChange={this.handleTextChange.bind(this)}/> :
        null }
      </section>
    )
  }
}
