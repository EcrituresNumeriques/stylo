import React from 'react';
import { Link } from 'react-router-dom';

export default function Biblio(props){
  return (
    <div id="biblio">
        <h1>Biblio</h1>
        {props.bib && props.bib.split('\n').map(function(line,i){
            if(line.match(/^@+/)){
                return (<pre key={"line"+i}>{line}</pre>)
            }
            else{
                return null
            }
        })}
    </div>
  )
}
