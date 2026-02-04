import useSWR from 'swr'

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
 *
 * @param {string} path
 * @param {any?} payload
 * @param {import('swr').SWRConfiguration} [swrOptions]
 * @returns {import('swr').SWRResponse}
 */
function useNakalaApi(path, payload = undefined, swrOptions = {}) {
  return useSWR({ url: `/nakala/${path}`, payload }, jsonFetcher, {
    fallbackData: {},
    ...swrOptions,
  })
}

/**
 * @param {string} scope
 * @param {any} payload
 * @param {import('swr').SWRConfiguration} [swrOptions]
 * @returns {{isLoading: boolean, data: any, error: any}}
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
