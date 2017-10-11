import initialState from './initialState';
import objectAssign from 'object-assign';

export default function fuelSavingsReducer(state = initialState.data, action) {
  let newState = objectAssign({}, state);

  switch (action.type) {
    case 'TEST':
      return newState;
    default:
      return state;
  }
}
