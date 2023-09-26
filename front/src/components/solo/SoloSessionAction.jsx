import { Dot, useToasts } from '@geist-ui/core'
import PropTypes from 'prop-types'
import React, { useCallback } from 'react'
import { Edit3 } from 'react-feather'
import { useHistory } from 'react-router-dom'
import { useMutation } from '../../hooks/graphql.js'
import Button from '../Button.jsx'

import { startSoloSession } from './SoloSession.graphql'

export default function SoloSessionAction ({ collaborativeSession, soloSession, articleId }) {
  const { setToast } = useToasts()
  const history = useHistory()
  const mutation = useMutation()

  const handleStartSoloEditing = useCallback(async () => {
    // try to start a collaborative editing
    if (soloSession && soloSession.id) {
      // join existing solo session
      history.push(`/article/${articleId}`)
    } else {
      // start a new solo session
      try {
        await mutation({ query: startSoloSession, variables: { articleId } })
        history.push(`/article/${articleId}`)
      } catch (err) {
        if (err && err.messages && err.messages.length > 0 && err.messages[0].extensions && err.messages[0].extensions.type === 'UNAUTHORIZED_SOLO_SESSION_ACTIVE') {
          // already exists
          history.push(`/article/${articleId}`)
        } else {
          setToast({
              type: 'error',
              text: `Unable to start a solo session: ${err.toString()}`
            }
          )
        }
      }
    }
  }, [soloSession])

  if (collaborativeSession) {
    return <></>
  }

  return (
    <>
      <Button title="Edit article" primary={true} onClick={handleStartSoloEditing}>
        <Edit3/>
        {soloSession && <Dot type="error"/>}
      </Button>
    </>
  )
}

SoloSessionAction.propTypes = {
  articleId: PropTypes.string.isRequired,
  soloSession: PropTypes.shape({
    id: PropTypes.string
  }),
  collaborativeSession: PropTypes.shape({
    id: PropTypes.string
  })
}
