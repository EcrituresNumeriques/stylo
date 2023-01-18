import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { useDispatch } from 'react-redux'
import { ArrowLeft } from 'react-feather'

import styles from './createVersion.module.scss'
import buttonStyles from '../button.module.scss'
import Button from '../Button'
import Field from '../Field'

const CreateVersion = ({ articleId, readOnly, onClose }) => {
  const dispatch = useDispatch()

  // create a new version
  const [message, setMessage] = useState('')
  const createVersion = async (e, major = false) => {
    e.preventDefault()
    dispatch({ type: 'CREATE_NEW_ARTICLE_VERSION', articleId, message, major })
    setMessage('')
  }

  return (
    <div className={styles.container}>
      {readOnly && <Link className={[buttonStyles.button, buttonStyles.secondary].join(' ')} to={`/article/${articleId}`}> <ArrowLeft/> Edit Mode</Link>}
        <form
          className={styles.createForm}
          onSubmit={(e) => createVersion(e, false)}
        >
          <Field
            className={styles.createVersionInput}
            placeholder="Label of the version (optional)"
            value={message}
            autoFocus={true}
            onChange={(e) => setMessage(e.target.value)}
          />
          <ul className={styles.actions}>
            <li className={styles.closeButton}>
              <Button icon={true} onClick={onClose}>
                Close
              </Button>
            </li>
            <li>
              <Button primary={true}>
                Create Minor
              </Button>
            </li>
            <li>
              <Button onClick={(e) => createVersion(e, true)}>
                Create Major
              </Button>
            </li>
          </ul>
        </form>
    </div>
  )
}

export default CreateVersion
