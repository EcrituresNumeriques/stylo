import clsx from 'clsx'

import styles from './PageTitle.module.scss'

export default function PageTitle({ title, className, ...props }) {
  return (
    <h1 className={clsx(styles.title, className)} {...props}>
      {title}
    </h1>
  )
}
