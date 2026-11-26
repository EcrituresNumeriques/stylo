import { ArrowRight, Search } from 'lucide-react'
import { useEffect } from 'react'
import { createPortal } from 'react-dom'
import { useTranslation } from 'react-i18next'
import { useSearchParams } from 'react-router'

import { useModal } from '../../../hooks/modal.js'
import { useSearch } from '../../../hooks/search.js'
import { Button, Field } from '../../atoms/index.js'
import { Alert, Loading, Modal } from '../../molecules/index.js'
import styles from './SearchMenu.module.scss'
import { ArticleResult, CorpusResult } from './SearchResult.jsx'

/**
 * Search field of the header: results open in a modal.
 * The query is kept in the URL (?q=), without adding to the history:
 * reloading the page opens the results again.
 */
export default function SearchMenu() {
  const { t } = useTranslation()
  const [searchParams, setSearchParams] = useSearchParams()
  const query = searchParams.get('q') ?? ''
  const modal = useModal()
  const search = useSearch(query)

  // biome-ignore lint/correctness/useExhaustiveDependencies: on page load only
  useEffect(() => {
    if (query) modal.show()
  }, [])

  function updateQuery(value) {
    setSearchParams(
      (params) => {
        value ? params.set('q', value) : params.delete('q')
        return params
      },
      { replace: true }
    )
  }

  function closeSearch() {
    modal.close()
    updateQuery('')
  }

  function handleSubmit(event) {
    event.preventDefault()
    const value = new FormData(event.target).get('query').trim()
    if (value) {
      updateQuery(value)
      modal.show()
    }
  }

  return (
    <search className={styles.search} aria-label={t('header.search.label')}>
      <form className={styles.form} onSubmit={handleSubmit}>
        <Field
          type="search"
          name="query"
          icon={<Search />}
          defaultValue={query}
          placeholder={t('header.search.placeholder')}
          aria-label={t('header.search.label')}
        />
        <Button type="submit" icon={true} title={t('header.search.submit')}>
          <ArrowRight aria-hidden />
          <span className="visually-hidden">{t('header.search.submit')}</span>
        </Button>
      </form>

      {/* outside of the header, so that its styles do not apply */}
      {createPortal(
        <Modal
          {...modal.bindings}
          cancel={closeSearch}
          title={t('header.search.title', { query })}
          subtitle={search.results.length > 0 && <SearchSummary {...search} />}
        >
          <SearchResults {...search} onSelect={closeSearch} />
        </Modal>,
        document.body
      )}
    </search>
  )
}

/**
 * How many results are shown, out of how many were found.
 */
function SearchSummary({ results, total }) {
  const { t } = useTranslation()
  return total > results.length
    ? t('header.search.best', { count: results.length, total })
    : t('header.search.all', { count: total })
}

function SearchResults({ results, error, isLoading, onSelect }) {
  const { t } = useTranslation()

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
