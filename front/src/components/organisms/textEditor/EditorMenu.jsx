import {
  ArrowLeftToLine,
  ArrowRightToLine,
  BookKey,
  FileDownIcon,
  History,
  ListChecks,
  MessageSquareShare,
  TableOfContents,
  TextCursorInput,
} from 'lucide-react'
import { useCallback, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { usePreferenceItem } from '../../../hooks/user.js'
import NakalaIcon from '../../atoms/NakalaIcon.jsx'
import styles from './EditorMenu.module.scss'
import EditorMenuItem from './EditorMenuItem.jsx'

export default function EditorMenu({ articleId, onChange }) {
  const enableNakala = useMemo(
    () => !window.location.href.startsWith('https://stylo.huma-num.fr/'),
    []
  ) // disable Nakala in production
  const { t } = useTranslation()
  const { value: minimized, setValue: setMinimized } = usePreferenceItem(
    'minimized',
    'article'
  )
  const { value: activeMenu, setValue: setActiveMenu } = usePreferenceItem(
    `${articleId}.activeMenu`,
    'article'
  )

  const handleAnnotate = useCallback(
    () => window.open(`${location.pathname}/annotate`, '_blank').focus(),
    []
  )

  const toggleActiveMenu = useCallback(
    (name) => () => {
      const value = activeMenu === name ? '' : name
      setActiveMenu(value)
      onChange(value)
    },
    [activeMenu, onChange, setActiveMenu]
  )

  return (
    <div className={styles.menu}>
      <button
        type="button"
        className={styles.toggleMinimized}
        onClick={() => setMinimized(!minimized)}
      >
        {!minimized && <span>{t('menu.collapse.text')}</span>}
        <span
          title={minimized ? t('menu.expand.title') : t('menu.collapse.title')}
        >
          {minimized ? <ArrowLeftToLine /> : <ArrowRightToLine />}
        </span>
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
          icon={<BookKey />}
          text={t('bibliography.title')}
        />
        {enableNakala && (
          <EditorMenuItem
            onClick={toggleActiveMenu('data')}
            selected={activeMenu === 'data'}
            minimized={minimized}
            icon={<NakalaIcon className="icon as-lucide" />}
            text={t('data.title')}
          />
        )}
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
          icon={<FileDownIcon />}
          text={t('export.title')}
        />
        <EditorMenuItem
          onClick={toggleActiveMenu('validation')}
          selected={activeMenu === 'validation'}
          minimized={minimized}
          icon={<ListChecks />}
          text={t('validation.title')}
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
