import React from 'react';
import { Link } from 'react-router-dom';

export default function Timeline(props){
  return (
    <div id="timeline">
        <h1 className={props.closed?"title closed":"title"} onDoubleClick={()=>props.toggle()}>Versions</h1>
        <div id="showed">
            Active version {props.active? props.active.title || props.active.version+"."+props.active.revision:props.activeId}
            <ul>
                {props.newVersion && <li onClick={()=>props.newVersion()}>{props.active.version+1}.0</li>}
                {props.newRevision && <li onClick={()=>props.newRevision()}>{props.active.version}.{props.active.revision+1}</li>}
                {props.export && <li onClick={()=>props.export()}>Export modal</li>}
                {props.tagVersion && <li onClick={()=>props.tagVersion()}>Tag</li>}
                {props.exportHTML && <li onClick={()=>props.exportHTML()}>Export</li>}
                {props.exportZIP && <li onClick={()=>props.exportZIP()}>ZIP</li>}
                {props.previewHTML && <li onClick={()=>props.previewHTML()}>Preview</li>}
                {props.exportHypothesis && <li onClick={()=>props.exportHypothesis()}>Anotate</li>}
                {props.exportErudit && <li onClick={()=>props.exportErudit()}>XML</li>}
            </ul>
        </div>
        {!props.closed &&<section>
          <Link to={"/write/"+props.article} className={props.activeId == 'live'?"active":"" }>Live</Link>
          {props.versions.map((version)=>(
            <Link to={"/write/"+props.article+"/"+version.id} key={"versionWrite"+version.id} data-id={"versionWrite"+version.id} className={props.activeId == version.id?"active":"" }>{!version.title?"":version.title} ({version.version+'.'+version.revision})</Link>
          ))}
        </section>}
    </div>
  )
}
