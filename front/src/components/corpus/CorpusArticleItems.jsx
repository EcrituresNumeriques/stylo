import PropTypes from 'prop-types'
import React, { useCallback, useState } from 'react'
import CorpusArticleCard from './CorpusArticleCard.jsx'

import styles from './corpusArticleItems.module.scss'

export default function CorpusArticleItems ({ articles }) {
  const [cards, setCards] = useState(articles.map((a) => a.article))
  const moveCard = useCallback((dragIndex, hoverIndex) => {
    setCards((prevCards) => {
      const length = prevCards.length
      const position = hoverIndex < dragIndex
        ? { startIndex: hoverIndex, endIndex: dragIndex }
        : { startIndex: dragIndex, endIndex: hoverIndex }
      return [
        ...prevCards.slice(0, position.startIndex),
        prevCards[position.endIndex],
        ...prevCards.slice(position.startIndex + 1, position.endIndex),
        prevCards[position.startIndex],
        ...prevCards.slice(position.endIndex + 1, length),
      ]
    })
  }, [])
  const renderCard = useCallback((card, index) => {
    return (
      <CorpusArticleCard
        key={card._id}
        index={index}
        id={card._id}
        article={card}
        moveCard={moveCard}
      />
    )
  }, [])
  return <div className={styles.container}>{cards.map((card, i) => renderCard(card, i))}</div>
}

CorpusArticleItems.propTypes = {
  articles: PropTypes.array,
}
