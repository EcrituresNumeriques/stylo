import React from 'react'

import menuStyles from './menu.module.scss'

export default ({ stats }) => {
  return (
    <section className={menuStyles.section}>
      <p>Words : {stats.wordCount}</p>
      <p>Characters : {stats.charCountNoSpace}</p>
      <p>Characters (with spaces) : {stats.charCountPlusSpace}</p>
      <p>Citations : {stats.citationNb}</p>
    </section>
  )
}
