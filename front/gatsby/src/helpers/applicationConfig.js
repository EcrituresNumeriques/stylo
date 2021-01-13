export function getApplicationConfig() {
  return fetch(`/config.json`, {
    method: 'GET',
  }).then((res) => res.json())
}
