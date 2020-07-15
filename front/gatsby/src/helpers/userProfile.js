import env from './env'

export function getUserProfile () {
    return fetch(`${env.BACKEND_ENDPOINT}/profile`, {
        method: 'GET',
        credentials: 'include',
        cors: true
    })
    .then(res => res.json())
}