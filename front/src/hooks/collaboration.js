import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { shallowEqual, useDispatch, useSelector } from 'react-redux'
import * as collaborating from '../components/collaborative/collaborating.js'
import { applicationConfig } from '../config.js'

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
  const connectingRef = useRef(false)
  const [dynamicStyles, setDynamicStyles] = useState('')
  const [websocketStatus, setWebsocketStatus] = useState('')
  const [yText, setYText] = useState(null)
  const [awareness, setAwareness] = useState(null)
  const { websocketEndpoint } = applicationConfig
  const activeUser = useSelector(
    (state) => ({
      _id: state.activeUser._id,
      email: state.activeUser.email,
      displayName: state.activeUser.displayName,
      username: state.activeUser.username,
    }),
    shallowEqual
  )
  const dispatch = useDispatch()

  const writerInfo = useMemo(
    () => ({
      id: activeUser._id,
      email: activeUser.email,
      displayName: activeUser.displayName,
      username: activeUser.username,
      color: colors[Math.floor(Math.random() * 14)],
    }),
    [activeUser]
  )

  const handleWritersUpdated = useCallback(
    ({ states }) => {
      const writers = Object.fromEntries(states)
      dispatch({ type: 'UPDATE_ARTICLE_WRITERS', articleWriters: writers })
      setDynamicStyles(
        Object.entries(writers)
          .map(([key, writer]) => {
            const color = writer.user.color
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
  }, [articleId, websocketEndpoint, writerInfo])

  return {
    websocketStatus,
    awareness,
    yText,
    dynamicStyles,
  }
}
