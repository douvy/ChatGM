import { combineReducers } from 'redux';
import yourReducer from './yourReducer';

const rootReducer = combineReducers({
  yourReducerName: yourReducer,
  // Add more reducers as needed
});

export default rootReducer;
