import initialState from './initialState';
import objectAssign from 'object-assign';
import sortByIdDesc from './../helpers/sorts/idDesc';

//function immutablePush(arr, newEntry){
//  return [ ...arr, newEntry ];
//}
function immutableUnshift(arr, newEntry){
  return [ newEntry, ...arr ];
}

export default function fuelSavingsReducer(state = initialState.articles, action) {
  let newState = objectAssign({}, state);

  switch (action.type) {
    case 'ARTICLES_ADD':
      newState.articles = immutableUnshift(newState.articles,action.data);
      return newState;
    case 'ARTICLES_LOAD':
      newState.articles = action.data.sort(sortByIdDesc);
      return newState;
    case 'ARTICLES_UPDATE':{
      //find correct article
      let index = newState.articles.findIndex(function(element){return element.id == action.data.id;});
      newState.articles = Object.assign([], newState.articles, {[index]: action.data});
      return newState;}
    default:
      return state;
  }
}
