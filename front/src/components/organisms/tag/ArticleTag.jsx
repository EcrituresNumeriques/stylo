import clsx from 'clsx'

import styles from './ArticleTag.module.scss'

export default function ArticleTag({
  tag,
  selected,
  key,
  onClick,
  disableAction,
  children,
  addon,
}) {
  const isSelected = tag.selected || selected
  const classNames = clsx(styles.tag, isSelected && styles.selected)

  const backgroundColor = tag.color || 'grey'

  return (
    <div className={classNames}>
      <label aria-label={tag.name}>
        {!disableAction && (
          <input
            name={key}
            value={tag.id}
            data-id={tag.id}
            type="checkbox"
            checked={isSelected}
            onChange={onClick}
          />
        )}
        {tag.name}
        <span className={styles.chip} style={{ backgroundColor }} aria-hidden />
        {children}
      </label>
      {addon && <div>{addon}</div>}
    </div>
  )
}
