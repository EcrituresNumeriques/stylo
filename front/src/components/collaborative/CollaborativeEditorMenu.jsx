import clsx from 'clsx'
import { ChevronRight, ExternalLink, Printer } from 'lucide-react'
import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useHistory } from 'react-router-dom'
import { useArticleWorkingCopy } from '../../hooks/article.js'
import useFetchData from '../../hooks/graphql.js'
import { useModal } from '../../hooks/modal.js'

import { getArticleInfo } from '../Article.graphql'
import Export from '../Export.jsx'
import Modal from '../Modal.jsx'
import Loading from '../molecules/Loading.jsx'
import Sidebar from '../Sidebar.jsx'
import ArticleMetadata from '../Write/ArticleMetadata.jsx'
import ArticleTableOfContents from './ArticleTableOfContents.jsx'

import styles from './CollaborativeEditorMenu.module.scss'

export default function CollaborativeEditorMenu({ articleId }) {
  const { t } = useTranslation()
  const [opened, setOpened] = useState(false)
  const [activeMenu, setActiveMenu] = useState('')
  const exportModal = useModal()
  const { article } = useArticleWorkingCopy({ articleId })
  const history = useHistory()
  const { data, isLoading } = useFetchData(
    { query: getArticleInfo, variables: { articleId } },
    {
      revalidateIfStale: false,
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
    }
  )

  if (isLoading) {
    return <Loading />
  }

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
            <div className={styles.entries}>
              <a href="#" onClick={() => setActiveMenu('toc')}>
                {t('toc.title')}
                <ChevronRight
                  style={{ strokeWidth: 3 }}
                  height={32}
                  width={32}
                />
              </a>
              <a href="#" onClick={() => setActiveMenu('metadata')}>
                {t('metadata.title')}
                <ChevronRight
                  style={{ strokeWidth: 3 }}
                  height={32}
                  width={32}
                />
              </a>

              <a
                href="#"
                onClick={() => exportModal.show()}
                title="Download a printable version"
              >
                {t('export.title')}
              </a>

              <a
                href={`/article/${articleId}/preview`}
                title="Preview (open a new window)"
                target="_blank"
                rel="noopener noreferrer"
                className={styles.external}
              >
                {t('annotate.title')}
              </a>
            </div>
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
      <Modal
        {...exportModal.bindings}
        title={
          <>
            <Printer /> Export
          </>
        }
      >
        <Export
          articleId={articleId}
          name={data?.article?.title}
          bib={data?.article?.workingVersion?.bibPreview}
          onCancel={() => exportModal.close()}
        />
      </Modal>
    </div>
  )
}
