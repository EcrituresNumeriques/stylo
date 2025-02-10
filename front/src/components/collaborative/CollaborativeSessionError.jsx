import React from 'react'
import { Text, Code } from '@geist-ui/core'
import { useParams } from 'react-router'
import ErrorMessageCard from '../ErrorMessageCard.jsx'

export default function CollaborativeSessionError({ error }) {
  const { sessionId: collaborativeSessionId } = useParams()

  if (error === 'notFound') {
    return (
      <ErrorMessageCard title="Important">
        <Text>
          This collaborative session <Code>{collaborativeSessionId}</Code> has
          ended.
        </Text>
        <Text>Please start a new one.</Text>
      </ErrorMessageCard>
    )
  }
  return (
    <ErrorMessageCard title="Error">
      <Text>Unexpected error!</Text>
    </ErrorMessageCard>
  )
}
