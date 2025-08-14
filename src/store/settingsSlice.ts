import { createSlice, PayloadAction } from '@reduxjs/toolkit';

type SettingsState = { preserveLocal: boolean };
const initialState: SettingsState = { preserveLocal: false };

const settingsSlice = createSlice({
  name: 'settings',
  initialState,
  reducers: {
    setPreserveLocal(state, action: PayloadAction<boolean>) {
      state.preserveLocal = action.payload;
    },
  },
});

export const { setPreserveLocal } = settingsSlice.actions;
export default settingsSlice.reducer;
export const selectPreserveLocal = (s: any) => s.settings.preserveLocal;
