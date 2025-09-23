import { useCallback, useMemo, useState } from 'react'
import { useRouteLoaderData } from 'react-router'

import { applicationConfig } from '../config.js'
import { useGraphQLClient } from '../helpers/graphQL.js'
import { useAuthStore } from '../stores/authStore.js'
import useFetchData, { useMutateData } from './graphql.js'

import {
  logoutMutation,
  unsetAuthTokenMutation,
} from '../components/Credentials.graphql'
import { createTag, getTags, updateTag } from '../components/Tag.graphql'

/**
 * @returns {string|null}
 */
export function useActiveUserId() {
  const { user } = useRouteLoaderData('app')
  return user?._id
}

/**
 *
 * @param {'humanid' | 'hypothesis' | 'zotero' } service
 * @returns {{ link: React.EffectCallback, token: string | undefined, id: string | undefined, isLinked: boolean, error: string, unlink: React.EffectCallback }}
 */
export function useSetAuthToken(service) {
  const { query } = useGraphQLClient()
  const [error, setError] = useState('')
  const { backendEndpoint, frontendEndpoint } = applicationConfig

  const { user } = useRouteLoaderData('app')
  const token = user?.authProviders?.[service]?.token
  const id = user?.authProviders?.[service]?.id
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
          // FIXME Use SWR to update active user
          /*
          dispatch({
            type: 'UPDATE_ACTIVE_USER_DETAILS',
            payload: {
              authProviders,
            },
          })*/
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

      // FIXME Use SWR to update active user
      /*
      dispatch({ type: 'UPDATE_ACTIVE_USER_DETAILS', payload: unsetAuthToken })
      */
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
  const { query } = useGraphQLClient()
  const { logout } = useAuthStore()

  return useCallback(async () => {
    await query({ query: logoutMutation })
    logout()
  }, [])
}
