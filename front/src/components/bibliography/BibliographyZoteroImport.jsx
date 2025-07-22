import { Clipboard, Rss } from 'lucide-react'
import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useRouteLoaderData } from 'react-router'

import { useToasts } from '@geist-ui/core'

import {
  fetchBibliographyFromCollectionHref,
  fetchUserCollections,
  isApiUrl,
  prefixLegacyUrl,
  toApiUrl,
} from '../../helpers/zotero.js'
import { useEditableArticle } from '../../hooks/article.js'
import { useSetAuthToken } from '../../hooks/user.js'

import Button from '../Button.jsx'
import Field from '../Field.jsx'
import Combobox from '../SelectCombobox.jsx'

import styles from './BibliographyZoteroImport.module.scss'

/**
 * @typedef {import('../SelectCombobox.jsx').ComboboxItem} ComboboxItem
 * @typedef {import('../../helpers/zotero.js').ZoteroCollection} ZoteroCollection
 */

/**
 *
 * @param {React.ComponentProps} props
 * @param {string} props.articleId
 * @param {(string) => void} props.onUpdated
 * @param {string?} props.zoteroLink the value as it is stored in the article model
 * @returns {React.ReactElement}
 */
export default function BibliographyZoteroImport({
  articleId,
  zoteroLink: initialZoteroLink,
  onUpdated = () => {},
}) {
  const { t } = useTranslation()
  const { updateBibliography, updateZoteroLink } = useEditableArticle({
    articleId,
  })
  const { setToast } = useToasts()
  const { link: linkZoteroAccount } = useSetAuthToken('zotero')
  const { user } = useRouteLoaderData('app')
  const zoteroToken = user?.authProviders?.zotero?.token

  /**
   * User collections fetched from Zotero, when logged in.
   *
   * @type {Array.<ZoteroCollection[], function(ZoteroCollection[]): undefined>}
   */
  const [zoteroCollections, setZoteroCollections] = useState([])

  /** @type {ComboboxItem[]} */
  const groupedZoteroCollections = useMemo(() => {
    return zoteroCollections.map(({ data, meta, library, links }, index) => ({
      key: links.self.href,
      name: t('bibliography.importZotero.collections.leaf', {
        name: data.name,
        count: meta.numItems,
      }),
      section: t('bibliography.importZotero.collections.section', {
        name: library.name,
        count: meta.numItems,
        type: library.type,
      }),
      // pre-assign an index to each entry. It will persist upon filtered results.
      // @see https://github.com/EcrituresNumeriques/stylo/issues/1014
      index,
    }))
  }, [zoteroCollections])

  /*
   * Base value of the Zotero link.
   * We then resolve it for the various contexts, forms, etc.
   */
  const [zoteroLink, setZoteroLink] = useState(
    prefixLegacyUrl(initialZoteroLink)
  )

  const [isSaving, setSaving] = useState(false)
  const [isLoadingCollections, setLoadingCollections] = useState(false)

  /*
   * Collection URL
   * Value used by the combobox
   */
  const isInUserCollections = zoteroCollections.some(
    (collection) => collection.links.self.href === zoteroLink
  )

  // const [collectionUrl, setCollectionUrl] = useState(
  //   isApiUrl(zoteroLink) && isInUserCollections ? zoteroLink : ''
  // )
  const collectionUrl = useMemo(
    () =>
      isApiUrl(zoteroLink) && (isLoadingCollections || isInUserCollections)
        ? zoteroLink
        : '',
    [zoteroLink, isLoadingCollections, isInUserCollections]
  )

  const handleCollectionUrlChange = useCallback((url) => setZoteroLink(url), [])

  /*
   * Plain URL
   * Value used by the copy/paste form
   */
  // const [plainUrl, setPlainUrl] = useState('')
  const plainUrl = useMemo(() => {
    return collectionUrl ? '' : zoteroLink
  }, [collectionUrl, zoteroLink])

  const handlePlainUrlChange = useCallback(
    (event) => setZoteroLink(event.target.value),
    []
  )

  /*
   * Fetch and persist
   */
  const fetchAndPersistBibliography = useCallback(
    async (event) => {
      event.preventDefault()
      setSaving(true)

      try {
        const collectionHref = await toApiUrl(zoteroLink, zoteroToken)
        const bib = await fetchBibliographyFromCollectionHref({
          token: zoteroToken,
          collectionHref,
        })

        await Promise.all([
          updateBibliography(bib),
          updateZoteroLink(zoteroLink),
        ])

        setToast({
          text: t('bibliography.importZotero.success', { url: zoteroLink }),
        })
        onUpdated(bib)
      } catch (err) {
        setToast({
          type: 'error',
          text: t(
            [
              `bibliography.importZotero.error.e${err.statusCode}`,
              'bibliography.importZotero.error.generic',
            ],
            { message: err.message }
          ),
        })

        // bubble errors we're responsible of to Sentry
        if ([403, undefined].includes(err.statusCode)) {
          throw err
        }
      } finally {
        setSaving(false)
      }
    },
    [zoteroLink]
  )

  useEffect(() => {
    if (zoteroToken) {
      setLoadingCollections(true)
      fetchUserCollections(zoteroToken)
        .then(setZoteroCollections)
        .finally(() => setLoadingCollections(false))
    }
  }, [zoteroToken])

  return (
    <div className={styles.zotero}>
      <form
        className={styles.section}
        disabled={isSaving}
        onSubmit={fetchAndPersistBibliography}
      >
        <h3>
          <Rss aria-hidden />
          {t('zoteroPanel.titleImportCollection.text')}
        </h3>
        {zoteroToken && (
          <Combobox
            label=""
            items={groupedZoteroCollections}
            value={collectionUrl}
            onChange={handleCollectionUrlChange}
          />
        )}
        {zoteroToken && (
          <Button
            type="submit"
            primary
            disabled={isSaving || isLoadingCollections || !collectionUrl}
          >
            {isSaving
              ? t('zoteroPanel.fetchingButton.text')
              : t('zoteroPanel.replaceAccountCollection.text')}
          </Button>
        )}

        {!zoteroToken && (
          <Button type="button" onClick={linkZoteroAccount}>
            {t('zoteroPanel.buttonZoteroAccount.text')}
          </Button>
        )}
      </form>

      <form className={styles.section} onSubmit={fetchAndPersistBibliography}>
        <h3>
          <Clipboard aria-hidden />
          {t('zoteroPanel.titleImportByUrl.text')}
        </h3>

        <p>
          {t(
            zoteroToken
              ? 'zoteroPanel.textImportByUrl.withToken'
              : 'zoteroPanel.textImportByUrl.withoutToken'
          )}
        </p>
        <Field
          name="url"
          value={plainUrl}
          onChange={handlePlainUrlChange}
          type="url"
        />
        <Button type="submit" primary={true} disabled={isSaving || !plainUrl}>
          {isSaving
            ? t('zoteroPanel.fetchingButton.text')
            : t('zoteroPanel.replaceAccountCollection.text')}
        </Button>
      </form>
    </div>
  )
}
