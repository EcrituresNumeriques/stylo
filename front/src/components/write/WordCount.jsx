import React from 'react';

export default function WordCount(props){
        let value = props.md || "";
        let regex = /\s+/gi;
        let citation = /\[@[\w-]+\]/gi;
        let wordCount = value.trim().replace(regex, ' ').split(' ').length;
        let charCountNoSpace = value.replace(regex, '').length;
        let citationNb = value.replace(regex,'').replace(citation,' ').split(' ').length-1;

    return (
        <div id="stat">
            <h1 className={props.closed?"title closed":"title"} onDoubleClick={()=>props.toggle()}>Stats</h1>
            {!props.closed &&<section>
                <p>Words : {wordCount}</p>
                <p>Characters : {charCountNoSpace}</p>
                <p>Citations : {citationNb}</p>
            </section>}
        </div>
    )
}
