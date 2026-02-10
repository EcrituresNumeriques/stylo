import {
  BookMarked,
  History,
  Maximize2,
  MessageSquareShare,
  Minimize2,
  Printer,
  TableOfContents,
  TextCursorInput,
} from 'lucide-react'
import React, { useCallback, useState } from 'react'
import { useTranslation } from 'react-i18next'

import EditorMenuItem from './EditorMenuItem.jsx'

import styles from './EditorMenu.module.scss'

export default function EditorMenu({ onChange }) {
  const { t } = useTranslation()
  const [minimized, setMinimized] = useState(false)
  const [activeMenu, setActiveMenu] = useState('')

  const handleAnnotate = useCallback(
    () => window.open(location.pathname + '/annotate', '_blank').focus(),
    []
  )

  const toggleActiveMenu = useCallback(
    (name) => (_) => {
      const value = activeMenu === name ? '' : name
      setActiveMenu(value)
      onChange(value)
    },
    [activeMenu, onChange]
  )

  return (
    <div className={styles.menu}>
      <button
        className={styles.toggleMinimized}
        onClick={() => setMinimized(!minimized)}
      >
        {!minimized && <span>{t('collapse.title')}</span>}
        <span>{minimized ? <Maximize2 /> : <Minimize2 />}</span>
      </button>
      <div className={styles.items}>
        <EditorMenuItem
          onClick={toggleActiveMenu('toc')}
          selected={activeMenu === 'toc'}
          minimized={minimized}
          icon={<TableOfContents />}
          text={t('toc.title')}
        />
        <EditorMenuItem
          onClick={toggleActiveMenu('metadata')}
          selected={activeMenu === 'metadata'}
          minimized={minimized}
          icon={<TextCursorInput />}
          text={t('metadata.title')}
        />
        <EditorMenuItem
          onClick={toggleActiveMenu('bibliography')}
          selected={activeMenu === 'bibliography'}
          minimized={minimized}
          icon={<BookMarked />}
          text={t('bibliography.title')}
        />
        <EditorMenuItem
          onClick={toggleActiveMenu('versions')}
          selected={activeMenu === 'versions'}
          minimized={minimized}
          icon={<History />}
          text={t('versions.title')}
        />
        <EditorMenuItem
          onClick={toggleActiveMenu('export')}
          selected={activeMenu === 'export'}
          minimized={minimized}
          icon={<Printer />}
          text={t('export.title')}
        />
        <EditorMenuItem
          onClick={handleAnnotate}
          selected={activeMenu === 'annotate'}
          minimized={minimized}
          icon={<MessageSquareShare />}
          text={t('annotate.title')}
          external={true}
        />
      </div>
    </div>
  )
}
