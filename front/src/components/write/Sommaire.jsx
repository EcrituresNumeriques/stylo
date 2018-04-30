import React from 'react';
import { Link } from 'react-router-dom';

export default function Sommaire(props){
  return (
    <div id="sommaire">
        <h1>Sommaire</h1>
        {props.md && props.md.split('\n').map(function(line,i){
            if(line.match(/^#+/)){
                return (<pre key={"line"+i} onClick={()=>props.setCursor(i)}>{line}</pre>)
            }
            else{
                return null
            }
        })}
    </div>
  )
}
