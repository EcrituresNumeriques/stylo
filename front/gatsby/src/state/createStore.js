import { createStore as reduxCreateStore } from "redux"

const initialState = { logedIn: false, users:[],password:undefined,sessionToken:undefined }

const reducer = (state, action) => {
  if (action.type === `LOGIN`) {
    return Object.assign({}, state, {
      logedIn: true,
      users:[
        {id:"test",username:"Arthur",email:"test@test.com"},
        {id:"test2",username:"Arthur2",email:"test2@test.com"},
        {id:"test3",username:"Arthur3",email:"test3@test.com"},
      ],
      password:{username:"Arthur",email:"test@test.com"},
      sessionToken:"test"
    })
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