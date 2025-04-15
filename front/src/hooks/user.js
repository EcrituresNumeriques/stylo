import { useCallback, useMemo } from 'react'
import { useDispatch, useSelector } from 'react-redux'

import {
  getFullUserProfile,
  unsetAuthTokenMutation,
  logoutMutation,
} from '../components/Credentials.graphql'
import { getTags, createTag } from '../components/Tag.graphql'

import useFetchData, { useMutateData } from './graphql.js'
import { useGraphQLClient } from '../helpers/graphQL.js'
import { applicationConfig } from '../config.js'

export function useActiveUserId() {
  return useSelector((state) => state.activeUser?._id)
}

export function useSetAuthToken(service) {
  const dispatch = useDispatch()
  const { query } = useGraphQLClient()
  const { backendEndpoint, frontendEndpoint } = applicationConfig

  const token = useSelector(
    (state) => state.activeUser.authProviders?.[service]?.token
  )

  const id = useSelector(
    (state) => state.activeUser.authProviders?.[service]?.id
  )

  const isLinked = useMemo(() => id ?? token, [id, token])

  const link = useCallback(async function handleSetAuthToken() {
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
    const { unsetAuthToken } = await query({
      query: unsetAuthTokenMutation,
      variables: { service },
    })

    dispatch({ type: 'UPDATE_ACTIVE_USER_DETAILS', payload: unsetAuthToken })
  }, [])

  return { link, unlink, token, id, isLinked }
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

export function useProfile() {
  const dispatch = useDispatch()

  return useFetchData(
    { query: getFullUserProfile },
    {
      revalidateIfStale: true,
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      suspense: true,
      onSuccess({ user }) {
        dispatch({
          type: 'PROFILE',
          user,
        })
      },
    }
  )
}

export function useLogout() {
  const dispatch = useDispatch()
  const { query } = useGraphQLClient()
  const { mutate } = useMutateData({ query: getFullUserProfile })

  return useCallback(async () => {
    await mutate({ user: null })
    await query({ query: logoutMutation })

    dispatch({ type: 'LOGOUT' })
  }, [])
}
