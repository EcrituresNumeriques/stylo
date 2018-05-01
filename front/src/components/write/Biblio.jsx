import React from 'react';
import { Link } from 'react-router-dom';
import Bibliography, {parseString} from 'bibliography';
import Clipboard from 'react-clipboard.js';

export default function Biblio(props){
    let entries = [];
    try{
        let references = parseString(props.bib);
        entries = Object.values(references.entries);
    }
    catch(error){
        alert(error);
    }
  return (
    <div id="biblio">
        <h1 className="title">Biblio</h1>
        {entries.map((ref,i)=>(<Clipboard key={"ref"+i} component="pre" button-href="#" data-clipboard-text={"[@"+ref.id+"]"} button-title={"[@"+ref.id+"]"}>@{ref.id}</Clipboard>))}
        {props.addRef && <button onClick={()=>props.addRef()}>+ Add reference</button>}
        {props.sourceRef && <button onClick={()=>props.sourceRef()}>See source</button>}
    </div>
  )
}
