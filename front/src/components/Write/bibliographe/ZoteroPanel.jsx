import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { useSelector } from 'react-redux'
import { useTranslation } from 'react-i18next'

import {
  fetchAllCollectionsPerLibrary,
  fetchBibliographyFromCollectionHref,
  prefixLegacyUrl,
  toApiUrl,
} from '../../../helpers/zotero'
import { useGraphQLClient } from '../../../helpers/graphQL'
import { linkToZotero as linkToZoteroQuery } from '../../Article.graphql'
import { useSetAuthToken } from '../../../hooks/user.js'

import Button from '../../Button'
import Field from '../../Field'
import Combobox from '../../SelectCombobox.jsx'

import styles from './bibliographe.module.scss'
import { Rss, Clipboard } from 'lucide-react'

/**
 * @typedef {import('../../SelectCombobox').ComboboxItem} ComboboxItem
 * @typedef {import('../../../helpers/zotero').ZoteroCollection} ZoteroCollection
 */

export default function ZoteroPanel({
  articleId,
  zoteroLink: initialZoteroLink,
  onChange,
}) {
  const { t } = useTranslation()
  const zoteroToken = useSelector((state) => state.activeUser.zoteroToken)
  const userId = useSelector((state) => state.activeUser._id)
  const [zoteroLink, setZoteroLink] = useState(initialZoteroLink)
  const [zoteroCollectionHref, setZoteroCollectionHref] = useState(null)
  /**
   * @type {Array.<ZoteroCollection[], function(ZoteroCollection[]): undefined>}
   */
  const [zoteroCollections, setZoteroCollections] = useState([])

  const [isSaving, setSaving] = useState(false)
  const { query } = useGraphQLClient()

  const handleZoteroLinkChange = useCallback(
    (event) => setZoteroLink(event.target.value),
    []
  )
  const handleZoteroCollectionChange = useCallback(
    (href) => setZoteroCollectionHref(href),
    []
  )
  const hasLinkChanged = useMemo(
    () => initialZoteroLink || initialZoteroLink !== zoteroLink,
    [zoteroLink]
  )
  /** @type {ComboboxItem[]} */
  const groupedZoteroCollections = useMemo(() => {
    return zoteroCollections.map(({ data, meta, library, links }, index) => ({
      key: links.self.href,
      name: `${data.name} (${meta.numItems} items)`,
      section: `${library.name} (${library.type})`,
      // pre-assign an index to each entry. It will persist upon filtered results.
      // @see https://github.com/EcrituresNumeriques/stylo/issues/1014
      index,
    }))
  }, [zoteroCollections])

  const persistZoteroLink = useCallback(
    async (zoteroLink) => {
      if (!zoteroLink === initialZoteroLink) {
        return
      }

      try {
        const variables = {
          zotero: zoteroLink,
          user: userId,
          articleId,
        }
        await query({ query: linkToZoteroQuery, variables })
      } catch (err) {
        alert(err)
      }
    },
    [initialZoteroLink]
  )

  const refreshCollection = useCallback(async (zoteroLink) => {
    if (!zoteroLink) {
      return
    }

    await importCollection({
      collectionHref: zoteroLink,
      token: zoteroToken,
    })
  }, [])

  const handleZoteroLinkFormSubmission = useCallback(async (event) => {
    event.preventDefault()
    const zoteroLink = new FormData(event.target).get('zoteroLink')
    setSaving(true)

    await Promise.all([
      persistZoteroLink(zoteroLink),
      refreshCollection(zoteroLink),
    ])

    setSaving(false)
  }, [])

  const handleCollectionFormSubmission = useCallback(
    async (event) => {
      event.preventDefault()
      setSaving(true)

      await Promise.all([
        persistZoteroLink(zoteroCollectionHref),
        importCollection({
          token: zoteroToken,
          collectionHref: zoteroCollectionHref,
        }),
      ])

      setZoteroLink(zoteroCollectionHref)
      setSaving(false)
    },
    [zoteroCollectionHref, zoteroToken]
  )

  const importCollection = useCallback(async ({ token, collectionHref }) => {
    setSaving(true)
    try {
      const result = await fetchBibliographyFromCollectionHref({
        token,
        collectionHref: await toApiUrl(collectionHref),
      })
      onChange(result)
    } catch (err) {
      console.error(
        `Something went wrong while fetching bibliography from Zotero: ${collectionHref}`,
        err
      )
    } finally {
      setSaving(false)
    }
  }, [])

  const { link: linkZoteroAccount } = useSetAuthToken('zotero')

  useEffect(() => {
    if (zoteroToken) {
      setSaving(true)
      fetchAllCollectionsPerLibrary({ token: zoteroToken })
        .then(setZoteroCollections)
        .finally(() => setSaving(false))
    }
  }, [zoteroToken])

  return (
    <div className={styles.zotero}>
      <form
        className={styles.section}
        disabled={isSaving}
        onSubmit={handleCollectionFormSubmission}
      >
        <h3>
          <Rss aria-hidden />
          {t('zoteroPanel.titleImportCollection.text')}
        </h3>
        {zoteroToken && (
          <Combobox
            label=""
            items={groupedZoteroCollections}
            value={zoteroCollectionHref}
            onChange={handleZoteroCollectionChange}
          />
        )}
        {zoteroToken && (
          <Button
            type="submit"
            primary
            disabled={!zoteroCollectionHref || isSaving}
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

      <form
        className={styles.section}
        onSubmit={handleZoteroLinkFormSubmission}
      >
        <h3>
          <Clipboard aria-hidden />
          {t('zoteroPanel.titleImportByUrl.text')}
        </h3>

        <p className={styles.helpText}>
          {t(
            zoteroToken
              ? 'zoteroPanel.textImportByUrl.withToken'
              : 'zoteroPanel.textImportByUrl.withoutToken'
          )}
        </p>
        <Field
          onChange={handleZoteroLinkChange}
          name="zoteroLink"
          value={prefixLegacyUrl(zoteroLink)}
          autoFocus={true}
        />
        <Button
          type="submit"
          primary={true}
          disabled={isSaving || !hasLinkChanged}
        >
          {isSaving
            ? t('zoteroPanel.fetchingButton.text')
            : t('zoteroPanel.replaceAccountCollection.text')}
        </Button>
      </form>
    </div>
  )
}
