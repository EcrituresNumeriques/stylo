import React, { useCallback } from 'react'
import clsx from 'clsx'
import PropTypes from 'prop-types'
import { useMutate } from '../../hooks/graphql.js'

import { removeArticleFromCorpus, addArticleToCorpus, getCorpus } from './Corpus.graphql'
import styles from './CorpusSelectItem.module.scss'
import { useGraphQL } from '../../helpers/graphQL.js'

export default function CorpusSelectItem ({ selected, name, id, articleId, onChange }) {
  const runQuery = useGraphQL()
  const { mutate } = useMutate({ query: getCorpus, variables: { filter: { corpusId: id }, includeArticles: true } })
  const toggleCorpusArticle = useCallback(async (event) => {
    event.preventDefault()
    const [corpusId, checked] = [event.target.value, event.target.checked]
    const query = checked ? addArticleToCorpus : removeArticleFromCorpus
    await runQuery({ query, variables: { articleId: articleId, corpusId: corpusId } })
    await mutate()
    onChange({corpusId})
  }, [articleId, id, onChange])
  return (
    <>
      <li>
        <label className={clsx(styles.corpus, selected && styles.selected)}>
          <input name={id} value={id} data-id={id} type="checkbox" checked={selected} onChange={toggleCorpusArticle}/>
          <span>{name}</span>
        </label>
      </li>
    </>
  )
}

CorpusSelectItem.propTypes = {
  name: PropTypes.string.isRequired,
  id: PropTypes.string,
  articleId: PropTypes.string.isRequired,
  selected: PropTypes.bool.isRequired,
  onChange: PropTypes.func,
}
