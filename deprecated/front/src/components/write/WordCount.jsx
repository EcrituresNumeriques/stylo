import React from 'react';

export default function WordCount(props){
        let value = props.md || "";
        let regex = /\s+/gi;
        let citation = /\[@[\w-]+/gi;
        let noMarkDown = /[#_*]+\s?/gi;
        let wordCount = value.trim().replace(noMarkDown, '').replace(regex, ' ').split(' ').length;
        let charCountNoSpace = value.replace(noMarkDown, '').replace(regex, '').length;
        let charCountPlusSpace = value.replace(noMarkDown, '').length;
        let citationNb = value.replace(regex,'').replace(citation,' ').split(' ').length-1;

    return (
        <div id="stat">
            <h1 className={props.closed?"title closed":"title"} onDoubleClick={()=>props.toggle()}>Stats</h1>
            {!props.closed &&<section>
                <p>Words : {wordCount}</p>
                <p>Characters : {charCountNoSpace}</p>
                <p>Characters (plus spaces) : {charCountPlusSpace}</p>
                <p>Citations : {citationNb}</p>
            </section>}
        </div>
    )
}
