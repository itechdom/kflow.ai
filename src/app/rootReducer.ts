import { combineReducers } from '@reduxjs/toolkit';
import notesReducer from '../features/notes/noteSlice';
import authReducer from '../features/auth/authSlice';

const rootReducer = combineReducers({
  notes: notesReducer,
  auth: authReducer,
  // Add more reducers here as the app grows
});

export type RootState = ReturnType<typeof rootReducer>;
export default rootReducer;
