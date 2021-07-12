import React, { useEffect, useState } from 'react'
import { connect, useDispatch } from 'react-redux'

import etv from '../../../helpers/eventTargetValue'
import { getUserProfile } from '../../../helpers/userProfile'
import askGraphQL from '../../../helpers/graphQL'
import { fetchAllCollectionsPerLibrary, fetchBibliographyFromCollectionHref, } from '../../../helpers/zotero'

import styles from './bibliographe.module.scss'

import ManageCitation from '../../Citation/ManageCitation'
import EditRawCitation from '../../Citation/EditRawCitation'

import Button from '../../Button'
import Field from '../../Field'
import Select from '../../Select'
import NavTag from '../../NavTab'

const mapStateToProps = ({ articleBib, articleBibTeXEntries, activeUser, applicationConfig }) => {
  return { articleBib, articleBibTeXEntries, activeUser, applicationConfig }
}

const mapDispatchToProps = (dispatch) => ({
  refreshProfile: (applicationConfig) =>
    getUserProfile(applicationConfig).then((response) =>
      dispatch({ type: 'PROFILE', ...response })
    ),
})

function ConnectedBibliographe({ article, cancel, refreshProfile, articleBib, articleBibTeXEntries, activeUser, applicationConfig }) {
  const { backendEndpoint } = applicationConfig
  const [selector, setSelector] = useState('zotero')
  const [isSaving, setSaving] = useState(false)
  const [zoteroLink, setZoteroLink] = useState(article.zoteroLink || '')
  const [zoteroCollectionHref, setZoteroCollectionHref] = useState(null)
  const { zoteroToken } = activeUser
  const [zoteroCollections, setZoteroCollections] = useState({})
  const dispatch = useDispatch()

  useEffect(() => {
    if (zoteroToken) {
      setSaving(true)
      fetchAllCollectionsPerLibrary({ token: zoteroToken })
        .then(setZoteroCollections)
        .finally(() => setSaving(false))
    }
  }, [zoteroToken])

  const saveNewZotero = async () => {
    setSaving(true)

    // saveOnGraphQL
    if (article.zoteroLink !== zoteroLink) {
      console.log('Saving to graphQL', article.zoteroLink, zoteroLink)
      try {
        const query = `mutation($user:ID!,$article:ID!,$zotero:String!){zoteroArticle(article:$article,zotero:$zotero,user:$user){ _id zoteroLink}}`
        const variables = {
          zotero: zoteroLink,
          user: activeUser._id,
          article: article._id,
        }
        await askGraphQL(
          { query, variables },
          'updating zoteroLink',
          null,
          applicationConfig
        )
      } catch (err) {
        setSaving(false)
        alert(err)
      }
    }

    // we synchronize the collection, any time we save
    if (zoteroLink) {
      await fetchBibliographyFromCollectionHref({
        collectionHref: `https://api.zotero.org/groups/${zoteroLink}`,
      }).then((result) => {
        setSaving(false)
        const bib = result.join('\n')
        dispatch({ type: 'UPDATE_ARTICLE_BIB', bib })
        cancel()
      })
    } else {
      // previous value was empty, and we tried to save an empty value again
      setSaving(false)
    }
  }

  const importCollection = ({ token, collectionHref }) => {
    setSaving(true)
    fetchBibliographyFromCollectionHref({ token, collectionHref }).then(
      (result) => {
        setSaving(false)
        const bib = result.join('\n')
        dispatch({ type: 'UPDATE_ARTICLE_BIB', bib })
        cancel()
      }
    )
  }

  const zoteroCollectionSelect = (
    <Select onChange={(event) => setZoteroCollectionHref(etv(event))}>
      <option value="">
        {isSaving ? 'Fetching collections…' : 'Pick a collection'}
      </option>
      {Object.entries(zoteroCollections).map(([_, collections]) => (
        <optgroup
          key={collections[0].key}
          label={`${collections[0].library.name} (${collections[0].library.type})`}
        >
          {collections.map(({ data, meta, links }) => (
            <option key={data.key} value={links.self.href}>
              {data.name} ({meta.numItems} items)
            </option>
          ))}
        </optgroup>
      ))}
    </Select>
  )

  return (
    <article>
      <h1 className={styles.title}>Bibliography</h1>
      <NavTag defaultValue={selector} onChange={(value) => setSelector(value)} items={[
        {
          value: 'zotero',
          name: 'Zotero'
        },
        {
          value: 'citations',
          name: 'Citations'
        },
        {
          value: 'raw',
          name: 'Raw BibTeX'
        }
      ]
      } />
      {selector === 'zotero' && (
        <div className={styles.zotero}>
          <h3>Import by URL</h3>

          <form onSubmit={(e) => e.preventDefault() && saveNewZotero()}>
            <p>
              Please paste the URL of your Zotero library, so that it looks like
              https://www.zotero.org/groups/
              <strong>[IDnumber]/collections/[IDcollection]</strong>
            </p>
            <label>https://www.zotero.org/groups/</label>
            <Field
              placeholder="[IDnumber]/collections/[IDcollection]"
              value={zoteroLink}
              onChange={(e) => setZoteroLink(etv(e))}
            />
            <Button
              type="submit"
              primary={true}
              onClick={() => saveNewZotero()}
              disabled={
                isSaving ||
                (!zoteroLink && zoteroLink === article.zoteroLink)
              }
            >
              {isSaving
                ? 'Fetching…'
                : 'Replace bibliography with this collection'}
            </Button>
          </form>
          <hr />
          <h3>Import from my Zotero account</h3>
          <form disabled={isSaving} onSubmit={(e) => e.preventDefault()}>
            {zoteroToken && zoteroCollectionSelect}
            {zoteroToken && (
              <Button
                type="submit"
                disabled={!zoteroCollectionHref || isSaving}
                onClick={() =>
                  importCollection({
                    token: zoteroToken,
                    collectionHref: zoteroCollectionHref,
                  })
                }
              >
                {isSaving
                  ? 'Fetching…'
                  : 'Replace bibliography with this private collection'}
              </Button>
            )}
            {!zoteroToken && (
              <Button
                type="button"
                onClick={() => {
                  const popup = window.open(
                    `${backendEndpoint}/login/zotero`,
                    'openid',
                    'width=660&height=360&menubar=0&toolbar=0'
                  )
                  const intervalId = setInterval(() => {
                    if (popup.closed) {
                      refreshProfile(applicationConfig)
                      clearInterval(intervalId)
                    }
                  }, 1000)
                }}
              >
                Connect my account
              </Button>
            )}
          </form>
        </div>
      )}

      {selector === 'citations' && <ManageCitation />}
      {selector === 'raw' && <EditRawCitation />}
    </article>
  )
}

const Bibliographe = connect(mapStateToProps, mapDispatchToProps)(ConnectedBibliographe)
export default Bibliographe
