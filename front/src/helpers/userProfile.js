export function getUserProfile(applicationConfig) {
  return fetch(`${applicationConfig.backendEndpoint}/profile`, {
    method: 'GET',
    credentials: 'include',
    cors: true,
  }).then((res) => res.json())
}
