import React, { useState } from 'react'

import { ChevronDown, ChevronRight } from 'react-feather'

import styles from './sommaire.module.scss'
import menuStyles from './menu.module.scss'
import { connect } from 'react-redux'

const mapStateToProps = ({ articleStructure }) => ({ articleStructure })

function Sommaire (props) {
  const [expand, setExpand] = useState(true)
  const { articleStructure } = props

  return (
    <section className={[styles.section, menuStyles.section].join(' ')}>
      <h1 onClick={() => setExpand(!expand)}>
        {expand ? <ChevronDown/> : <ChevronRight/>} Table of contents
      </h1>
      {expand && (<ul>
        {articleStructure.map((item) => (
          <li
            className={styles.headlineItem}
            key={`line-${item.index}-${item.line}`}
            onClick={() => props.setCodeMirrorCursor(item.index)}
          >
            {item.title}
          </li>
        ))}
      </ul>)}
    </section>
  )
}

export default connect(mapStateToProps)(Sommaire)
