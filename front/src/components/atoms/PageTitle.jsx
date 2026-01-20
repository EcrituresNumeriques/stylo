import styles from './PageTitle.module.scss'

export default function PageTitle({ title, ...props }) {
  return (
    <h1 className={styles.title} {...props}>
      {title}
    </h1>
  )
}
