import React, { Component } from 'react';

export default class ModalDualInput extends Component {
    constructor(props) {
        super(props);
        this.defaultCancel = this.defaultCancel.bind(this);
        this.defaultConfirm = this.defaultConfirm.bind(this);
        this.setValue = this.setValue.bind(this);
        this.setValue2 = this.setValue2.bind(this);
        this.state = {
            title:this.props.title || "title",
            text:this.props.text || "text",
            value:this.props.value || "",
            placeholder: this.props.placeholder || "placeholder",
            text2:this.props.text2 || "text",
            value2:this.props.value2 || "",
            placeholder2: this.props.placeholder2 || "placeholder",
            cancelButton:this.props.cancelButton || "cancel",
            confirmButton:this.props.confirmButton || "confirm",
            cancel:this.props.cancel || this.defaultCancel,
            confirm:this.props.confirm || this.defaultConfirm
        };
    }

    defaultCancel(){
        console.log("closing, no props provided");
    }
    defaultConfirm(value){
        console.log("trying to send, no props provided:",value,"not sent anywhere");
    }
    setValue(e){
        this.setState({value:e.target.value})
    }
    setValue2(e){
        this.setState({value2:e.target.value})
    }

    render(){
        return(
            <nav id="modalWrapper">
                <aside/>
                <main>
                    <h1>{this.state.title}</h1>
                    <p>{this.state.text}</p>
                    <div>
                      <input type="text" value={this.state.value} placeholder={this.state.placeholder} onChange={this.setValue}/>
                    </div>
                    <p>{this.state.text2}</p>
                    <div>
                      <input type="text" value={this.state.value2} placeholder={this.state.placeholder2} onChange={this.setValue2}/>
                    </div>
                    <nav>
                        <button onClick={()=>this.state.cancel()} className="secondary">{this.state.cancelButton}</button>
                        <button onClick={()=>this.state.confirm(this.state.value,this.state.value2)} className="primary">{this.state.confirmButton}</button>
                    </nav>
                </main>
            </nav>
        );
    }
}
