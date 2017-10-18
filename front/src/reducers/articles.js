import initialState from './initialState';
import objectAssign from 'object-assign';

function immutablePush(arr, newEntry){
  return [ ...arr, newEntry ];
}

export default function fuelSavingsReducer(state = initialState.data, action) {
  let newState = objectAssign({}, state);

  switch (action.type) {
    case 'TEST':
      newState.articles = immutablePush(newState.articles,"Yoh");
      return newState;
    default:
      return state;
  }
}
