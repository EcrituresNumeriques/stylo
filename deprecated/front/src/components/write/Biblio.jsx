import React from 'react';
import { Link } from 'react-router-dom';
import Clipboard from 'react-clipboard.js';

function compare(a,b) {
  if (a.key < b.key)
    return -1;
  if (a.key > b.key)
    return 1;
  return 0;
}

export default function Biblio(props){
    const bib = props.bib || "";

    // TODO Understand why we need a spacer for book to be understood
    const itemsAllowed = [
      "@spacer",
      "@book",
      "@article",
      "@incollection",
      "@phdthesis",
      "@misc",
      "@inproceedings",
      "@techreport",
      "@unpublished",
    ]
    const regex = new RegExp('/(?='+itemsAllowed.join(')|(?=')+')/g')

    let entries = [];
    entries = bib.split(regex)
      .filter((ref)=>(ref.match(/^@/g)))
      .map((ref)=>(ref.replace(/^\s+|\s+$/g, '')))
      .map((ref)=>({title:ref,key:ref.match(/^@.+{(.+),/)[1]}))
      .sort(compare);

  return (
    <div id="biblio">
        <h1 className={props.closed?"title closed":"title"} onDoubleClick={()=>props.toggle()}>Biblio</h1>
        {!props.closed && <section>
            {entries.map((ref,i)=>(<Clipboard key={"ref"+i} component="p" data-clipboard-text={"[@"+ref.key+"]"} button-title={ref.title}><span>@{ref.key}</span></Clipboard>))}
        </section>}
        {props.addRef && !props.closed && <button onClick={()=>props.addRef()}>+ Add reference</button>}
        {props.sourceRef && !props.closed && <button onClick={()=>props.sourceRef()}>See source</button>}
        {props.sourceZotero && !props.closed && <button onClick={()=>props.sourceZotero()}>Zotero settings</button>}
        {props.zoteroURL && !props.zoteroFetch && !props.closed && <button onClick={()=>props.refreshZotero()}>Refresh Zotero</button>}
        {props.zoteroURL && props.zoteroFetch && !props.closed && <button>Fetching..</button>}
    </div>
  )
}
