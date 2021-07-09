import React, { useState } from 'react'

import styles from './sommaire.module.scss'
import menuStyles from './menu.module.scss'
import { connect } from 'react-redux'

const mapStateToProps = ({ articleStructure }) => ({ articleStructure })

function Sommaire (props) {
  const [expand, setExpand] = useState(true)
  const { articleStructure } = props

  if (articleStructure.length === 0) {
    return <></>
  }
  return (
    <section className={[styles.section, menuStyles.section].join(' ')}>
      <ul>
        {articleStructure.map((item) => (
          <li
            className={styles.headlineItem}
            key={`line-${item.index}-${item.line}`}
            onClick={() => props.setCodeMirrorCursor(item.index)}
          >
            {item.title}
          </li>
        ))}
      </ul>
    </section>
  )
}

export default connect(mapStateToProps)(Sommaire)
