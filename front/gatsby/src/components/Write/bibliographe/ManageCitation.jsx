import React, { useState } from 'react'
import { useSelector } from 'react-redux'
import { Check } from 'react-feather'

import styles from './bibliographe.module.scss'
import Button from '../../Button'
import CitationTable from './CitationTable'
import AddCitation from './AddCitation'


export default function ManageCitation() {
  const articleBibTeXEntries = useSelector(state => state.articleBibTeXEntries)
  const [bibTeXEntries, setBibTeXEntries] = useState(articleBibTeXEntries)

  function handleSave() {
    // TODO

  }

  function handleAdd(newCitationText, citationForm) {
    // TODO: parse newCitationText to entry, add entry to articleBibTeXEntries
    citationForm.current.reset()
  }

  function handleRemove(indexToRemove) {
    setBibTeXEntries([...bibTeXEntries.slice(0, indexToRemove), ...bibTeXEntries.slice(indexToRemove + 1)])
  }

  return (
    <>
      <AddCitation onAdd={handleAdd}/>
      <CitationTable bibTeXEntries={bibTeXEntries} onRemove={handleRemove}/>
      <Button primary={true} onClick={handleSave} className={styles.primary}><Check /> Save </Button>
    </>
  )
}
