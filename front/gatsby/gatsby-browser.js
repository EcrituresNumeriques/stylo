import 'whatwg-fetch'
import wrapWithProvider, { store } from './src/components/provider'
import { getUserProfile } from './src/helpers/userProfile'

getUserProfile().then((response) =>
  store.dispatch({ type: 'PROFILE', ...response })
)

export const wrapRootElement = wrapWithProvider
