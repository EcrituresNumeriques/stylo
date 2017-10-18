import { combineReducers } from 'redux';
import articles from './articles';
import user from './user';
import { routerReducer } from 'react-router-redux';

const rootReducer = combineReducers({
  articles,
  user,
  routing: routerReducer
});

export default rootReducer;
