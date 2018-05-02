import React from 'react';
import { Link } from 'react-router-dom';
import Clipboard from 'react-clipboard.js';

export default function Biblio(props){
    const bib = props.bib || "";
    let entries = [];
    entries = bib.split('\n').map((line)=>(line.match(/^@.+{(.+),/))).filter(line=>line!=null).map(line=>line[1]);

  return (
    <div id="biblio">
        <h1 className={props.closed?"title closed":"title"} onDoubleClick={()=>props.toggle()}>Biblio</h1>
        {!props.closed && <section>
            {entries.map((ref,i)=>(<Clipboard key={"ref"+i} component="p" data-clipboard-text={"[@"+ref+"]"} button-title={"[@"+ref+"]"}>@{ref}</Clipboard>))}
        </section>}
        {props.addRef && !props.closed && <button onClick={()=>props.addRef()}>+ Add reference</button>}
        {props.sourceRef && !props.closed && <button onClick={()=>props.sourceRef()}>See source</button>}
    </div>
  )
}
