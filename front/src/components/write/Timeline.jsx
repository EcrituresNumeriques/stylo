import React from 'react';
import { Link } from 'react-router-dom';

export default function Timeline(props){
  return (
    <div id="timeline">
      <Link to={"/write/"+props.article} className={props.activeId == 'live'?"active":"" }>Edit</Link>
      {props.versions.map((version)=>(
        <Link to={"/write/"+props.article+"/"+version.id} key={"versionWrite"+version.id} data-id={"versionWrite"+version.id} className={props.activeId == version.id?"active":"" }>{version.title?version.title:version.version+'.'+version.revision}</Link>
      ))}
    </div>
  )
}
