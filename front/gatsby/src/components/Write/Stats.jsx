import React, { useState } from 'react'
import { ChevronDown, ChevronRight } from 'react-feather'

import menuStyles from './menu.module.scss'

export default (props) => {
  const [expand, setExpand] = useState(true)

  let value = props.md || ''
  let regex = /\s+/gi
  let citation = /\[@[\w-]+/gi
  let noMarkDown = /[#_*]+\s?/gi
  let wordCount = value
    .trim()
    .replace(noMarkDown, '')
    .replace(regex, ' ')
    .split(' ').length
  let charCountNoSpace = value.replace(noMarkDown, '').replace(regex, '').length
  let charCountPlusSpace = value.replace(noMarkDown, '').length
  let citationNb =
    value.replace(regex, '').replace(citation, ' ').split(' ').length - 1

  return (
    <section className={menuStyles.section}>
      <h1 onClick={() => setExpand(!expand)}>
        {expand ? <ChevronDown/> : <ChevronRight/>} Stats
      </h1>
      {expand && (
        <>
          <p>Words : {wordCount}</p>
          <p>Characters : {charCountNoSpace}</p>
          <p>Characters (with spaces) : {charCountPlusSpace}</p>
          <p>Citations : {citationNb}</p>
        </>
      )}
    </section>
  )
}
