import { combineReducers } from 'redux';
import articles from './articles';
import { routerReducer } from 'react-router-redux';

const rootReducer = combineReducers({
  articles,
  routing: routerReducer
});

export default rootReducer;
