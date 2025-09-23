import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useRouteLoaderData } from 'react-router'

import * as collaborating from '../components/collaborative/collaborating.js'
import { applicationConfig } from '../config.js'
import { useArticleRealTimeStore } from '../stores/articleStore.js'

const colors = [
  // navy
  '#70b8ff',
  // blue
  '#75bfff',
  // aqua
  '#7FDBFF',
  // teal
  '#39CCCC',
  // olive
  '#92d3b6',
  // green
  '#97e7a0',
  // yellow
  '#ffeb66',
  // orange
  '#ffbb80',
  // red
  '#ff726b',
  // maroon
  '#ff6666',
  // fuchsia
  '#f674d8',
  // purple
  '#e46ff6',
  // gray
  '#AAAAAA',
  // silver
  '#DDDDDD',
]

export function useCollaboration({ articleId, versionId }) {
  const { update: updateWriters } = useArticleRealTimeStore()
  const connectingRef = useRef(false)
  const [dynamicStyles, setDynamicStyles] = useState('')
  const [websocketStatus, setWebsocketStatus] = useState('')
  const [yText, setYText] = useState(null)
  const [awareness, setAwareness] = useState(null)
  const { websocketEndpoint } = applicationConfig
  const { user: activeUser } = useRouteLoaderData('app')

  const writerInfo = useMemo(
    () => ({
      id: activeUser._id,
      email: activeUser.email,
      displayName: activeUser.displayName,
      username: activeUser.username,
      color: colors[Math.floor(Math.random() * 14)],
    }),
    [activeUser?._id]
  )

  const handleWritersUpdated = useCallback(
    ({ states }) => {
      const writers = Object.fromEntries(states)
      updateWriters(writers)
      setDynamicStyles(
        Object.entries(writers)
          .map(([key, writer]) => {
            const color = writer?.user?.color ?? '#ccc'
            return `
.yRemoteSelection-${key} {
  background-color: ${color};
}
.yRemoteSelectionHead-${key} {
  border-left: ${color} solid 2px;
  border-top: ${color} solid 2px;
  border-bottom: ${color} solid 2px;
}`
          })
          .join('\n')
      )
    },
    [setDynamicStyles]
  )

  const handleWebsocketStatusUpdated = useCallback(
    (status) => {
      setWebsocketStatus(status)
    },
    [setWebsocketStatus]
  )

  useEffect(() => {
    if (connectingRef.current) {
      return
    }
    connectingRef.current = true
    const {
      awareness,
      doc: yDocument,
      wsProvider,
    } = collaborating.connect({
      roomName: articleId,
      websocketEndpoint,
      user: writerInfo,
      onChange: handleWritersUpdated,
      onStatusUpdated: handleWebsocketStatusUpdated,
    })
    const yText = yDocument.getText('main')
    setAwareness(awareness)
    setYText(yText)
    return () => {
      connectingRef.current = false
      awareness.destroy()
      if (wsProvider.wsconnected) {
        wsProvider.disconnect()
        wsProvider.destroy()
      }
    }
  }, [articleId, websocketEndpoint])

  return {
    websocketStatus,
    awareness,
    yText,
    dynamicStyles,
  }
}
