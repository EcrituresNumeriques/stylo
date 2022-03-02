const getErrorResponse = async (response) => {
  try {
    return await response.clone().json()
  } catch (err) {
    const responseText = await response.clone().text()
    return {
      errors: [
        {
          message: responseText
        }
      ]
    }
  }
}

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
    const errorResponse = await getErrorResponse(response)
    console.error(`Something wrong happened during: ${action} => ${response.status}, ${response.statusText}: ${JSON.stringify(errorResponse)}`)
    const errorMessage = errorResponse && errorResponse.errors && errorResponse.errors.length ? errorResponse.errors[0].message : 'Unexpected error!'
    throw new Error(errorMessage)
  }

  const json = await response.json()
  if (json.errors) {
    throw new Error(json.errors[0].message)
  }
  return json.data
}

export default askGraphQL
