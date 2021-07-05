import React, { useCallback, useEffect, useRef, useState } from 'react'
import { connect, useDispatch } from 'react-redux'
import debounce from 'lodash/debounce'

import styles from './bibliographe.module.scss'
import etv from '../../../helpers/eventTargetValue'
import { getUserProfile } from '../../../helpers/userProfile'
import bib2key from './CitationsFilter'
import askGraphQL from '../../../helpers/graphQL'
import { fetchAllCollectionsPerLibrary, fetchBibliographyFromCollectionHref } from '../../../helpers/zotero'
import { toBibtex, validate } from '../../../helpers/bibtex'
import ReferenceTypeIcon from '../../ReferenceTypeIcon'
import Button from '../../Button'
import Field from '../../Field'

import { Check, Plus, Trash } from 'react-feather'
import Select from '../../Select'
import NavTag from '../../NavTab'

import BibliographyService from '../../../services/BibliographyService'

const mapStateToProps = ({ articleBib, articleBibTeXEntries, activeUser, applicationConfig }) => {
  return { articleBib, articleBibTeXEntries, activeUser, applicationConfig }
}

const mapDispatchToProps = (dispatch) => ({
  refreshProfile: (applicationConfig) =>
    getUserProfile(applicationConfig).then((response) =>
      dispatch({ type: 'PROFILE', ...response })
    ),
})

function ConnectedBibliographe (props) {
  const dispatch = useDispatch()
  const { backendEndpoint } = props.applicationConfig
  const defaultSuccess = (result) => console.log(result)
  const { refreshProfile } = props
  const success = props.success || defaultSuccess
  const [selector, setSelector] = useState('zotero')
  const [isSaving, setSaving] = useState(false)
  const [bib, setBib] = useState(props.articleBib)
  const [bibTeXEntries, setBibTeXEntries] = useState(props.articleBibTeXEntries)
  const [addCitation, setAddCitation] = useState('')
  const [citationValidationResult, setCitationValidationResult] = useState({
    valid: false,
  })
  const [rawBibTeXValidationResult, setRawBibTeXValidationResult] = useState({
    valid: false,
  })
  const [zoteroLink, setZoteroLink] = useState(props.article.zoteroLink || '')
  const [zoteroCollectionHref, setZoteroCollectionHref] = useState(null)
  const { zoteroToken } = props.activeUser
  const [zoteroCollections, setZoteroCollections] = useState({})
  const citationForm = useRef()
  const bibliographyService = new BibliographyService(props.activeUser._id, props.article._id, props.applicationConfig)

  useEffect(() => {
    if (zoteroToken) {
      setSaving(true)
      fetchAllCollectionsPerLibrary({ token: zoteroToken })
        .then(setZoteroCollections)
        .finally(() => setSaving(false))
    }
  }, [zoteroToken])

  const saveBibTeX = async (bib) => {
    await bibliographyService.saveBibTeX(bib)
    dispatch({ type: 'UPDATE_ARTICLE_BIB', bib })
    props.cancel()
  }

  const mergeCitations = () => {
    const newBibTeX = addCitation + '\n' + bib
    setBib(newBibTeX)

    const newBibTeXEntries = bib2key(addCitation)
    console.log({ newBibTeXEntries, bibTeXEntries })
    setBibTeXEntries(newBibTeXEntries.concat(bibTeXEntries))
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

  const removeCitation = (citations, indexToRemove) => {
    const filteredEntries = citations.filter((entry, index) => index !== indexToRemove)
    setBibTeXEntries(filteredEntries)

    // we reform the bibtex output based on what we were able to parse
    setBib(toBibtex(filteredEntries.map(({ entry }) => entry)))
  }

  const saveNewZotero = async () => {
    setSaving(true)

    // saveOnGraphQL
    if (props.article.zoteroLink !== zoteroLink) {
      try {
        console.log('Saving to graphQL', props.article.zoteroLink, zoteroLink)
        const query = `mutation($user:ID!,$article:ID!,$zotero:String!){zoteroArticle(article:$article,zotero:$zotero,user:$user){ _id zoteroLink}}`
        const variables = {
          zotero: zoteroLink,
          user: props.activeUser._id,
          article: props.article._id,
        }
        await askGraphQL(
          { query, variables },
          'updating zoteroLink',
          null,
          props.applicationConfig
        )
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
        setBib(bib)
        await saveBibTeX(bib)
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
      setBib(bib)
      await saveBibTeX(bib)
    } catch (err) {
      console.error(`Something went wrong while fetching bibliography from Zotero: ${collectionHref}`, err)
    } finally {
      setSaving(false)
    }
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
              onChange={(e) => setZoteroLink(etv(e))}
            />
            <Button
              type="submit"
              primary={true}
              onClick={() => saveNewZotero()}
              disabled={
                isSaving ||
                (!zoteroLink && zoteroLink === props.article.zoteroLink)
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
                      refreshProfile(props.applicationConfig)
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
          <textarea
            onChange={(event) => {
              setCitationValidationResult({
                valid: false
              })
              delayedValidateCitation(
                etv(event),
                setCitationValidationResult,
                setAddCitation
              )
            }}
            placeholder="Paste here the BibTeX of the citation you want to add"
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
              {bibTeXEntries.map((b, i) => (
                <tr
                  key={`citation-${b.key}-${i}`}
                  className={styles.citation}
                >
                  <td className={`icon-${b.type} ${styles.colIcon}`}>
                    <ReferenceTypeIcon type={b.type}/>
                  </td>
                  <th className={styles.colKey} scope="row">
                    @{b.key}
                  </th>
                  <td className={styles.colActions}>
                    <Button icon={true} onClick={() => removeCitation(bibTeXEntries, i)}>
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
                onClick={async () => {
                  await saveBibTeX(bib)
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
            <textarea
              wrap="off"
              defaultValue={bib}
              onChange={(event) => {
                setRawBibTeXValidationResult({ valid: false })
                delayedValidateCitation(
                  etv(event),
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
                onClick={async () => {
                  await saveBibTeX(bib)
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

const Bibliographe = connect(
  mapStateToProps,
  mapDispatchToProps
)(ConnectedBibliographe)

export default Bibliographe
