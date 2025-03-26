import clsx from 'clsx'
import React, { useState } from 'react'
import { ChevronRight } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useArticleWorkingCopy } from '../../hooks/article.js'
import Sidebar from '../Sidebar.jsx'
import ArticleMetadata from '../Write/ArticleMetadata.jsx'
import ArticleTableOfContents from './ArticleTableOfContents.jsx'

import styles from './CollaborativeEditorMenu.module.scss'

export default function CollaborativeEditorMenu({ articleId }) {
  const { t } = useTranslation()
  const [opened, setOpened] = useState(false)
  const [activeMenu, setActiveMenu] = useState('')

  const { article } = useArticleWorkingCopy({ articleId })

  const metadata = article?.workingVersion?.metadata

  return (
    <div className={styles.menu} role="menu">
      <Sidebar
        className={clsx(styles.container, opened && styles.opened)}
        opened={opened}
        setOpened={setOpened}
        labelOpened={t('editorMenu.open.label')}
        labelClosed={t('editorMenu.close.label')}
      >
        <section>
          {activeMenu === '' && (
            <ul className={styles.entries}>
              <li onClick={() => setActiveMenu('toc')}>
                {t('toc.title')}
                <ChevronRight
                  style={{ strokeWidth: 3 }}
                  height={32}
                  width={32}
                />
              </li>
              <li onClick={() => setActiveMenu('metadata')}>
                {t('metadata.title')}
                <ChevronRight
                  style={{ strokeWidth: 3 }}
                  height={32}
                  width={32}
                />
              </li>
            </ul>
          )}
          <div className={styles.content}>
            {activeMenu === 'metadata' && (
              <ArticleMetadata
                onBack={() => setActiveMenu('')}
                metadata={metadata}
                readOnly={true}
              />
            )}
            {activeMenu === 'toc' && (
              <ArticleTableOfContents onBack={() => setActiveMenu('')} />
            )}
          </div>
        </section>
      </Sidebar>
    </div>
  )
}
