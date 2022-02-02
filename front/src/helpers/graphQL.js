const askGraphQL = async (
  payload,
  action = 'fetching from the server',
  token = null,
  applicationConfig
) => {
  const response = await fetch(applicationConfig.graphqlEndpoint, {
    method: 'POST',
    mode: 'cors',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify(payload),
  })

  if (!response.ok) {
    try {
      let responseJson = await response.json()
      if (responseJson) {
        responseJson = responseJson.errors || [{ message: 'Unexpected error!' }]
      }
      if (responseJson) {
        responseJson = responseJson[0].message
      }
      console.error(`Something wrong happened during: ${action} => ${response.status}, ${response.statusText}: ${JSON.stringify(responseJson)}`)
      throw new Error(responseJson)
    } catch (err) {
      const responseText = await response.text()
      console.error(`Something wrong happened during: ${action} => ${response.status}, ${response.statusText}: ${responseText}`)
      throw new Error(`${response.status} ${response.statusText}: ${responseText}`)
    }
  }

  const json = await response.json()
  if (json.errors) {
    throw new Error(json.errors[0].message)
  }
  return json.data
}

export default askGraphQL
