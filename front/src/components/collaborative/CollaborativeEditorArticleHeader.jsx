import React from 'react'
import { Eye, Printer } from 'lucide-react'
import { Link } from 'react-router-dom'

import useFetchData from '../../hooks/graphql.js'
import { useModal } from '../../hooks/modal.js'

import { getArticleInfo } from '../Article.graphql'

import Button from '../Button.jsx'

import buttonStyles from '../button.module.scss'
import Export from '../Export.jsx'
import Modal from '../Modal.jsx'
import Loading from '../molecules/Loading.jsx'
import styles from './CollaborativeEditorArticleHeader.module.scss'

/**
 * @param props
 * @param {string} props.articleId
 * @return {Element}
 */
export default function CollaborativeEditorArticleHeader({ articleId }) {
  const { data, isLoading } = useFetchData(
    { query: getArticleInfo, variables: { articleId } },
    {
      revalidateIfStale: false,
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
    }
  )
  const exportModal = useModal()

  if (isLoading) {
    return <Loading />
  }

  return (
    <header className={styles.header}>
      <h1 className={styles.title}>{data?.article?.title}</h1>
      <div>
        <Button
          icon
          title="Download a printable version"
          onClick={() => exportModal.show()}
        >
          <Printer />
        </Button>
        <Link
          to={`/article/${articleId}/preview`}
          title="Preview (open a new window)"
          target="_blank"
          rel="noopener noreferrer"
          className={buttonStyles.icon}
        >
          <Eye />
        </Link>
      </div>

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
    </header>
  )
}
