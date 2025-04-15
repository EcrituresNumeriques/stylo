import { Toggle } from '@geist-ui/core'
import { ArrowLeft } from 'lucide-react'
import React, { useCallback, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useSelector } from 'react-redux'

import { useEditableArticle } from '../../hooks/article.js'
import { useModal } from '../../hooks/modal.js'

import Button from '../Button.jsx'
import Modal from '../Modal.jsx'
import Alert from '../molecules/Alert.jsx'
import FormActions from '../molecules/FormActions.jsx'
import Loading from '../molecules/Loading.jsx'

import styles from './ArticleBibliography.module.scss'
import BibliographyBibtexEditor from './BibliographyBibtexEditor.jsx'
import BibliographyReferenceList from './BibliographyReferenceList.jsx'
import BibliographyZoteroImport from './BibliographyZoteroImport.jsx'

/**
 * @param props
 * @param props.articleId
 * @param props.versionId
 * @param props.onBack
 * @return {Element}
 * @constructor
 */
export default function ArticleBibliography({ articleId, versionId, onBack }) {
  /** @type {object} */
  const articleWriters = useSelector((state) => state.articleWriters || {})
  const readOnly = useMemo(
    () => Object.keys(articleWriters).length > 1,
    [articleWriters]
  )
  const { t } = useTranslation()
  const zoteroModal = useModal()
  const addReferenceModal = useModal()
  const [selector, setSelector] = useState('')
  const [addReferencesText, setAddReferencesText] = useState('')
  const [createReferenceButtonDisabled, setCreateReferenceButtonDisabled] =
    useState(true)

  const { bibliography, article, isLoading, updateBibliography, error } =
    useEditableArticle({
      articleId,
      versionId,
    })

  const handleAddReferences = useCallback(async () => {
    const bibtex = addReferencesText + '\n\n' + bibliography.bibtext
    await updateBibliography(bibtex)
    addReferenceModal.close()
  }, [addReferencesText, addReferenceModal, bibliography])

  const onChange = useCallback(async (bib) => {
    await updateBibliography(bib)
  }, [])

  if (isLoading) {
    return <Loading />
  }

  if (error) {
    return <Alert message={error.message} />
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
      <span>{t('bibliography.title')}</span>
    </h2>
  ) : (
    <h2 className={styles.title}>{t('bibliography.title')}</h2>
  )

  return (
    <section>
      <header className={styles.header}>
        {title}
        <div
          className={styles.toggle}
          onClick={() => setSelector(selector === 'raw' ? 'basic' : 'raw')}
        >
          <Toggle
            id="raw-mode"
            checked={selector === 'raw'}
            title={t('bibliography.showBibTeX')}
            onChange={(e) => setSelector(e.target.checked ? 'raw' : 'basic')}
          />
          <label htmlFor="raw-mode">BibTeX</label>
        </div>
      </header>
      <section>
        {readOnly && (
          <div className={styles.readonly}>
            <Alert message={t('bibliography.readonly')} type="warning" />
          </div>
        )}
        <div className={styles.headingActions}>
          <Button
            small={true}
            disabled={readOnly}
            onClick={() => {
              zoteroModal.show()
            }}
          >
            {t('bibliography.importZotero.button')}
          </Button>
          <Button
            small={true}
            disabled={readOnly}
            onClick={() => {
              addReferenceModal.show()
            }}
          >
            {t('bibliography.addReference.button')}
          </Button>
        </div>
        {selector !== 'raw' && (
          <BibliographyReferenceList
            bibliography={bibliography}
            onUpdate={onChange}
            readOnly={readOnly}
          />
        )}
        {selector === 'raw' && (
          <BibliographyBibtexEditor
            onChange={(result) => onChange(result.text)}
            initialValue={bibliography.bibtext}
            readOnly={readOnly}
          />
        )}

        <Modal
          {...zoteroModal.bindings}
          title={t('bibliography.importZotero.title')}
        >
          <BibliographyZoteroImport
            articleId={articleId}
            onChange={onChange}
            zoteroLink={article.zoteroLink}
          />
        </Modal>

        <Modal
          {...addReferenceModal.bindings}
          title={t('bibliography.addReference.title')}
        >
          <BibliographyBibtexEditor
            initialValue={''}
            editorHeight={'500px'}
            readOnly={readOnly}
            onChange={(result) => {
              if (
                !result.loading &&
                Object.keys(result.entries).length > 0 &&
                result.errors.length === 0 &&
                result.warnings.length === 0
              ) {
                setCreateReferenceButtonDisabled(false)
              } else {
                setCreateReferenceButtonDisabled(true)
              }
              setAddReferencesText(result.text)
            }}
          />
          <FormActions
            onCancel={() => addReferenceModal.close()}
            onSubmit={handleAddReferences}
            submitButton={{
              disabled: createReferenceButtonDisabled,
              text: t('modal.addButton.text'),
            }}
          />
        </Modal>
      </section>
    </section>
  )
}
