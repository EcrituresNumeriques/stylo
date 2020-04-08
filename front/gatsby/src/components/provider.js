import React from "react"
import { Provider } from "react-redux"
import createStore from "../state/createStore"

export const store = createStore()

export default ({ element }) => {
  return <Provider store={store}>{element}</Provider>
}
