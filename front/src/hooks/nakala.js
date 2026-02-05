/**
 * @file Custom hooks for interacting with the Nakala API.
 * @module hooks/nakala
 * @description This module provides SWR-based React hooks for fetching
 * data from the Nakala API (user data and collections).
 */
import useSWR from 'swr'

/**
 * JSON fetcher for Nakala API requests.
 *
 * @param {Object} params - Request parameters.
 * @param {string} params.url - The request URL.
 * @param {Object} [params.payload] - The payload for POST requests (optional).
 * @returns {Promise<Object>} The JSON response from the API.
 */
function jsonFetcher({ url, payload }) {
  console.log(url, payload)
  return fetch(url, {
    method: payload ? 'POST' : 'GET',
    cache: 'no-cache',
    headers: {
      'Cache-Control': 'no-cache',
      accept: 'application/json',
      'Content-Type': 'application/json',
    },
  }).then((response) => response.json())
}

/**
 * Internal hook for making requests to the Nakala API.
 *
 * @param {string} path - The API endpoint path (without the `/nakala/` prefix).
 * @param {Object} [payload] - The payload for POST requests (optional).
 * @param {import('swr').SWRConfiguration} [swrOptions={}] - SWR configuration options.
 * @returns {import('swr').SWRResponse} The SWR response containing data, error, isLoading, etc.
 */
function useNakalaApi(path, payload = undefined, swrOptions = {}) {
  const key = () => {
    console.log({ path, payload })
    if (path === undefined) {
      throw new Error('Missing required value')
    }
    return { url: `/nakala/${path}`, payload }
  }
  return useSWR(key, jsonFetcher, {
    fallbackData: {},
    ...swrOptions,
  })
}

/**
 * Hook for fetching user data from Nakala.
 *
 * @param {string} scope - The scope identifier for filtering user data.
 * @param {Object} [payload] - The payload for the request (optional).
 * @param {import('swr').SWRConfiguration} [swrOptions={}] - SWR configuration options.
 * @returns {Object} The response object.
 * @returns {boolean} returns.isLoading - Whether the request is in progress.
 * @returns {number} returns.total - The total number of records.
 * @returns {Array} returns.records - The array of data records.
 * @returns {Error} returns.error - The error object if the request failed.
 */
export function useNakalaUsersData(scope, payload, swrOptions = {}) {
  const { data, isLoading, error } = useNakalaApi(
    `users/datas/${scope}`,
    payload,
    swrOptions
  )
  return {
    isLoading,
    total: data?.totalRecords,
    records: data?.data,
    error,
  }
}

export function useNakalaCollectionData(identifier, swrOptions = {}) {
  const { data, isLoading, error } = useNakalaApi(
    identifier ? `collections/${identifier}/datas` : undefined,
    undefined,
    swrOptions
  )
  return {
    isLoading,
    total: data?.total,
    records: data?.data,
    error,
  }
}

/**
 * Hook for fetching user collections from Nakala.
 *
 * @param {string} scope - The scope identifier for filtering collections.
 * @param {Object} [payload] - The payload for the request (optional).
 * @param {import('swr').SWRConfiguration} [swrOptions={}] - SWR configuration options.
 * @returns {Object} The response object.
 * @returns {boolean} returns.isLoading - Whether the request is in progress.
 * @returns {number} returns.total - The total number of collections.
 * @returns {Array} returns.records - The array of collection records.
 * @returns {Error} returns.error - The error object if the request failed.
 */
export function useNakalaUserCollection(scope, payload, swrOptions = {}) {
  const { data, isLoading, error } = useNakalaApi(
    `users/collections/${scope}`,
    payload,
    swrOptions
  )
  return {
    isLoading,
    total: data?.totalRecords,
    records: data?.data?.map(toCollection),
    error,
  }
}

function toCollection(record) {
  const name = record.metas.find(
    (r) => r.propertyUri === 'http://nakala.fr/terms#title'
  )?.value

  return {
    name,
    createdAt: record.creDate,
    status: record.status,
    identifier: record.identifier,
    creatorName: `${record.owner.givenname} ${record.owner.surname}`,
  }
}
