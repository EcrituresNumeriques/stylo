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
 * Transforms a raw Nakala search record into a data object.
 *
 * @param {Object} record - A raw data record from the Nakala search API.
 * @param {Array<{propertyUri: string, value: *}>} record.metas - Metadata entries.
 * @param {Array<{role: string, name: string}>} record.rights - Access rights, used to extract the owner.
 * @param {string} record.creDate - Creation date of the record.
 * @param {string} record.status - Publication status (e.g. "published", "pending").
 * @param {string} record.identifier - Unique Nakala identifier.
 * @returns {{name: string, type: string, metas: Array, createdAt: string, status: string, identifier: string, creatorName: string}}
 */
function toSearchCollectionData(record) {
  const name = record.metas.find(
    (m) => m.propertyUri === 'http://nakala.fr/terms#title'
  )?.value
  const type = record.metas.find(
    (m) => m.propertyUri === 'http://nakala.fr/terms#type'
  )?.value
  const creatorName = record.rights.find((r) => r.role === 'ROLE_OWNER')?.name
  return {
    name,
    type,
    metas: record.metas,
    createdAt: record.creDate,
    status: record.status,
    identifier: record.identifier,
    creatorName,
  }
}

/**
 * Hook to fetch data records belonging to a specific Nakala collection.
 *
 * @param {Object} query - Query parameters.
 * @param {string} [query.collectionIdentifier] - The Nakala collection identifier. When undefined, the request is not executed.
 * @param {import('swr').SWRConfiguration} [swrOptions={}] - SWR configuration options.
 * @returns {{isLoading: boolean, total: number|undefined, records: Array|undefined, error: *}}
 */
export function useNakalaSearchCollectionDatas(query, swrOptions = {}) {
  const { collectionIdentifier } = query
  const path = collectionIdentifier
    ? `search?fq=scope=data;collection=${collectionIdentifier}`
    : undefined
  const { data, isLoading, error } = useNakalaApi(path, undefined, swrOptions)
  return {
    isLoading,
    total: data?.totalResults,
    records: data?.datas?.map(toSearchCollectionData),
    error,
  }
}

/**
 * Transforms a raw Nakala search record into a collection object.
 *
 * @param {Object} record - A raw collection record from the Nakala search API.
 * @param {Array<{propertyUri: string, value: *}>} record.metas - Metadata entries.
 * @param {Array<{role: string, name: string}>} record.rights - Access rights, used to extract the owner.
 * @param {string} record.uri - Collection URI.
 * @param {string} record.creDate - Creation date of the collection.
 * @param {string} record.status - Publication status (e.g. "published", "pending").
 * @param {string} record.identifier - Unique Nakala identifier.
 * @returns {{name: string, createdAt: string, status: string, identifier: string, creatorName: string}}
 */
function toSearchCollection(record) {
  const name = record.metas.find(
    (m) => m.propertyUri === 'http://nakala.fr/terms#title'
  )?.value
  const creatorName = record.rights.find((r) => r.role === 'ROLE_OWNER')?.name
  return {
    name,
    uri: record.uri,
    createdAt: record.creDate,
    status: record.status,
    identifier: record.identifier,
    creatorName,
  }
}

/**
 * Hook to search for Nakala collections owned by or accessible to a given user.
 *
 * @param {Object} query - Query parameters.
 * @param {string} query.scope - The search scope filter (e.g. "owner", "share").
 * @param {string} query.humanid - The humanID of the user.
 * @param {import('swr').SWRConfiguration} [swrOptions={}] - SWR configuration options.
 * @returns {{isLoading: boolean, total: number|undefined, records: Array|undefined, error: *}}
 */
export function useNakalaSearchCollections(query, swrOptions = {}) {
  const { scope, humanid } = query
  const { data, isLoading, error } = useNakalaApi(
    `search?fq=scope=collection;${scope}=${humanid}`,
    undefined,
    swrOptions
  )
  return {
    isLoading,
    total: data?.totalResults,
    records: data?.datas?.map(toSearchCollection),
    error,
  }
}

export function getCollectionIdentifier(collectionUri) {
  const url = URL.parse(collectionUri)
  return url?.pathname?.replace(/^\/collection\//, '')
}
