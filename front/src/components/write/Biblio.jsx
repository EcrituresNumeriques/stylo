import React from 'react';
import { Link } from 'react-router-dom';

export default function Biblio(props){
  return (
    <div id="biblio">
        <h1>Biblio</h1>
        <pre>{props.bib}</pre>
    </div>
  )
}
