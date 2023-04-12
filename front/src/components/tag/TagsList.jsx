import React, { createRef, useCallback, useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'

import styles from '../articles.module.scss'
import ArticleTag from '../Tag.jsx'
import Button from '../Button.jsx'
import Modal from '../Modal.jsx'
import CreateTag from '../CreateTag.jsx'
import { getTags } from '../Tag.graphql'
import { useGraphQL } from '../../helpers/graphQL.js'

export default function TagsList () {
  const dispatch = useDispatch()
  const [creatingTag, setCreatingTag] = useState(false)
  const handleCloseCreatingTag = useCallback(() => setCreatingTag(false), [])
  const [tags, setTags] = useState([])
  const selectedTagIds = useSelector(state => state.activeUser.selectedTagIds)
  const latestTagCreated = useSelector(state => state.latestTagCreated)
  const runQuery = useGraphQL()

  useEffect(() => {
    setCreatingTag(false)
    // Self invoking async function
    ;(async () => {
      try {
        const { user: { tags } } = await runQuery({ query: getTags, variables: {} })
        setTags(tags)
      } catch (err) {
        alert(err)
      }
    })()
  }, [latestTagCreated])

  const tagNameField = createRef()
  useEffect(() => {
    if (tagNameField.current) {
      tagNameField.current.focus() // give focus to the first form input
    }
  }, [tagNameField])

  const handleTagSelected = useCallback((event) => {
    const { id } = event.target.dataset
    dispatch({ type: 'UPDATE_SELECTED_TAG', tagId: id })
  }, [selectedTagIds])

  return (<>
    <ul className={styles.filterByTags}>
      {tags.map((t) => (
        <li key={`filterTag-${t._id}`}>
          <ArticleTag
            tag={t}
            name={`filterTag-${t._id}`}
            onClick={handleTagSelected}
            disableAction={false}
          />
        </li>
      ))}
      <li>
        <Button className={styles.createTagButton} onClick={() => setCreatingTag(true)}>add more tags&hellip;</Button>
      </li>
    </ul>
    {creatingTag && (
      <Modal title="New tag" cancel={handleCloseCreatingTag}>
        <CreateTag ref={tagNameField}/>
      </Modal>
    )}
  </>)
}
