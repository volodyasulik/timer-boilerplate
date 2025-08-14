import { configureStore } from '@reduxjs/toolkit';
import timers from './timersSlice';
import settings from './settingsSlice';

export const store = configureStore({ reducer: { timers, settings } });
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
