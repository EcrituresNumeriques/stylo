import React, { useCallback } from 'react'
import clsx from 'clsx'
import PropTypes from 'prop-types'

import { removeArticleFromCorpus, addArticleToCorpus } from './Corpus.graphql'
import styles from './CorpusSelectItem.module.scss'
import { useGraphQL } from '../../helpers/graphQL.js'

export default function CorpusSelectItem ({ articleId, name, id, articleIds, onChange }) {
  const runQuery = useGraphQL()
  const isSelected = articleIds.includes(articleId)
  const toggleCorpusArticle = useCallback(async (event) => {
    event.preventDefault()
    const [corpusId, checked] = [event.target.value, event.target.checked]
    const query = checked ? addArticleToCorpus : removeArticleFromCorpus
    const corpusArticleIds = checked
      ? [...articleIds, articleId]
      : articleIds.filter((id) => id !== articleId)
    await runQuery({ query, variables: { articleId: articleId, corpusId: corpusId } })
    onChange({corpusId, corpusArticleIds})
  }, [articleId, id])
  return (
    <>
      <li>
        <label className={clsx(styles.corpus, isSelected && styles.selected)}>
          <input name={id} value={id} data-id={id} type="checkbox" checked={isSelected}
                 onChange={toggleCorpusArticle}/>
          <span>{name}</span>
        </label>
      </li>
    </>
  )
}

CorpusSelectItem.propTypes = {
  name: PropTypes.string.isRequired,
  id: PropTypes.string,
  articleIds: PropTypes.array,
  articleId: PropTypes.string.isRequired,
  onChange: PropTypes.func,
}
