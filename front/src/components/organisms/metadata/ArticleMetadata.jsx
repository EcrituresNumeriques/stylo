import YAML from 'js-yaml'
import debounce from 'lodash.debounce'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { toast } from 'react-toastify'

import { useArticleMetadata } from '../../../hooks/article.js'
import { usePreferenceItem } from '../../../hooks/user.js'
import { Alert, Loading, Toggle } from '../../molecules/index.js'

import ArticleEditorMetadataForm from './ArticleEditorMetadataForm.jsx'
import styles from './articleEditorMetadata.module.scss'
import MonacoYamlEditor from './YamlEditor.jsx'

// metadata are saved once the user stops typing, instead of on every keystroke
const SAVE_METADATA_DELAY_MS = 500

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

  // updateMetadata changes on every render: keep the latest one in a ref
  // so that the debounced function is created only once
  const updateMetadataRef = useRef(updateMetadata)
  updateMetadataRef.current = updateMetadata

  const saveMetadata = useMemo(
    () =>
      debounce(async (metadata) => {
        try {
          await updateMetadataRef.current(metadata)
        } catch (err) {
          toast(t('metadata.saveError', { errMessage: err.message }), {
            type: 'error',
          })
        }
      }, SAVE_METADATA_DELAY_MS),
    [t]
  )

  // save pending changes when leaving the metadata panel
  useEffect(() => () => saveMetadata.flush(), [saveMetadata])

  const handleFormUpdate = useCallback(
    (metadata) => {
      if (readOnly) {
        return
      }
      saveMetadata(metadata)
    },
    [readOnly, saveMetadata]
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

  const handleYamlChange = useCallback(
    (yaml) => {
      try {
        const [metadata = {}] = YAML.loadAll(yaml)
        setError('')
        saveMetadata(metadata)
      } catch (err) {
        setError(err.message)
      }
    },
    [saveMetadata]
  )

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
