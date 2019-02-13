import React from 'react';

export default function Article(props){
  return(
    <li>{props.title} - {props.owner} - {props.updatedAt}</li>
  )
}
