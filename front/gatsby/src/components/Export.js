import React, {useState} from 'react'

import env from '../helpers/env'
import etv from '../helpers/eventTargetValue'

export default props => {

  const [format, setFormat] = useState('HTML')
  return(
    <section>
      <h1>export</h1>
      <form>
        <select value={format} onChange={(e)=>setFormat(etv(e))}>
          <option value="HTML">HTML</option>
          <option value="ZIP">ZIP</option>
          <option value="HTML">HTML</option>
          <option value="HTML">HTML</option>
          <option value="HTML">HTML</option>
          <option value="HTML">HTML</option>
        </select>
      </form>
      <a href={`${env.EXPORT_ENDPOINT}/htmlArticle/${props._id}`} target="_blank"  rel="noopener noreferrer">Export {format}</a>

    </section>
  )
}