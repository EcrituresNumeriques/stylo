// Documentation https://isidore.science/api

/**
 * Search a vocabulary from the Isidore API.
 * Eg: https://api.isidore.science/vocabulary/suggest?q=quebe&output=json
 * @param {string} searchValue
 * @returns {Promise<object>}
 */
export async function searchKeyword(searchValue) {
  if (searchValue && searchValue.length > 0) {
    const url = new URL('https://api.isidore.science/vocabulary/suggest')
    const searchParams = url.searchParams
    searchParams.append('output', 'json')
    searchParams.append('feed', 'rameau')
    searchParams.append('q', searchValue)

    return fetch(url, { method: 'GET' })
      .then((response) => {
        return response.ok
          ? response.json()
          : Promise.reject(
              new Error(
                'Error while fetching results from Isidore',
                response.text
              )
            )
      })
      .then((json) => {
        if (
          json.response &&
          json.response.replies &&
          json.response.replies.reply
        ) {
          if (Array.isArray(json.response.replies.reply)) {
            return json.response.replies.reply
          } else {
            return [json.response.replies.reply]
          }
        }
        return []
      })
      .catch((error) => {
        console.error(error)
        return []
      })
  }
  return []
}

/**
 * Search an author from the Isidore API.
 * Eg: https://api.isidore.science/resource/suggest?q=marcell&feed=feed-creator&output=json
 * @param {string} searchValue
 * @returns {Promise<object>}
 */
export async function searchAuthor(searchValue) {
  if (searchValue && searchValue.length > 0) {
    const url = new URL('https://api.isidore.science/resource/suggest')
    const searchParams = url.searchParams
    searchParams.append('output', 'json')
    searchParams.append('feed', 'feed-creator')
    searchParams.append('q', searchValue)

    return fetch(url, { method: 'GET' })
      .then((response) => {
        return response.ok
          ? response.json()
          : Promise.reject(
              new Error(
                'Error while fetching results from Isidore',
                response.text
              )
            )
      })
      .then((json) => {
        if (
          json.response &&
          json.response.replies &&
          json.response.replies.reply
        ) {
          if (Array.isArray(json.response.replies.reply)) {
            return json.response.replies.reply
          } else {
            return [json.response.replies.reply]
          }
        }
        return []
      })
      .catch((error) => {
        console.error(error)
        return []
      })
  }
  return []
}
