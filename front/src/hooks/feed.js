import useSWRImmutable from 'swr/immutable'

/**
 *
 * @param {string} url
 * @returns {Promise<HTMLElement[]>}
 */
const fetcher = (url) =>
  fetch(url, {
    method: 'GET',
    credentials: 'omit',
    headers: {
      'Content-Type': 'text/xml',
      Accept: 'text/xml, application/xml',
    },
  })
    .then((res) => res.text())
    .then((text) => new DOMParser().parseFromString(text, 'text/xml'))
    .then((feed) => Array.from(feed.querySelectorAll('entry')))

export function useFeed(url) {
  return useSWRImmutable(url, fetcher)
}
