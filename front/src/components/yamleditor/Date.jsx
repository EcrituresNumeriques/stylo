import React from 'react'
import _ from 'lodash'
import store from 'store/configureStore';

export class Date extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
        title:this.props.title,
        placeholder:this.props.placeholder || this.props.title,
        value: this.dateDecode(_.get(store.getState().yamleditor.obj, this.props.target, "")),
        element: this.props.element || 'input',
        changed:false
     };
     this.handleTextChange = this.handleTextChange.bind(this);
  }

  dateEncode(date){
    return date.split("-").join("/");
  }

  dateDecode(date){
    return date.split("/").join("-");
  }

  handleTextChange(event) {
    this.setState({value:event.target.value,changed:true});
    let date = event.target.value.split("-");
    store.dispatch({type:"FORM_UPDATE",target:"date", value:this.dateEncode(event.target.value)});
    store.dispatch({type:"FORM_UPDATE",target:"year", value:date[0]});
    store.dispatch({type:"FORM_UPDATE",target:"month", value:date[1]});
    store.dispatch({type:"FORM_UPDATE",target:"day", value:date[2]});
  }

  render() {
    return (
      <section className="reactForm">
        <label>{this.state.title} :</label>
        <input type="date" placeholder={this.state.placeholder} value={this.props.forceValue && !this.state.changed?this.dateDecode(this.props.forceValue):this.state.value} onChange={this.handleTextChange}/>
      </section>
    )
  }
}
