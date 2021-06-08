import React, { useState } from 'react'
import { useSelector } from 'react-redux'
import { Check } from 'react-feather'

import styles from './bibliographe.module.scss'
import Button from '../../Button'
import CitationTable from './CitationTable'
import AddCitation from './AddCitation'
import parseBibTeX from './CitationsFilter'


export default function ManageCitation() {
  const articleBibTeXEntries = useSelector(state => state.articleBibTeXEntries)
  const [bibTeXEntries, setBibTeXEntries] = useState(articleBibTeXEntries)

  function handleSave() {
    // TODO

  }

  function handleAdd(bibTeX, citationForm) {
    console.log('handleAdd', {bibTeX, citationForm})
    const newBibTeXEntries = parseBibTeX(bibTeX)
    setBibTeXEntries([...newBibTeXEntries, ...bibTeXEntries])
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
