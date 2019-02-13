import React from 'react';

export default function User(props){
  return(
    <li>{props.username} - {props.email} - {props.createdAt}</li>
  )
}
