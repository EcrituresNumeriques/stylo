import React, { useCallback, useState } from 'react'
import { useDispatch } from 'react-redux'

import NavTag from '../../NavTab'

import ZoteroPanel from './ZoteroPanel'
import CitationsPanel from './CitationsPanel'
import RawBibtexPanel from './RawBibtexPanel'

const tabItems = [
  { value: 'zotero', name: 'Zotero' },
  { value: 'citations', name: 'Citations' },
  { value: 'raw', name: 'Raw BibTeX' }
]

export default function Bibliographe({ article, cancel }) {
  const [selector, setSelector] = useState(tabItems.at(0).value)
  const dispatch = useDispatch()
  const handleTabChange = useCallback((value) => setSelector(value), [])

  const onChange = useCallback((bib) => {
    dispatch({ type: 'UPDATE_WORKING_ARTICLE_BIBLIOGRAPHY', articleId: article._id, bibliography: bib })
    cancel()
  }, [])

  return (<article>
    <NavTag defaultValue={selector} onChange={handleTabChange} items={tabItems}/>
    {selector === 'zotero' && <ZoteroPanel articleId={article._id} onChange={onChange} zoteroLink={article.zoteroLink} />}
    {selector === 'citations' && <CitationsPanel articleId={article._id} onChange={onChange} />}
    {selector === 'raw' && <RawBibtexPanel onChange={onChange} />}
  </article>)
}
