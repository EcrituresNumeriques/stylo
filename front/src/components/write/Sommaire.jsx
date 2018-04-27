import React from 'react';
import { Link } from 'react-router-dom';

export default function Sommaire(props){
  return (
    <div id="sommaire">
        <h1>Sommaire</h1>
        <p>{props.md}</p>
    </div>
  )
}
