import styles from './Avatar.module.scss'

/**
 * @param {object} props
 * @param {string} props.text
 * @returns {Element}
 */
export default function Avatar({ text = '' }) {
  const safeText = text.length <= 4 ? text : text.slice(0, 3)
  return (
    <figure className={styles.avatar}>
      <figcaption className={styles.text} title={text}>
        <span aria-hidden={true}>{safeText}</span>
      </figcaption>
    </figure>
  )
}
