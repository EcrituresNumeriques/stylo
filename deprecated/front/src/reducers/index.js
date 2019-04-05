import { combineReducers } from 'redux';
import articles from './articles';
import user from './user';
import yamleditor from './yamleditor';
import { routerReducer } from 'react-router-redux';

const rootReducer = combineReducers({
  articles,
  user,
  yamleditor,
  routing: routerReducer
});

export default rootReducer;
