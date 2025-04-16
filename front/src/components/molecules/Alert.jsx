import clsx from 'clsx'
import React from 'react'
import { AlertOctagon, CheckCircle, Info, XOctagon } from 'lucide-react'

import styles from './Alert.module.scss'

function getIcon(type) {
  if (type === 'success') {
    return <CheckCircle color={'rgb(82, 196, 26)'} />
  }
  if (type === 'warning') {
    return <AlertOctagon color={'rgb(250, 173, 20)'} />
  }
  if (type === 'error') {
    return <XOctagon color={'rgb(255, 77, 79)'} />
  }
  if (type === 'info') {
    return <Info color={'rgb(22, 119, 255)'} />
  }
  return <></>
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
 * @param props
 * @param {string|JSX.Element} props.message
 * @param {'error'|'warning'|'info'|'success'} props.type (default: 'error')
 * @param {boolean=} props.showIcon (default: true)
 * @param {string|undefined} props.className
 * @return {JSX.Element}
 */
export default function Alert({
  message,
  type = 'error',
  showIcon = true,
  className,
}) {
  const icon = showIcon ? getIcon(type) : <></>
  return (
    <div className={clsx(styles.alert, getStyle(type), className)}>
      {icon} <span>{message}</span>
    </div>
  )
}
