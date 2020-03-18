import env from './src/helpers/env'
import wrapWithProvider, {store} from "./src/components/provider"

fetch(`${env.BACKEND_ENDPOINT}/profile`, {
  method: 'GET',
  credentials: 'include',
  cors: true
})
  .then(res => res.json())
  .then(({ user }) => user && store.dispatch({ type: 'PROFILE', data: user }))

export const wrapRootElement = wrapWithProvider