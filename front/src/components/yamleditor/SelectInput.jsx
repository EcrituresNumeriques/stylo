import React from 'react'
import _ from 'lodash'
import store from 'store/configureStore';

export class SelectInput extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
        title:this.props.title,
        placeholder:this.props.placeholder || this.props.title,
        target : this.props.target,
        value: _.get(store.getState().yamleditor.obj, this.props.target, ''),
        options: this.props.options || ['fr','en','it'],
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
        <label>{this.state.title} :</label>
        <select onChange={this.handleTextChange.bind(this)} value={this.props.forceValue && !this.state.changed?this.props.forceValue:this.state.value}>
          <option value="" disabled >{this.state.placeholder}</option>
          {this.state.options.map((o,i)=>(<option value={o} key={i}>{o}</option>))}
        </select>
      </section>
    )
  }
}
