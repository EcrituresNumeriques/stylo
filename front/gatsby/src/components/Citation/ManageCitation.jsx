import React, { useState } from 'react'
import { useSelector } from 'react-redux'
import { Check } from 'react-feather'

import styles from './Citation.module.scss'
import Button from '../Button'
import ListCitation from './ListCitation'
import CreateCitation from './CreateCitation'
import { toEntries } from '../../helpers/bibtex'


export default function ManageCitation () {
  const articleBibTeXEntries = useSelector(state => state.articleBibTeXEntries)
  const [bibTeXEntries, setBibTeXEntries] = useState(articleBibTeXEntries)

  function handleSave () {
    // TODO

  }

  async function handleCreate (bibTeX, citationForm) {
    console.log('handleCreate', { bibTeX, citationForm })
    const newBibTeXEntries = await toEntries(bibTeX)
    setBibTeXEntries([...newBibTeXEntries, ...bibTeXEntries])
    citationForm.current.reset()
  }

  function handleRemove (indexToRemove) {
    setBibTeXEntries([...bibTeXEntries.slice(0, indexToRemove), ...bibTeXEntries.slice(indexToRemove + 1)])
  }

  return (
    <>
      <CreateCitation onCreate={handleCreate}/>
      <ListCitation maxEntries={5} bibTeXEntries={bibTeXEntries} onRemove={handleRemove} canRemove={true}/>
      <ul className={styles.footerActions}>
        <li className={styles.actionsSubmit}>
          <Button primary={true} onClick={handleSave} className={styles.primary}><Check/> Save </Button>
        </li>
      </ul>
    </>
  )
}
