import initialState from './initialState';
import objectAssign from 'object-assign';
import sortByIdDesc from './../helpers/sorts/idDesc';

//function immutablePush(arr, newEntry){
//  return [ ...arr, newEntry ];
//}
function immutableUnshift(arr, newEntry){
  return [ newEntry, ...arr ];
}
function immutableDelete (arr, index) {
   return arr.slice(0,index).concat(arr.slice(index+1));
}

export default function fuelSavingsReducer(state = initialState.articles, action) {
  let newState = objectAssign({}, state);

  switch (action.type) {
    case 'ARTICLES_ADD':
      newState.articles = immutableUnshift(newState.articles,action.data);
      return newState;
    case 'ARTICLES_LOAD':
      action.data = action.data.map(
        function(article){
          article.versions = article.versions.sort(sortByIdDesc);
          return article;
        }
      );
      newState.articles = action.data.sort(sortByIdDesc);
      return newState;
    case 'ARTICLES_UPDATE':{
      //find correct article
      let index = newState.articles.findIndex(function(element){return element.id == action.data.id;});
      if(index < 0){index=0;}
      if(action.data.versions)
      {action.data.versions = action.data.versions.sort(sortByIdDesc);}
      newState.articles = Object.assign([], newState.articles, {[index]: action.data});
      return newState;}
    case 'ARTICLES_DELETE':{
      let index = newState.articles.findIndex(function(element){return element.id == action.data.id;});
      newState.articles = immutableDelete(newState.articles,index);
      return newState;
    }
    case 'ARTICLES_ADDVERSION':{
      let index = newState.articles.findIndex(function(element){return element.id == action.data.article;});
      newState.articles[index].versions = immutableUnshift(newState.articles[index].versions,action.data);
      return newState;
    }
    default:
      return state;
  }
}
