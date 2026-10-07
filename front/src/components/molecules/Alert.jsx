import clsx from 'clsx'
import { AlertOctagon, CheckCircle, Info, XOctagon } from 'lucide-react'

import styles from './Alert.module.scss'

function getIcon(type) {
  if (type === 'success') {
    return <CheckCircle color={'rgb(38 90 12)'} />
  }
  if (type === 'warning') {
    return <AlertOctagon color={'rgb(100 67 2)'} />
  }
  if (type === 'error') {
    return <XOctagon color={'rgb(153, 0, 3)'} />
  }
  if (type === 'info') {
    return <Info color={'rgb(0 42 102)'} />
  }
  return null
}

function getStyle(type) {
  if (type === 'success') {
    return styles.success
  }
  if (type === 'warning') {
    return styles.warning
  }
  if (type === 'error') {
    return styles.error
  }
  if (type === 'info') {
    return styles.info
  }
  return ''
}

/**
 * @param {object} props
 * @param {string|JSX.Element} props.message
 * @param {'error'|'warning'|'info'|'success'} props.type (default: 'error')
 * @param {boolean=} props.showIcon (default: true)
 * @param {string|undefined} props.className
 * @returns {JSX.Element}
 */
export default function Alert({
  message,
  type = 'error',
  showIcon = true,
  className,
}) {
  const icon = showIcon ? getIcon(type) : null
  return (
    <div role="alert" className={clsx(styles.alert, getStyle(type), className)}>
      {icon} <span>{message}</span>
    </div>
  )
}
