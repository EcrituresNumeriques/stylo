import { toWebsocketEndpoint } from './createReduxStore'

describe('toWebsocketEndpoint()', () => {

  test('localhost is converted to ws:// endpoint', () => {
    expect(toWebsocketEndpoint('http://localhost:3030')).toBe('ws://localhost:3030')
    expect(toWebsocketEndpoint('http://stylo-dev.huma-num.fr/graphql')).toBe('ws://stylo-dev.huma-num.fr/graphql')
  })

  test('https is converted to wss:// endpoint', () => {
    expect(toWebsocketEndpoint('https://localhost:3030')).toBe('wss://localhost:3030')
    expect(toWebsocketEndpoint('https://stylo.huma-num.fr/graphql')).toBe('wss://stylo.huma-num.fr/graphql')
  })
})
