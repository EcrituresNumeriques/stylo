import YAML from 'js-yaml'
import { useCallback, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { useArticleMetadata } from '../../../hooks/article.js'
import { usePreferenceItem } from '../../../hooks/user.js'
import { Alert, Loading, Toggle } from '../../molecules/index.js'

import ArticleEditorMetadataForm from './ArticleEditorMetadataForm.jsx'
import styles from './articleEditorMetadata.module.scss'
import MonacoYamlEditor from './YamlEditor.jsx'

/**
 * @param {object} props
 * @param {string} props.articleId
 * @param {string} props.versionId
 * @returns {JSX.Element}
 */
export default function ArticleMetadata({
  articleId,
  versionId,
  writers = {},
}) {
  const multiUserActive = useMemo(
    () => Object.keys(writers).length > 1,
    [writers]
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

  return (
    <div className={styles.yamlEditor}>
      <header className={styles.header}>
        <h2 className={styles.title}>{t('metadata.title')}</h2>

        <Toggle
          id="raw-mode"
          data-testid="raw-mode-toggle"
          checked={selector === 'raw'}
          labelKey={'metadata.showYaml'}
          onChange={(checked) => setSelector(checked ? 'raw' : 'basic')}
        />
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
