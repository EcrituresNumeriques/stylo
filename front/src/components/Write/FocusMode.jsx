import React, { useCallback } from 'react'
import { useDispatch, useSelector } from 'react-redux'

import Button from '../Button'

import { ToggleLeft, ToggleRight } from 'react-feather'
import styles from './workingVersion.module.scss'

export default function FocusMode ({ className }) {
  const dispatch = useDispatch()
  const focusMode = useSelector(state => state.articlePreferences.focusMode)

  const toggleFocusMode = useCallback(() => {
    dispatch({ type: 'ARTICLE_PREFERENCES_TOGGLE', key: 'focusMode' })
  }, [])

  return <Button onClick={toggleFocusMode}
    className={[styles.focusButton, className, focusMode ? styles.focusActiveButton : ''].join(' ')}
    title={`${focusMode ? 'Disable' : 'Enable'} focus`}>
  {focusMode ? <ToggleRight/> : <ToggleLeft/>} Focus
  </Button>
}
