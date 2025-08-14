import { createSlice, createAsyncThunk, PayloadAction, createSelector } from "@reduxjs/toolkit"

const API = "http://localhost:7654"

export type TimerEntity = {
  id: string
  base: number
  receivedAt: number
  loadingReset?: boolean
  error?: string | null
  isLocal?: boolean
}

type TimersState = {
  byId: Record<string, TimerEntity>
  ids: string[]
  now: number
  loadingList: boolean
  error?: string | null
}

const initialState: TimersState = {
  byId: {
    local: { id: "local", base: 0, receivedAt: Date.now(), isLocal: true },
  },
  ids: ["local"],
  now: Date.now(),
  loadingList: false,
  error: null,
}

export const fetchTimerList = createAsyncThunk<string[]>(
  "timers/list",
  async () => {
    const res = await fetch(`${API}/list`)
    if (!res.ok) throw new Error("list failed")

    return res.json()
  },
)

const safeEncode = (raw: string) => {
  let s = raw;
  try { s = decodeURIComponent(raw); } catch {}
  return encodeURIComponent(s);
};

export const fetchTimerValue = createAsyncThunk<
  { id: string; base: number; receivedAt: number },
  string
>('timers/createOrFetch', async (id, { rejectWithValue }) => {
  const encId = safeEncode(id);

  const resGet = await fetch(`${API}/${encId}`, { headers: { Accept: 'application/json' } });
  if (resGet.ok) {
    const json = await resGet.json();
    return { id, base: Number(json.elapsed ?? 0), receivedAt: Date.now() };
  }

  if (resGet.status === 404) {
    const resCreate = await fetch(`${API}/reset/${encId}`, { method: 'POST' });
    if (!resCreate.ok) return rejectWithValue('create failed');
    const j2 = await resCreate.json();
    return { id, base: Number(j2.elapsed ?? 0), receivedAt: Date.now() };
  }

  return rejectWithValue(resGet.statusText || 'get failed');
});

export const resetServerTimer = createAsyncThunk<
  { id: string; base: number; receivedAt: number },
  string
>('timers/reset', async (id) => {
  const encId = safeEncode(id);
  const res = await fetch(`${API}/reset/${encId}`, { method: 'POST' });
  if (!res.ok) throw new Error('reset failed');
  const json = await res.json();
  return { id, base: Number(json.elapsed ?? 0), receivedAt: Date.now() };
});


const timersSlice = createSlice({
  name: "timers",
  initialState,
  reducers: {
    nowTick(state, action: PayloadAction<number>) {
      state.now = action.payload
    },
    resetLocal(state) {
      const t = state.byId["local"]
      if (!t) return
      t.base = 0
      t.receivedAt = state.now
    },
    hydrateLocal(
      state,
      action: PayloadAction<{ base: number; receivedAt: number } | null>,
    ) {
      if (!action.payload) return
      state.byId["local"] = { ...state.byId["local"], ...action.payload }
    },
    upsertMany(state, action: PayloadAction<TimerEntity[]>) {
      for (const t of action.payload) {
        state.byId[t.id] = { ...state.byId[t.id], ...t }
        if (!state.ids.includes(t.id)) state.ids.push(t.id)
      }
    },
  },
  extraReducers: b => {
    b.addCase(fetchTimerList.pending, s => {
      s.loadingList = true
      s.error = null
    })
    b.addCase(fetchTimerList.fulfilled, (s, a) => {
      s.loadingList = false
      const ids = a.payload
      for (const id of ids) {
        if (!s.byId[id]) s.byId[id] = { id, base: 0, receivedAt: Date.now() }
        if (!s.ids.includes(id)) s.ids.push(id)
      }
    })
    b.addCase(fetchTimerList.rejected, (s, a) => {
      s.loadingList = false
      s.error = a.error.message || "list error"
    })

    b.addCase(fetchTimerValue.fulfilled, (s, a) => {
      const { id, base, receivedAt } = a.payload
      s.byId[id] = { ...(s.byId[id] || { id }), base, receivedAt }
      if (!s.ids.includes(id)) s.ids.push(id)
    })

    b.addCase(resetServerTimer.pending, (s, a) => {
      const id = a.meta.arg
      if (s.byId[id]) s.byId[id].loadingReset = true
    })
    b.addCase(resetServerTimer.fulfilled, (s, a) => {
      const { id, base, receivedAt } = a.payload
      s.byId[id] = {
        ...(s.byId[id] || { id }),
        base,
        receivedAt,
        loadingReset: false,
      }
    })
    b.addCase(resetServerTimer.rejected, (s, a) => {
      const id = a.meta.arg
      if (s.byId[id]) {
        s.byId[id].loadingReset = false
        s.byId[id].error = a.error.message || "reset error"
      }
    })
  },
})

export const { nowTick, resetLocal, hydrateLocal, upsertMany } =
  timersSlice.actions
export default timersSlice.reducer

type RootState = { timers: TimersState }

export const selectNow = (s: RootState) => s.timers.now
export const selectTimerIds = (s: RootState) => s.timers.ids
export const selectTimersById = (s: RootState) => s.timers.byId

export const selectTimers = createSelector(
  [selectTimerIds, selectTimersById],
  (ids, byId) => ids.map(id => byId[id])
)

export const computeValue = (t: TimerEntity, now: number) =>
  Math.max(0, t.base + (now - t.receivedAt) / 1000)

