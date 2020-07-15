import wrapWithProvider, {store} from "./src/components/provider"


store.dispatch({ type: 'REFRESH_PROFILE' })

export const wrapRootElement = wrapWithProvider