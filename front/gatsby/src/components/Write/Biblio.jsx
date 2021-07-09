import React, { useState } from 'react'

import Modal from '../Modal'
import Reference from './Reference'
import Bibliographe from './bibliographe/Bibliographe'

import menuStyles from './menu.module.scss'
import Button from '../Button'

export default function Biblio ({ bib, article, bibTeXEntries, handleBib, readOnly }) {
  const [expand, setExpand] = useState(true)
  const [modal, setModal] = useState(false)

  console.log({ article })
  return (
    <section className={menuStyles.section}>
      {!readOnly && (
        <Button onClick={() => setModal(true)}>Manage Bibliography</Button>
      )}
      {bibTeXEntries.map((entry, index) => (
        <Reference key={`ref-${entry.key}-${index}`} entry={entry}/>
      ))}
      {modal && (
        <Modal cancel={() => setModal(false)}>
          <Bibliographe
            bib={bib}
            success={handleBib}
            cancel={() => setModal(false)}
            article={article}
          />
        </Modal>
      )}
    </section>
  )
}
