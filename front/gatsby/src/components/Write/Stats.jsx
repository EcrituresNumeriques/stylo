import React, { useState } from 'react'
import { ChevronDown, ChevronRight } from 'react-feather'

import menuStyles from './menu.module.scss'

export default ({ stats }) => {
  const [expand, setExpand] = useState(true)

  return (
    <section className={menuStyles.section}>
      <h1 onClick={() => setExpand(!expand)}>
        {expand ? <ChevronDown/> : <ChevronRight/>} Stats
      </h1>
      {expand && (
        <>
          <p>Words : {stats.wordCount}</p>
          <p>Characters : {stats.charCountNoSpace}</p>
          <p>Characters (with spaces) : {stats.charCountPlusSpace}</p>
          <p>Citations : {stats.citationNb}</p>
        </>
      )}
    </section>
  )
}
