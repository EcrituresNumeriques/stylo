import clsx from 'clsx'
import { GripVertical } from 'lucide-react'
import { useRef } from 'react'
import { useDrag, useDrop } from 'react-dnd'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router'

import styles from './corpusArticleCard.module.scss'

/**
 * @param {object} props
 * @param {string} props.id
 * @param {{id: string, title: string}} props.article
 * @param {number} props.index
 * @param {(dragIndex: number, hoverIndex: number) => void} props.moveCard - Called while hovering to reorder the list locally
 * @param {() => void} props.onDragEnd - Called once the card has been dropped
 * @returns {JSX.Element}
 */
export default function CorpusArticleCard({
  id,
  article,
  index,
  moveCard,
  onDragEnd,
}) {
  const { t } = useTranslation('corpus', { useSuspense: false })
  const ref = useRef(null)
  const handleRef = useRef(null)
  const [{ handlerId }, drop] = useDrop({
    accept: 'card',
    collect(monitor) {
      return {
        handlerId: monitor.getHandlerId(),
      }
    },
    hover(item, monitor) {
      if (!ref.current) {
        return
      }
      const dragIndex = item.index
      const hoverIndex = index
      // Don't replace items with themselves
      if (dragIndex === hoverIndex) {
        return
      }
      const hoverBoundingRect = ref.current.getBoundingClientRect()
      const hoverMiddleY =
        (hoverBoundingRect.bottom - hoverBoundingRect.top) / 2
      const clientOffset = monitor.getClientOffset()
      const hoverClientY = clientOffset.y - hoverBoundingRect.top
      // Only perform the move when the mouse has crossed half of the items height
      if (dragIndex < hoverIndex && hoverClientY < hoverMiddleY) {
        return
      }
      if (dragIndex > hoverIndex && hoverClientY > hoverMiddleY) {
        return
      }
      moveCard(dragIndex, hoverIndex)
      // Mutating the monitor item avoids expensive index searches.
      item.index = hoverIndex
    },
  })
  const [{ isDragging }, drag, preview] = useDrag({
    type: 'card',
    item: () => ({ id, index }),
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
    end: () => onDragEnd(),
  })
  // Only the handle starts a drag, the whole row is used as preview and drop target
  drag(handleRef)
  preview(drop(ref))

  return (
    <li
      className={clsx(styles.card, isDragging && styles.dragging)}
      ref={ref}
      data-handler-id={handlerId}
    >
      <span
        ref={handleRef}
        className={styles.handle}
        title={t('actions.reorderArticles.handle')}
      >
        <GripVertical aria-hidden />
      </span>
      <span className={styles.position} aria-hidden>
        {index + 1}.
      </span>
      <Link to={`/article/${article.id}`} className={styles.title}>
        {article.title}
      </Link>
    </li>
  )
}
