import { createStore as reduxCreateStore } from "redux"

// Définit tout ce qui se passe quand un message d'action est envoyé

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
      activeUser: {...state.activeUser, displayName: action.payload}},{
      users:[...state.users].map(u=>{ if(state.activeUser._id === u._id){u.displayName = action.payload}return u})
    })
  }
  else if(action.type === 'RELOAD_USERS'){
    return Object.assign({}, state, {
      users: action.payload
    })
  }
  else if(action.type === 'SWITCH'){
    if(state.users.map(u=>u._id).includes(action.payload._id)){
      return Object.assign({},state,{activeUser:action.payload})
    }
  }
  else if (action.type === `LOGOUT`) {
    return Object.assign({}, state, {
      ...initialState
    })
  }
  else if (action.type === 'REMOVE_MYSELF_ALLOWED_LOGIN'){
    const remainingUsers = state.users.filter(u=>u._id !== action.payload)
    console.log("Removing myself",Object.assign({},state,{users:remainingUsers,activeUser:remainingUsers[0]}))
    return Object.assign({},state,{users:remainingUsers,activeUser:remainingUsers[0]})
  }
  return state
}


const createStore = () => reduxCreateStore(reducer, initialState)

export default createStore
