//root reducer
// import { combineReducers } from 'redux';
// import alert from './alert';
// export default combineReducers({
//   alert,
// });

// reducers/index.js
import { combineReducers } from 'redux';
import alertReducer from './alertSlice';

const rootReducer = combineReducers({
  alert: alertReducer, // Use 'alert' as the key for the alert state
});

export default rootReducer;
