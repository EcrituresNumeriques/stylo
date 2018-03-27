import React from 'react'
import _ from 'lodash'

export class Date extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
        title:this.props.title,
        placeholder:this.props.placeholder || this.props.title,
        value: this.dateDecode(_.get(this.props.state, this.props.target, "")),
        element: this.props.element || 'input'
     };
  }

  dateEncode(date){
    return date.split("-").join("/");
  }

  dateDecode(date){
    return date.split("/").join("-");
  }

  componentWillReceiveProps(nextProp){
    this.setState({value:this.dateDecode(_.get(nextProp.state, this.props.target, ""))})
  }

  handleTextChange(event) {
    let date = event.target.value.split("-");
    this.props.updateState(this.dateEncode(event.target.value),"date");
    this.props.updateState(date[0],"year");
    this.props.updateState(date[1],"month");
    this.props.updateState(date[2],"day");
  }

  render() {
    return (
      <section className="reactForm">
        <label>{this.state.title} :</label>
        <input type="date" placeholder={this.state.placeholder} value={this.state.value} onChange={this.handleTextChange.bind(this)}/>
      </section>
    )
  }
}
