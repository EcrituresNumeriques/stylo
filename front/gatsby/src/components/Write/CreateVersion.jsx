import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { useDispatch } from 'react-redux'
import { Edit, Save, Plus, PlusSquare, SkipBack, ArrowLeft } from 'react-feather'

import styles from './createVersion.module.scss'
import buttonStyles from '../button.module.scss'
import Button from '../Button'
import Field from '../Field'

const CreateVersion = ({ articleId, readOnly }) => {
  const dispatch = useDispatch()

  // create a new version
  const [expandCreateForm, setExpandCreateForm] = useState(false)
  const [message, setMessage] = useState('')
  const createVersion = async (e, major = false) => {
    e.preventDefault()
    dispatch({ type: 'CREATE_NEW_ARTICLE_VERSION', articleId, message, major })
    setMessage('')
    setExpandCreateForm(false)
  }

  return (
    <div className={styles.container}>
      {!readOnly && <Button disabled={readOnly} onClick={(_) => setExpandCreateForm(true)}>
        Create new Version
      </Button>}
      {readOnly && <Link className={[buttonStyles.button, buttonStyles.secondary].join(' ')} to={`/article/${articleId}`}> <ArrowLeft/> Edit Mode</Link>}
      {expandCreateForm && (
        <form
          className={styles.createForm}
          onSubmit={(e) => createVersion(e, false)}
        >
          <Field
            className={styles.createVersionInput}
            placeholder="Label of the version"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
          />
          <ul className={styles.actions}>
            <li>
              <Button icon={true} onClick={(e) => setExpandCreateForm(false)}>
                Close
              </Button>
            </li>
            <li>
              <Button onClick={(e) => createVersion(e, false)}>
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
      )}
    </div>
  )
}

export default CreateVersion
