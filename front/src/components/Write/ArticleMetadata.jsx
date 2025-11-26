import YAML from 'js-yaml'
import { ArrowLeft } from 'lucide-react'
import React, { useCallback, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useSelector } from 'react-redux'

import { useArticleMetadata } from '../../hooks/article.js'
import { usePreferenceItem } from '../../hooks/user.js'

import Alert from '../molecules/Alert.jsx'
import Loading from '../molecules/Loading.jsx'
import Toggle from '../molecules/Toggle.jsx'
import MonacoYamlEditor from './providers/monaco/YamlEditor.jsx'
import ArticleEditorMetadataForm from './yamleditor/ArticleEditorMetadataForm.jsx'

import styles from './articleEditorMetadata.module.scss'

/**
 * @param {object} props
 * @param {(object) => void} props.onBack
 * @param {string} props.articleId
 * @param {string} props.versionId
 * @returns {Element}
 */
export default function ArticleMetadata({ onBack, articleId, versionId }) {
  /** @type {object} */
  const articleWriters = useSelector((state) => state.articleWriters || {})
  const multiUserActive = useMemo(
    () => Object.keys(articleWriters).length > 1,
    [articleWriters]
  )
  const readOnly = multiUserActive || versionId
  const { t } = useTranslation()
  const {
    metadata,
    metadataFormType,
    metadataFormTypeOptions,
    metadataYaml,
    isLoading,
    updateMetadata,
    updateMetadataFormType,
  } = useArticleMetadata({
    articleId,
    versionId,
  })
  const [error, setError] = useState('')

  const { value: selector, setValue: setSelector } = usePreferenceItem(
    'metadataFormMode',
    'article'
  )

  const handleFormUpdate = useCallback(
    async (metadata) => {
      if (readOnly) {
        return
      }
      await updateMetadata(metadata)
    },
    [readOnly, updateMetadata]
  )

  const handleFormTypeUpdate = useCallback(
    async (formType) => {
      if (readOnly) {
        return
      }
      await updateMetadataFormType(formType)
    },
    [readOnly, updateMetadataFormType]
  )

  const handleYamlChange = useCallback(async (yaml) => {
    try {
      const [metadata = {}] = YAML.loadAll(yaml)
      setError('')
      await updateMetadata(metadata)
    } catch (err) {
      setError(err.message)
    }
  }, [])

  if (isLoading) {
    return <Loading />
  }

  const title = onBack ? (
    <h2
      className={styles.title}
      onClick={onBack}
      style={{ cursor: 'pointer', userSelect: 'none' }}
    >
      <span onClick={onBack} style={{ display: 'flex' }}>
        <ArrowLeft style={{ strokeWidth: 3 }} />
      </span>
      <span>{t('metadata.title')}</span>
    </h2>
  ) : (
    <h2 className={styles.title}>{t('metadata.title')}</h2>
  )

  return (
    <div className={styles.yamlEditor}>
      <header className={styles.header}>
        {title}

        <Toggle
          id="raw-mode"
          data-testid="raw-mode-toggle"
          checked={selector === 'raw'}
          title={t('metadata.showYaml')}
          onChange={(checked) => setSelector(checked ? 'raw' : 'basic')}
        >
          YAML
        </Toggle>
      </header>

      {versionId && (
        <div className={styles.readonly}>
          <Alert message={t('metadata.readonly.versionView')} type="warning" />
        </div>
      )}
      {!versionId && multiUserActive && (
        <div className={styles.readonly}>
          <Alert
            message={t('metadata.readonly.multiUserActive')}
            type="warning"
          />
        </div>
      )}
      {selector === 'raw' && (
        <>
          {error !== '' && <p className={styles.error}>{error}</p>}
          <MonacoYamlEditor
            readOnly={readOnly}
            height="100%"
            fontSize="14"
            text={metadataYaml}
            onTextUpdate={handleYamlChange}
          />
        </>
      )}
      {selector !== 'raw' && (
        <ArticleEditorMetadataForm
          readOnly={readOnly}
          metadata={metadata}
          metadataFormType={metadataFormType}
          metadataFormTypeOptions={metadataFormTypeOptions}
          error={(reason) => {
            setError(reason)
            if (reason !== '') {
              setSelector('raw')
            }
          }}
          onChange={handleFormUpdate}
          onTypeChange={handleFormTypeUpdate}
        />
      )}
    </div>
  )
}
