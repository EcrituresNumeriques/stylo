import React,{useState,useEffect} from 'react'
import askGraphQL from '../../helpers/graphQL';

import DiffMatchPatch from 'diff-match-patch';

export default props => {

  const query = `query{ version(version:"${props.compareTo}"){ _id md } }`
  const [compareMD,setCompareMD] = useState('')
  const [loading,setLoading] = useState(true)
  const computeDiff = (text1,text2) => {
    let dmp = new DiffMatchPatch();
    let d = dmp.diff_main(text1, text2);
    dmp.diff_cleanupSemantic(d);
    return dmp.diff_prettyHtml(d);
  }

  useEffect(()=>{
    (async ()=>{
      setLoading(true)
      const data = await askGraphQL({query},'fetching version to compareTo',props.sessionToken)
      setCompareMD(data.version.md)
      setLoading(false)
    })()
  },[props.compareTo])

  return (
      <div
      dangerouslySetInnerHTML={{__html:loading?'<p>loading</p>':computeDiff(compareMD,props.live.md)}}></div>
  )
}