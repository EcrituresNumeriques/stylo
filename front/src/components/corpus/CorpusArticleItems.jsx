import { useToasts } from '@geist-ui/core'
import debounce from 'lodash.debounce'
import PropTypes from 'prop-types'
import React, { useCallback, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useGraphQLClient } from '../../helpers/graphQL.js'
import Loading from '../molecules/Loading.jsx'

import { updateArticlesOrder } from './Corpus.graphql'
import CorpusArticleCard from './CorpusArticleCard.jsx'

import styles from './corpusArticleItems.module.scss'

export default function CorpusArticleItems({ corpusId, articles, onUpdate }) {
  const [isLoading, setLoading] = useState(true)
  const [articleCards, setArticleCards] = useState([])
  useEffect(() => {
    try {
      setArticleCards(articles.map((a) => a.article))
    } finally {
      setLoading(false)
    }
  }, [articles])
  const { query } = useGraphQLClient()
  const { setToast } = useToasts()
  const { t } = useTranslation()
  const updateArticleOrder = useCallback(
    debounce(
      async (orderedArticles) => {
        const articlesOrderInput = orderedArticles.map((item, index) => ({
          articleId: item._id,
          order: index,
        }))
        try {
          await query({
            query: updateArticlesOrder,
            variables: { corpusId, articlesOrderInput },
          })
          onUpdate()
          setToast({
            type: 'default',
            text: t('corpus.articlesOrder.toastSuccess'),
          })
        } catch (err) {
          setToast({
            type: 'error',
            text: t('corpus.articlesOrder.toastFailure', {
              errorMessage: err.toString(),
            }),
          })
        }
      },
      750,
      { leading: false, trailing: true }
    ),
    []
  )
  const moveArticleCard = useCallback((dragIndex, hoverIndex) => {
    setArticleCards((prevCards) => {
      const length = prevCards.length
      const position =
        hoverIndex < dragIndex
          ? { startIndex: hoverIndex, endIndex: dragIndex }
          : { startIndex: dragIndex, endIndex: hoverIndex }
      const orderedArticles = [
        ...prevCards.slice(0, position.startIndex),
        prevCards[position.endIndex],
        ...prevCards.slice(position.startIndex + 1, position.endIndex),
        prevCards[position.startIndex],
        ...prevCards.slice(position.endIndex + 1, length),
      ]
      updateArticleOrder(orderedArticles)
      return orderedArticles
    })
  }, [])
  const renderCard = useCallback((card, index) => {
    return (
      <CorpusArticleCard
        key={card._id}
        index={index}
        id={card._id}
        article={card}
        moveCard={(dragIndex, hoverIndex) => {
          moveArticleCard(dragIndex, hoverIndex)
        }}
      />
    )
  }, [])

  if (isLoading) {
    return <Loading />
  }

  return (
    <div className={styles.container}>
      {articleCards.map((card, i) => renderCard(card, i))}
    </div>
  )
}

CorpusArticleItems.propTypes = {
  corpusId: PropTypes.string,
  articles: PropTypes.array,
}
