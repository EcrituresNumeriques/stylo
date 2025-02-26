import React, { useCallback } from 'react'
import clsx from 'clsx'
import PropTypes from 'prop-types'

import { removeArticleFromCorpus, addArticleToCorpus } from './Corpus.graphql'
import styles from './CorpusSelectItem.module.scss'
import { useGraphQLClient } from '../../helpers/graphQL.js'

export default function CorpusSelectItem({
  selected,
  name,
  id,
  articleId,
  onChange,
}) {
  const { query } = useGraphQLClient()
  const toggleCorpusArticle = useCallback(
    async (event) => {
      event.preventDefault()
      const [corpusId, checked] = [event.target.value, event.target.checked]
      const graphqlQuery = checked
        ? addArticleToCorpus
        : removeArticleFromCorpus
      await query({
        query: graphqlQuery,
        variables: { articleId: articleId, corpusId: corpusId },
      })
      onChange({ corpusId })
    },
    [articleId, id, onChange]
  )
  return (
    <>
      <li>
        <label className={clsx(styles.corpus, selected && styles.selected)}>
          <input
            name={id}
            value={id}
            data-id={id}
            type="checkbox"
            checked={selected}
            onChange={toggleCorpusArticle}
          />
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
