import clsx from 'clsx'
import { useCallback } from 'react'

import { useGraphQLClient } from '../../../helpers/graphQL.js'

import {
  addArticleToCorpus,
  removeArticleFromCorpus,
} from '../../../hooks/Corpus.graphql'

import styles from './CorpusSelectItem.module.scss'

/**
 * @param {object} props
 * @param {string} props.name
 * @param {string} props.articleId
 * @param {boolean} props.selected
 * @param {string} [props.id]
 * @param {(event: {corpusId: string}) => void} [props.onChange]
 * @returns {JSX.Element}
 */
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
