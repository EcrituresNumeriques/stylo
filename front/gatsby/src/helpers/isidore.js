// Documentation https://isidore.science/api

/**
 * Search a vocabulary from the Isidore API.
 * Eg: https://api.isidore.science/vocabulary/suggest?q=quebe&output=json
 * @param {string} searchValue
 * @returns {Promise<Object>}
 */
export async function search(searchValue) {
  if (searchValue && searchValue.length > 0) {
    const url = new URL('https://api.isidore.science/vocabulary/suggest')
    const searchParams = url.searchParams
    searchParams.append('output', 'json')
    searchParams.append('q', searchValue)
    console.log('fetch', searchValue)
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
        console.log({ json })
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
