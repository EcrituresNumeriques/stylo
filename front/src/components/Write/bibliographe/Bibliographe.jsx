import React, { useCallback, useEffect, useRef, useState } from 'react'
import { shallowEqual, useDispatch, useSelector } from 'react-redux'
import debounce from 'lodash.debounce'
import { Check, Plus, Trash } from 'react-feather'

import styles from './bibliographe.module.scss'
import etv from '../../../helpers/eventTargetValue'
import { useProfile } from '../../../helpers/userProfile'
import { useGraphQL } from '../../../helpers/graphQL'
import { fetchAllCollectionsPerLibrary, fetchBibliographyFromCollectionHref } from '../../../helpers/zotero'
import { toBibtex, toEntries, validate } from '../../../helpers/bibtex'
import ReferenceTypeIcon from '../../ReferenceTypeIcon'
import Button from '../../Button'
import Field from '../../Field'

import Select from '../../Select'
import NavTag from '../../NavTab'

import { linkToZotero as query } from '../../Article.graphql'
import MonacoBibtexEditor from '../providers/monaco/BibtexEditor'

export default function Bibliographe({ article, cancel }) {
  const [selector, setSelector] = useState('zotero')
  const [isSaving, setSaving] = useState(false)
  const workingArticleBibliography = useSelector(state => state.workingArticle.bibliography, shallowEqual)
  const [bib, setBib] = useState(workingArticleBibliography.text)
  const [bibTeXEntries, setBibTeXEntries] = useState(workingArticleBibliography.entries)
  const [addCitation, setAddCitation] = useState('')
  const [citationValidationResult, setCitationValidationResult] = useState({ valid: false })
  const [rawBibTeXValidationResult, setRawBibTeXValidationResult] = useState({ valid: false })
  const [zoteroLink, setZoteroLink] = useState(article.zoteroLink || '')
  const [zoteroCollectionHref, setZoteroCollectionHref] = useState(null)
  const backendEndpoint = useSelector(state => state.applicationConfig.backendEndpoint)
  const zoteroToken = useSelector(state => state.activeUser.zoteroToken)
  const userId = useSelector(state => state.activeUser._id)
  const runQuery = useGraphQL()
  const [zoteroCollections, setZoteroCollections] = useState({})
  const citationForm = useRef()
  const dispatch = useDispatch()
  const refreshProfile = useProfile()

  useEffect(() => {
    if (zoteroToken) {
      setSaving(true)
      fetchAllCollectionsPerLibrary({ token: zoteroToken })
        .then(setZoteroCollections)
        .finally(() => setSaving(false))
    }
  }, [zoteroToken])

  const handleTabChange = useCallback((value) => setSelector(value), [])
  const handleCollectionChange = useCallback((event) => setZoteroCollectionHref(etv(event)), [])
  const handleZoteroLinkChange = useCallback((event) => setZoteroLink(etv(event)), [])

  const mergeCitations = () => {
    setBib(addCitation + '\n' + bib)
    const newBibTeXEntries = toEntries(addCitation)
    setBibTeXEntries([...newBibTeXEntries, ...bibTeXEntries])
    citationForm.current.reset()
  }

  const delayedValidateCitation = useCallback(
    debounce(
      (bibtex, setCitationValidationResult, next) =>
        validateCitation(bibtex, setCitationValidationResult, next),
      1000
    ),
    []
  )

  const validateCitation = (bibtex, setCitationValidationResult, next) => {
    next(bibtex)

    if (bibtex.trim() === '') {
      setCitationValidationResult({
        valid: false
      })
    } else {
      validate(bibtex).then((result) => {
        if (result.warnings.length || result.errors.length) {
          setCitationValidationResult({
            valid: false,
            messages: [...result.errors, ...result.warnings],
          })
        } else {
          setCitationValidationResult({
            valid: result.empty || result.success !== 0,
          })
        }
      })
    }
  }

  function handleRemove (indexToRemove) {
    const newBibTeXEntries = [...bibTeXEntries.slice(0, indexToRemove), ...bibTeXEntries.slice(indexToRemove + 1)];
    setBibTeXEntries(newBibTeXEntries)
    setBib(toBibtex(newBibTeXEntries.map(({ entry }) => entry)))
  }

  function saveBibTeXEntries (bibTeXEntries) {
    saveBibTeX(toBibtex(bibTeXEntries.map(({ entry }) => entry)))
  }

  function saveBibTeX (bibTeX) {
    dispatch({ type: 'UPDATE_WORKING_ARTICLE_BIBLIOGRAPHY', articleId: article._id, bibliography: bibTeX })
  }

  const saveNewZotero = async () => {
    setSaving(true)

    // saveOnGraphQL
    if (article.zoteroLink !== zoteroLink) {
      try {
        console.log('Saving to graphQL', article.zoteroLink, zoteroLink)
        const variables = {
          zotero: zoteroLink,
          user: userId,
          article: article._id,
        }
        await runQuery({ query, variables })
      } catch (err) {
        alert(err)
      } finally {
        setSaving(false)
      }
    }

    // we synchronize the collection, any time we save
    if (zoteroLink) {
      const collectionHref = `https://api.zotero.org/groups/${zoteroLink}`
      try {
        const result = await fetchBibliographyFromCollectionHref({ collectionHref })
        const bib = result.join('\n')
        saveBibTeX(bib)
        cancel()
      } catch (err) {
        console.error(`Something went wrong while fetching bibliography from Zotero: ${collectionHref}`, err)
      } finally {
        setSaving(false)
      }
    } else {
      // previous value was empty, and we tried to save an empty value again
      setSaving(false)
    }
  }

  const importCollection = async ({ token, collectionHref }) => {
    setSaving(true)
    try {
      const result = await fetchBibliographyFromCollectionHref({ token, collectionHref })
      const bib = result.join('\n')
      saveBibTeX(bib)
      cancel()
    } catch (err) {
      console.error(`Something went wrong while fetching bibliography from Zotero: ${collectionHref}`, err)
    } finally {
      setSaving(false)
    }
  }

  const zoteroCollectionSelect = (
    <Select onChange={handleCollectionChange}>
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
      <NavTag defaultValue={selector} onChange={handleTabChange} items={[
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
      }/>
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
              onChange={handleZoteroLinkChange}
            />
            <Button
              type="submit"
              primary={true}
              onClick={saveNewZotero}
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
          <hr/>
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
                      refreshProfile()
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

      {selector === 'citations' && (
        <form
          ref={citationForm}
          onSubmit={(e) => e.preventDefault() && mergeCitations()}
          className={styles.citations}
        >
          <MonacoBibtexEditor
            height="150px"
            onTextUpdate={(bibtex) => {
              setCitationValidationResult({ valid: false })
              delayedValidateCitation(
                bibtex,
                setCitationValidationResult,
                setAddCitation
              )
            }}
          />
          {citationValidationResult.messages && (
            <ul className={styles.citationMessages}>
              {citationValidationResult.messages.map((m) => (
                <li>{m}</li>
              ))}
            </ul>
          )}
          <ul className={styles.actions}>
            <li className={styles.actionsSubmit}>
              <Button
                primary={true}
                type="submit"
                disabled={citationValidationResult.valid !== true}
                onClick={() => mergeCitations()}
              >
                <Plus/> Add
              </Button>
            </li>
          </ul>

          <p>{bibTeXEntries.length} citations.</p>

          <div className={styles.responsiveTable}>
            <table className={styles.citationList}>
              <colgroup>
                <col className={styles.colIcon}/>
                <col className={styles.colKey}/>
                <col className={styles.colActions}/>
              </colgroup>
              <tbody>
              {bibTeXEntries.map((b, index) => (
                <tr
                  key={`citation-${b.key}-${index}`}
                  className={styles.citation}
                >
                  <td className={`icon-${b.type} ${styles.colIcon}`}>
                    <ReferenceTypeIcon type={b.type}/>
                  </td>
                  <th className={styles.colKey} scope="row">
                    @{b.key}
                  </th>
                  <td className={styles.colActions}>
                    <Button icon={true} onClick={() => handleRemove(index)}>
                      <Trash/>
                    </Button>
                  </td>
                </tr>
              ))}
              </tbody>
            </table>
          </div>

          <ul className={styles.actions}>
            <li className={styles.actionsSubmit}>
              <Button
                primary={true}
                onClick={() => {
                  saveBibTeXEntries(bibTeXEntries)
                  cancel()
                }}
                className={styles.primary}
              >
                <Check/>
                Save
              </Button>
            </li>
          </ul>
        </form>
      )}

      {selector === 'raw' && (
        <form onSubmit={(e) => e.preventDefault()}>
          <div className={styles.raw}>
            <MonacoBibtexEditor
              text={bib}
              onTextUpdate={(bibtex) => {
                setRawBibTeXValidationResult({ valid: false })
                delayedValidateCitation(
                  bibtex,
                  setRawBibTeXValidationResult,
                  setBib
                )
              }}
            />
          </div>
          {rawBibTeXValidationResult.messages && (
            <ul className={styles.citationMessages}>
              {rawBibTeXValidationResult.messages.map((m) => (
                <li>{m}</li>
              ))}
            </ul>
          )}

          <ul className={styles.actions}>
            <li className={styles.actionsSubmit}>
              <Button
                primary={true}
                disabled={rawBibTeXValidationResult.valid !== true}
                onClick={() => {
                  saveBibTeX(bib)
                  cancel()
                }}
                className={styles.primary}
              >
                <Check/>
                Save
              </Button>
            </li>
          </ul>
        </form>
      )}
    </article>
  )
}
