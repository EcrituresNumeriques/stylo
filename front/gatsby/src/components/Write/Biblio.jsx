import React, { useMemo, useState } from 'react'
import { ChevronDown, ChevronRight } from 'react-feather'

import Modal from '../Modal'
import Reference from './Reference'
import Bibliographe from './bibliographe/Bibliographe'
import bib2key from './bibliographe/CitationsFilter'

import menuStyles from './menu.module.scss'
import Button from '../Button'

export default function Biblio ({ bib, article, handleBib, readOnly }) {
  const bibTeXEntries = useMemo(() => bib2key(bib), [bib])

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
          {bibTeXEntries.map((entry, index) => (
            <Reference key={`ref-${entry.key}-${index}`} entry={entry} />
          ))}
        </>
      )}
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
