import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../api/axiosInstance";

export const triggerSOS = createAsyncThunk("incidents/sos", async (payload, { rejectWithValue }) => {
  try {
    const { data } = await api.post("/incidents/sos", payload);
    return data.incident;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || "SOS failed");
  }
});

export const fetchMyIncidents = createAsyncThunk("incidents/fetchMine", async (_, { rejectWithValue }) => {
  try {
    const { data } = await api.get("/incidents/mine");
    return data.incidents;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message);
  }
});

export const fetchAllIncidents = createAsyncThunk("incidents/fetchAll", async (params, { rejectWithValue }) => {
  try {
    const { data } = await api.get("/incidents", { params });
    return data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message);
  }
});

const incidentSlice = createSlice({
  name: "incidents",
  initialState: {
    list: [],
    activeIncident: null,
    total: 0,
    loading: false,
    sosLoading: false,
    error: null,
  },
  reducers: {
    setActiveIncident(state, action) { state.activeIncident = action.payload; },
    updateIncidentStatus(state, action) {
      const { id, status } = action.payload;
      const inc = state.list.find((i) => i._id === id);
      if (inc) inc.status = status;
      if (state.activeIncident?._id === id) state.activeIncident.status = status;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(triggerSOS.pending, (s) => { s.sosLoading = true; s.error = null; })
      .addCase(triggerSOS.fulfilled, (s, a) => { s.sosLoading = false; s.activeIncident = a.payload; })
      .addCase(triggerSOS.rejected, (s, a) => { s.sosLoading = false; s.error = a.payload; })
      .addCase(fetchMyIncidents.fulfilled, (s, a) => { s.list = a.payload; })
      .addCase(fetchAllIncidents.fulfilled, (s, a) => { s.list = a.payload.incidents; s.total = a.payload.total; });
  },
});

export const { setActiveIncident, updateIncidentStatus } = incidentSlice.actions;
export default incidentSlice.reducer;