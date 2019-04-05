import React from 'react'
import {navigate} from 'gatsby'
import styles from './compareSelect.module.scss'


export default props => {
  const handleCompareSelect = e => {
    if(e.target.value === "false"){
      navigate(`/article/${props.article._id}/${props.selectedVersion?'version/'+props.selectedVersion:''}`)
    }
    else{
      navigate(`/article/${props.article._id}/${props.selectedVersion?'version/'+props.selectedVersion:''}/compare/${e.target.value}`)
    }
  }
  return (
    <p className={styles.compare}>
        Comparing {props.readOnly?`${props.live.message?props.live.message:'No label'} v${props.live.version}.${props.live.revision}`:'Editing mode'} with <select onChange={(e)=>handleCompareSelect(e)}>
          <option value={false}>Stop compare</option>
          {props.versions.map(v=><option value={v._id} key={`versionCompare-${v._id}`} selected={props.compareTo === v._id?true:false}>{v.message?v.message:'No label'} v{v.version}.{v.revision}</option>)}
        </select>
      </p>
  )
}