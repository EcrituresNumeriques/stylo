import { useCallback, useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { toast } from 'react-toastify'

import { useGraphQLClient } from '../../../helpers/graphQL.js'
import { updateArticlesOrder } from '../../../hooks/Corpus.graphql'
import CorpusArticleCard from './CorpusArticleCard.jsx'

import styles from './CorpusArticles.module.scss'

/**
 * @param {{id: string}[]} cards
 * @returns {string}
 */
function orderKey(cards) {
  return cards.map((card) => card.id).join(',')
}

/**
 * @param {object} props
 * @param {string} [props.corpusId]
 * @param {Array<{article: {id: string, title: string}}>} [props.articles]
 * @param {() => void} props.onUpdate - Called after the article order has been updated
 * @returns {JSX.Element}
 */
export default function CorpusArticleItems({ corpusId, articles, onUpdate }) {
  const { t } = useTranslation('corpus', { useSuspense: false })
  const { query } = useGraphQLClient()
  const [articleCards, setArticleCards] = useState(() =>
    articles.map((a) => a.article)
  )
  // Keep track of the latest order (read when the drag ends) and of the persisted one
  const articleCardsRef = useRef(articleCards)
  const savedOrderRef = useRef(orderKey(articleCards))

  useEffect(() => {
    const cards = articles.map((a) => a.article)
    articleCardsRef.current = cards
    savedOrderRef.current = orderKey(cards)
    setArticleCards(cards)
  }, [articles])

  const moveArticleCard = useCallback((dragIndex, hoverIndex) => {
    setArticleCards((prevCards) => {
      const orderedArticles = [...prevCards]
      const [dragged] = orderedArticles.splice(dragIndex, 1)
      orderedArticles.splice(hoverIndex, 0, dragged)
      articleCardsRef.current = orderedArticles
      return orderedArticles
    })
  }, [])

  const saveArticleOrder = useCallback(async () => {
    const orderedArticles = articleCardsRef.current
    const newOrder = orderKey(orderedArticles)
    if (newOrder === savedOrderRef.current) {
      return
    }
    savedOrderRef.current = newOrder
    try {
      await query({
        query: updateArticlesOrder,
        variables: {
          corpusId,
          input: {
            articles: orderedArticles.map((item, index) => ({
              articleId: item.id,
              order: index,
            })),
          },
        },
      })
      onUpdate()
      toast(t('actions.reorderArticles.success'), { type: 'info' })
    } catch (err) {
      toast(
        t('actions.reorderArticles.error', {
          errorMessage: err.toString(),
        }),
        { type: 'error' }
      )
    }
  }, [corpusId, onUpdate, query, t])

  return (
    <ol className={styles.list}>
      {articleCards.map((card, index) => (
        <CorpusArticleCard
          key={card.id}
          index={index}
          id={card.id}
          article={card}
          moveCard={moveArticleCard}
          onDragEnd={saveArticleOrder}
        />
      ))}
    </ol>
  )
}
