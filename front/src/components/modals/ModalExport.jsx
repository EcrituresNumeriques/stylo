import React, { Component } from 'react';
import Select from 'react-select';
//import 'react-select/dist/react-select.css';

const citationStyle=[
  { value: 'inline', label: 'Inline citations ', className: 'State-NSW' },
  { value: 'footnotes', label: 'Footnote Citations ', className: 'State-NSW' }
];

export default class ModalExport extends Component {
    constructor(props) {
        super(props);
        this.defaultCancel = this.defaultCancel.bind(this);
        this.updateCitationStyle = this.updateCitationStyle.bind(this);
        this.state = {
            cancelButton:this.props.cancelButton || "cancel",
            cancel:this.props.cancel || this.defaultCancel,
            citationStyle:'inline'
        };
    }

    defaultCancel(){
        console.log("closing, no props provided");
    }
    updateCitationStyle (newValue) {
      this.setState({
        citationStyle: newValue,
      });
    }

    render(){
        return(
            <nav id="modalWrapper">
                <aside/>
                <main>
                    <fieldset>
                      <legend>Parameters</legend>
                      <Select
              					id="citation-style"
              					ref={(ref) => { this.citation = ref; }}
              					onBlurResetsInput={false}
              					onSelectResetsInput={false}
              					options={citationStyle}
              					simpleValue
              					clearable={false}
              					name="citationStyle"
              					disabled={false}
              					value={this.state.citationStyle}
              					onChange={this.updateCitationStyle}
              					rtl={false}
              					searchable={false}
              				/>
                    </fieldset>
                    <fieldset>
                      <legend>Format</legend>
                      <nav>
                          <button onClick={()=>this.props.exportHTML(true,this.state.citationStyle)} className="secondary">preview</button>
                          <button onClick={()=>{this.props.exportHTML(false,this.state.citationStyle);this.props.cancel()}} className="primary">HTML</button>
                          <button onClick={()=>{this.props.exportZIP();this.props.cancel()}} className="primary">ZIP</button>
                          <button onClick={()=>{this.props.exportPDF();this.props.cancel()}} className="primary">PDF</button>
                          <button onClick={()=>{this.props.exportTEX();this.props.cancel()}} className="primary">TEX</button>
                          <button onClick={()=>{this.props.exportXML();this.props.cancel()}} className="primary">XML</button>
                          <button onClick={()=>{this.props.exportODT();this.props.cancel()}} className="primary">ODT</button>
                          <button onClick={()=>{this.props.exportDOCX();this.props.cancel()}} className="primary">DOCX</button>
                          <button onClick={()=>{this.props.exportHTML5();this.props.cancel()}} className="primary">HTML5</button>
                          <button onClick={()=>{this.props.exportEPUB();this.props.cancel()}} className="primary">EPUB</button>
                          <button onClick={()=>{this.props.exportTEI();this.props.cancel()}} className="primary">TEI</button>
                      </nav>
                    </fieldset>
                    <nav>
                        <button onClick={()=>this.state.cancel()} className="secondary">{this.state.cancelButton}</button>
                    </nav>
                </main>
            </nav>
        );
    }
}
