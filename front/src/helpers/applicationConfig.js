export function getApplicationConfig(defaultValues) {
  return fetch(`/config.json`).then(response => {
    // this is the path taken when config is server-side generated
    if (response.ok && response.headers.get('content-type') === 'application/json') {
      return response.json()
    }

    // otherwise, we use environment variable based store values
    console.warn('%c[Stylo]', 'font-weight: bold', 'Using default `applicationConfig` store values.')
    return defaultValues
  })
}
