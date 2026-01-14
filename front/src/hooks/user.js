import { useCallback, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useDispatch, useSelector } from 'react-redux'
import { useRouteLoaderData } from 'react-router'

import { applicationConfig } from '../config.js'
import { useGraphQLClient } from '../helpers/graphQL.js'
import useFetchData, { useMutateData } from './graphql.js'

import { logoutMutation, unsetAuthTokenMutation } from './Credentials.graphql'
import { createTag, getTags, updateTag } from './Tag.graphql'

/**
 * @returns {string|null}
 */
export function useActiveUserId() {
  const { user } = useRouteLoaderData('app')
  return user?._id
}

/**
 * @typedef {import('redux').Dispatch} Dispatch
 */

/**
 *
 * @param {string} key
 * @param {'article' | 'user' | 'export' | 'corpus' } namespace
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
    await mutate(
      async (data) => {
        const tags = data?.user?.tags ?? []
        return {
          user: {
            tags: [...tags, result.createTag],
          },
        }
      },
      { revalidate: false }
    )
    return result.createTag
  }
  const update = async (tag) => {
    const result = await query({
      query: updateTag,
      variables: tag,
      type: 'mutation',
    })
    await mutate(
      async (data) => ({
        user: {
          tags: data.user.tags.map((tag) => {
            return tag._id === result.updateTag._id ? result.updateTag : tag
          }),
        },
      }),
      { revalidate: false }
    )
    return result.updateTag
  }

  return {
    create,
    update,
  }
}

export function useUserTags() {
  const { data, error, isLoading } = useFetchData({
    query: getTags,
    variables: {},
  })

  const tags = data?.user?.tags || []
  return {
    tags,
    error,
    isLoading,
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

/**
 * @returns {(user: User) => string}
 */
export function useDisplayName() {
  const { t } = useTranslation()

  return function displayName(user = {}) {
    if (user.deletedAt) {
      return t('user.account.isDeleted.displayName')
    }

    return user.displayName || user.username
  }
}
