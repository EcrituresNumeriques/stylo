import { shallowEqual, useSelector } from "react-redux"

async function getErrorResponse (response) {
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

export default async function askGraphQL (
  payload,
  action = 'fetching from the server',
  sessionToken = null,
  applicationConfig
) {
  const response = await fetch(applicationConfig.graphqlEndpoint, {
    method: 'POST',
    mode: 'cors',
    credentials: 'omit',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      // Authorization header is provided only when we have a token
      ...(sessionToken ? { Authorization: `Bearer ${sessionToken}` } : {})
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

export function useGraphQL () {
  const sessionToken = useSelector(state => state.sessionToken)
  const graphqlEndpoint = useSelector(state => state.applicationConfig.graphqlEndpoint, shallowEqual)

  return function callStyloGrapQLApi ({ query, variables }) {
    return askGraphQL({ query, variables }, null, sessionToken, { graphqlEndpoint })
  }
}
