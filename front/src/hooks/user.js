import { useCallback } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useGraphQLClient } from '../helpers/graphQL.js'
import { applicationConfig } from '../config.js'
import { generatePath } from 'react-router'

import { setAuthToken as setAuthTokenMutation } from '../components/Credentials.graphql'

export function useActiveUserId() {
  return useSelector((state) => state.activeUser._id)
}

export function useSetAuthToken(service) {
  const dispatch = useDispatch()
  const { query } = useGraphQLClient()
  const { backendEndpoint, frontendEndpoint } = applicationConfig

  const link = useCallback(async function handleSetAuthToken() {
    const popup = window.open(
      `${backendEndpoint}/login/${service}?returnTo=${frontendEndpoint}${generatePath(
        `/credentials/auth-callback/:service`,
        { service }
      )}`,
      `auth-${service}`,
      'width=660&height=360&menubar=0&toolbar=0'
    )

    async function handleSave({ data, type, source }) {
      if (source === popup && type === 'message' && data) {
        const reduxAction = JSON.parse(data)

        // optimistic update
        await dispatch(reduxAction)
        query({
          query: setAuthTokenMutation,
          variables: { service: reduxAction.service, token: reduxAction.token },
        })
      }
    }

    window.addEventListener('message', handleSave)
    popup.addEventListener('beforeunload', () =>
      window.removeEventListener('message', handleSave)
    )
  }, [])

  const unlink = useCallback(async () => {
    const variables = { service: 'zotero', token: null }
    await dispatch({ type: 'SET_AUTH_TOKEN', ...variables })
    await query({ query: setAuthTokenMutation, variables })
  }, [])

  return { link, unlink }
}
