import { combineReducers } from '@reduxjs/toolkit';
import notesReducer from './noteSlice';

const rootReducer = combineReducers({
  notes: notesReducer,
  // Add more reducers here as the app grows
});

export type RootState = ReturnType<typeof rootReducer>;
export default rootReducer;
