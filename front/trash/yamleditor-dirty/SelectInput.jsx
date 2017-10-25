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
        value: _.get(store.getState().obj, this.props.target, ''),
        options: this.props.options || ['fr','en','it']
     };
  }

  componentDidMount(){
    let context = this;
    this.setState({unsubscribe : store.subscribe(function(){
      let value = _.get(store.getState().obj, context.props.target, undefined);
      if(typeof(value) != "undefined" && context.state.value != value){
        context.setState({value:value});
      }
    })});
  }

  componentWillUnmount(){
    this.state.unsubscribe();
  }

  handleTextChange(event) {
    store.dispatch({type:"FORM_UPDATE",target:this.state.target, value:event.target.value});
  }

  render() {
    return (
      <section className="reactForm">
        <label>{this.state.title} :</label>
        <select onChange={this.handleTextChange.bind(this)} value={this.state.value}>
          <option value="" disabled >{this.state.placeholder}</option>
          {this.state.options.map((o,i)=>(<option value={o} key={i}>{o}</option>))}
        </select>
      </section>
    )
  }
}
