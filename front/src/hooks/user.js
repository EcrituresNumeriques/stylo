import { useCallback, useState, useSyncExternalStore } from 'react'
import { useTranslation } from 'react-i18next'
import { useRevalidator, useRouteLoaderData } from 'react-router'

import { applicationConfig } from '../config.js'
import { useGraphQLClient } from '../helpers/graphQL.js'
import {
  forgetAccountPreferences,
  getPreferences,
  setPreference,
  subscribe,
} from '../helpers/preferences.js'
import { getSessionToken, removeSessionToken } from '../helpers/sessionToken.js'
import {
  deleteAccount as deleteAccountMutation,
  logoutMutation,
  unsetAuthTokenMutation,
} from './Credentials.graphql'
import useFetchData, { useMutateData } from './graphql.js'
import { createTag, getTags, updateTag } from './Tag.graphql'

/**
 * @returns {string|null}
 */
export function useActiveUserId() {
  const { user } = useRouteLoaderData('app')
  return user?.id
}

/**
 * Préférence conservée dans le localStorage.
 *
 * @param {string} key
 * @param {'article' | 'user' | 'export' | 'corpus' } namespace
 * @returns {{ value: string|boolean|number, setValue: (value: string|boolean|number) => void, toggleValue: () => void }}
 */
export function usePreferenceItem(key, namespace = 'article') {
  const value = useSyncExternalStore(
    subscribe,
    () => getPreferences(namespace)[key]
  )

  return {
    value,
    setValue(value) {
      setPreference(namespace, key, value)
    },
    toggleValue() {
      setPreference(namespace, key, !getPreferences(namespace)[key])
    },
  }
}

/**
 *
 * @param {'humanid' | 'hypothesis' | 'zotero' } service
 * @returns {{ link: React.EffectCallback, token: string | undefined, id: string | undefined, isLinked: boolean, error: string, unlink: React.EffectCallback }}
 */
export function useSetAuthToken(service) {
  const { revalidate } = useRevalidator()
  const { user } = useRouteLoaderData('app')
  const { query } = useGraphQLClient()
  const [error, setError] = useState('')
  const { backendEndpoint, frontendEndpoint } = applicationConfig

  const { token, id } = user?.authProviders?.[service] ?? {}
  const isLinked = id ?? token

  const link = useCallback(async function handleSetAuthToken() {
    setError('')
    const popup = window.open(
      `${backendEndpoint}/authorize/${service}?returnTo=${frontendEndpoint}/credentials/auth-callback/${service}`,
      `auth-${service}`,
      'width=660&height=360&menubar=0&toolbar=0'
    )

    async function handleClose({ data, type, source }) {
      if (source === popup && type === 'message' && data) {
        revalidate()
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
      await query({
        query: unsetAuthTokenMutation,
        variables: { service },
      })
      revalidate()
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
    })
    await mutate(
      async (data) => ({
        user: {
          tags: data.user.tags.map((tag) => {
            return tag.id === result.updateTag.id ? result.updateTag : tag
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

  return useCallback(async () => {
    try {
      await query({ query: logoutMutation })
    } catch (err) {
      // the user must be logged out locally even if the server session
      // could not be destroyed (network error, server unavailable…)
      console.error('Unable to destroy the server session on logout', err)
    } finally {
      removeSessionToken()
      forgetAccountPreferences()
    }
  }, [])
}

/**
 * @typedef {object} User
 * @property {boolean?} deletedAt
 * @property {string?} displayName
 * @property {string} username
 */

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

export function useAccount() {
  const { query } = useGraphQLClient()

  async function deleteAccount() {
    const result = await query({ query: deleteAccountMutation })
    return result.deleteAccount === true
  }

  async function download({
    scope = 'mine',
    versions = 'latest',
    format = 'zip',
    workspaceId,
  } = {}) {
    const sessionToken = getSessionToken()
    const response = await fetch(
      applicationConfig.backendEndpoint + '/backup',
      {
        method: 'POST',
        mode: 'cors',
        credentials: 'omit',
        headers: {
          'Content-Type': 'application/json',
          ...(sessionToken ? { Authorization: `Bearer ${sessionToken}` } : {}),
        },
        body: JSON.stringify({ scope, versions, format, workspaceId }),
      }
    )

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message ?? 'Backup request failed')
    }

    const filename = format === 'zip' ? 'backup.zip' : 'backup.json'
    const blob = await response.blob()
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    a.click()
    URL.revokeObjectURL(url)
  }

  return { download, deleteAccount }
}
