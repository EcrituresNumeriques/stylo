import { useTranslation } from 'react-i18next'

import { useCorpusArticles } from '../../../hooks/corpus.js'
import { Button } from '../../atoms/index.js'
import { Alert, Loading } from '../../molecules/index.js'

import DropdownMenu from '../../molecules/DropdownMenu.jsx'

import styles from './CorpusArticleMetadataSelector.module.scss'

/**
 * @param {object} props
 * @param {string} props.corpusId - Corpus identifier
 * @param {function(object): void} props.onSelectedItem - Callback called with the selected article
 * @returns {JSX.Element}
 */
export default function CorpusArticleMetadataSelector({
  corpusId,
  onSelectedItem = () => {},
}) {
  const { t } = useTranslation('corpus', { useSuspense: false })
  const { corpus, error, isLoading } = useCorpusArticles({ corpusId })
  const articles =
    corpus?.[0]?.articles?.map((item) => {
      const article = item.article
      return { ...article }
    }) ?? []
  if (error) return <Alert message={error.message} />
  if (isLoading) return <Loading />
  if (articles.length === 0) return <></>

  return (
    <DropdownMenu
      toggleButton={({ title, toggleActions }) => {
        return (
          <Button
            className={styles.import}
            onClick={toggleActions}
            title={title}
          >
            {t('actions.importFromArticle.title')}
          </Button>
        )
      }}
    >
      <ul className={styles.articles}>
        {articles.map((article, index) => (
          <li key={index} onClick={() => onSelectedItem(article)}>
            {article.title}
          </li>
        ))}
      </ul>
    </DropdownMenu>
  )
}
