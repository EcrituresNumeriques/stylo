import React, { useState } from 'react'
import { connect } from 'react-redux'
import { ChevronDown, ChevronRight } from 'react-feather'

import Modal from '../Modal'
import Reference from './Reference'
import Bibliographe from './bibliographe/Bibliographe'

import menuStyles from './menu.module.scss'
import Button from '../Button'

function Biblio ({ bib, article, readOnly, articleBibTeXEntries }) {
  const [expand, setExpand] = useState(true)
  const [modal, setModal] = useState(false)

  return (
    <section className={menuStyles.section}>
      <h1 onClick={() => setExpand(!expand)}>
        {expand ? <ChevronDown/> : <ChevronRight/>} Bibliography
      </h1>
      {expand && (
        <>
          {!readOnly && (
            <Button onClick={() => setModal(true)}>Manage Bibliography</Button>
          )}
          {articleBibTeXEntries.map((entry, index) => (
            <Reference key={`ref-${entry.key}-${index}`} entry={entry} />
          ))}
        </>
      )}
      {modal && (
        <Modal cancel={() => setModal(false)}>
          <Bibliographe
            bib={bib}
            cancel={() => setModal(false)}
            article={article}
          />
        </Modal>
      )}
    </section>
  )
}

const mapStateToProps = ({ articleBibTeXEntries }) => {
  return { articleBibTeXEntries }
}

const ConnectedBiblio = connect(mapStateToProps)(Biblio)
export default ConnectedBiblio
