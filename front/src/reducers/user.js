import initialState from './initialState';
import objectAssign from 'object-assign';

function immutablePush(arr, newEntry){
  return [ ...arr, newEntry ];
}

export default function fuelSavingsReducer(state = initialState.user, action) {
  let newState = objectAssign({}, state);

  switch (action.type) {
    case 'USER_LOGIN':
      newState.log = true;
      newState.user = action.data;
      console.log(newState);
      return newState;
    default:
      return state;
  }
}
