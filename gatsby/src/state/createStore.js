import { createStore as reduxCreateStore } from "redux"

const reducer = (state, action) => {
  if (action.type === `LOGIN`) {
    return Object.assign({}, state, {
      logedIn: true
    })
  }
  else if (action.type === `LOGOUT`) {
    return Object.assign({}, state, {
      logedIn: false
    })
  }
  return state
}

const initialState = { logedIn: false }

const createStore = () => reduxCreateStore(reducer, initialState)

export default createStore