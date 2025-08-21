import { configureStore } from '@reduxjs/toolkit';
import noteReducer from './noteSlice';

export const store = configureStore({
  reducer: {
    notes: noteReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false
      // serializableCheck: {
      //   // Ignore these action types
      //   ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE'],
      //   // Ignore these field paths in all actions
      //   ignoredActionPaths: ['meta.arg', 'payload.timestamp', 'payload.createdAt', 'payload.updatedAt','notes.notes.0.createdAt', 'notes.notes.0.updatedAt'],
      //   // Ignore these paths in the state
      //   ignoredPaths: ['items.dates'],
      // },
    }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
