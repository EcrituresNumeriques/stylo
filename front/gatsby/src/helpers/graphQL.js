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
    let res = await response.json()
    if (res) {
      res = res.errors || [{ message: 'problem' }]
    }
    if (res) {
      res = res[0].message
    }
    console.error(
      `${JSON.stringify(
        res
      )}.\nSomething wrong happened during: ${action} =>  ${response.status}, ${
        response.statusText
      }.`
    )
    throw new Error(res)
  }

  const json = await response.json()
  if (json.errors) {
    throw new Error(json.errors[0].message)
  }
  return json.data
}

export default askGraphQL
