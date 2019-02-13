import initialState from './initialState';
import objectAssign from 'object-assign';

//function immutablePush(arr, newEntry){
//  return [ ...arr, newEntry ];
//}

export default function fuelSavingsReducer(state = initialState.user, action) {
  let newState = objectAssign({}, state);

  switch (action.type) {
    case 'USER_LOGIN':
      newState.log = true;
      newState.user = action.data;
      return newState;
    case 'USER_STATUS':
      newState.log = action.data.log;
      newState.user = action.data;
      return newState;
    default:
      return state;
  }
}
