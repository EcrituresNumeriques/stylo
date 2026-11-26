import { Search } from 'lucide-react'
import { useState } from 'react'
import { createPortal } from 'react-dom'
import { useTranslation } from 'react-i18next'

import { useModal } from '../../../hooks/modal.js'
import { useSearch } from '../../../hooks/search.js'
import { Field } from '../../atoms/index.js'
import { Alert, Loading, Modal } from '../../molecules/index.js'
import styles from './SearchMenu.module.scss'
import { ArticleResult, CorpusResult } from './SearchResult.jsx'

/**
 * Search field of the header: results open in a modal.
 */
export default function SearchMenu() {
  const { t } = useTranslation()
  const [query, setQuery] = useState('')
  const modal = useModal()

  function handleSubmit(event) {
    event.preventDefault()
    const value = new FormData(event.target).get('query').trim()
    if (value) {
      setQuery(value)
      modal.show()
    }
  }

  return (
    <search className={styles.search} aria-label={t('header.search.label')}>
      <form onSubmit={handleSubmit}>
        <Field
          type="search"
          name="query"
          icon={<Search />}
          placeholder={t('header.search.placeholder')}
          aria-label={t('header.search.label')}
        />
      </form>

      {/* outside of the header, so that its styles do not apply */}
      {createPortal(
        <Modal {...modal.bindings} title={t('header.search.title', { query })}>
          <SearchResults query={query} onSelect={modal.close} />
        </Modal>,
        document.body
      )}
    </search>
  )
}

function SearchResults({ query, onSelect }) {
  const { t } = useTranslation()
  const { results, error, isLoading } = useSearch(query)

  if (isLoading) return <Loading />
  if (error) return <Alert message={error.message} />
  if (!results.length) return <p>{t('header.search.noResults')}</p>

  return (
    <ul className={styles.results}>
      {results.map(({ article, corpus }) =>
        article ? (
          <ArticleResult
            key={article.id}
            article={article}
            onSelect={onSelect}
          />
        ) : (
          <CorpusResult key={corpus.id} corpus={corpus} onSelect={onSelect} />
        )
      )}
    </ul>
  )
}
