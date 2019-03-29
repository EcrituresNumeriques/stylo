import { createStore as reduxCreateStore } from "redux"

const initialState = { logedIn: false, users:[],password:undefined,sessionToken:undefined }

const reducer = (state, action) => {
  if (action.type === `LOGIN`) {
    const login = action.login
    if(login.password && login.users && login.token){
      return Object.assign({}, state, {
        logedIn: true,
        users: login.users,
        activeUser: login.users[0],
        password: login.password,
        sessionToken: login.token
      })
    }
  }
  else if(action.type === 'UPDATE_ACTIVE_USER'){
    console.log("updating displayName")
    return Object.assign({}, state, {
      activeUser: {...state.activeUser, displayName: action.payload}
    })
  }
  else if(action.type === 'SWITCH'){
    console.log("switching user")
  }
  else if (action.type === `LOGOUT`) {
    return Object.assign({}, state, {
      ...initialState
    })
  }
  return state
}


const createStore = () => reduxCreateStore(reducer, initialState)

export default createStore