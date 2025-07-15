import useSWR from 'swr';
import useSWRImmutable from 'swr/immutable'

/**
 *
 * @param {string} url
 * @returns {Promise<HTMLElement[]>}
 */
function fetcher (url) {
  return fetch(url, {
    method: 'GET',
    headers: {
      'Content-Type': 'text/xml',
      Accept: 'text/xml, application/xml',
    },
  })
    .then((res) => res.text())
    .then((text) => new DOMParser().parseFromString(text, 'text/xml'))
    .then((feed) => Array.from(feed.querySelectorAll('entry')))
}

function jsonFetcher (...args) {
  return fetch(...args, {
    method: 'GET',
    cache: 'no-cache',
    headers: {
      'Cache-Control': 'no-cache'
    }
  }).then(response => response.json())
}

export function useFeed(url) {
  return useSWRImmutable(url, fetcher, {
    fallbackData: [],
    revalidateOnMount: true,
  })
}

export function useDiscourseFeed(url) {
  return useSWR(url, jsonFetcher, {
    fallbackData: {
    }
  })
}
