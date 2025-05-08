import { useCallback, useMemo, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'

import {
  unsetAuthTokenMutation,
  logoutMutation,
} from '../components/Credentials.graphql'
import { getTags, createTag } from '../components/Tag.graphql'

import { useMutateData } from './graphql.js'
import { useGraphQLClient } from '../helpers/graphQL.js'
import { applicationConfig } from '../config.js'

export function useActiveUserId() {
  return useSelector((state) => state.activeUser?._id)
}

/**
 * @typedef {import('redux').Dispatch} Dispatch
 */

/**
 *
 * @param {string} key
 * @param {'article' | 'user' | 'export'} namespace
 * @returns {{ value: string|boolean|number, setValue: Dispatch, toggleValue: Dispatch }}
 */
export function usePreferenceItem(key, namespace = 'article') {
  const dispatch = useDispatch()
  const value = useSelector((state) => state[`${namespace}Preferences`]?.[key])

  const ns = namespace.toUpperCase()

  return {
    value,
    /**
     * @param {boolean | undefined} value
     */
    setValue(value) {
      dispatch({ type: `SET_${ns}_PREFERENCES`, key, value })
    },
    toggleValue() {
      dispatch({ type: `${ns}_PREFERENCES_TOGGLE`, key })
    },
  }
}

/**
 *
 * @param {'humanid' | 'hypothesis' | 'zotero' } service
 * @returns {{ link: React.EffectCallback, token: string | undefined, id: string | undefined, isLinked: boolean, error: string, unlink: React.EffectCallback }}
 */
export function useSetAuthToken(service) {
  const dispatch = useDispatch()
  const { query } = useGraphQLClient()
  const [error, setError] = useState('')
  const { backendEndpoint, frontendEndpoint } = applicationConfig

  const token = useSelector(
    (state) => state.activeUser.authProviders?.[service]?.token
  )

  const id = useSelector(
    (state) => state.activeUser.authProviders?.[service]?.id
  )

  const isLinked = useMemo(() => id ?? token, [id, token])

  const link = useCallback(async function handleSetAuthToken() {
    setError('')
    const popup = window.open(
      `${backendEndpoint}/authorize/${service}?returnTo=${frontendEndpoint}/credentials/auth-callback/${service}`,
      `auth-${service}`,
      'width=660&height=360&menubar=0&toolbar=0'
    )

    async function handleClose({ data, type, source }) {
      if (source === popup && type === 'message' && data) {
        const authProviders = JSON.parse(data ?? '')

        if (authProviders) {
          dispatch({
            type: 'UPDATE_ACTIVE_USER_DETAILS',
            payload: {
              authProviders,
            },
          })
        }

        popup.close()
      }
    }

    window.addEventListener('message', handleClose)
    popup.addEventListener('beforeunload', () =>
      window.removeEventListener('message', handleClose)
    )
  }, [])

  const unlink = useCallback(async () => {
    try {
      setError('')
      const { unsetAuthToken } = await query({
        query: unsetAuthTokenMutation,
        variables: { service },
      })

      dispatch({ type: 'UPDATE_ACTIVE_USER_DETAILS', payload: unsetAuthToken })
    } catch (error) {
      setError(error.messages.at(0).extensions.type)
    }
  }, [])

  return { link, unlink, token, id, isLinked, error }
}

export function useUserTagActions() {
  const { query } = useGraphQLClient()
  const { mutate } = useMutateData({
    query: getTags,
    variables: {},
  })
  const create = async (tag) => {
    const result = await query({
      query: createTag,
      variables: tag,
      type: 'mutation',
    })
    await mutate(async (data) => ({
      user: {
        tags: [...data.user.tags, result.createTag],
      },
    }))
  }

  return {
    create,
  }
}

export function useLogout() {
  const dispatch = useDispatch()
  const { query } = useGraphQLClient()

  return useCallback(async () => {
    await query({ query: logoutMutation })

    dispatch({ type: 'LOGOUT' })
  }, [])
}
