import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../api/axiosInstance";

// Load initial state from localStorage
const token = localStorage.getItem("token");
const user = JSON.parse(localStorage.getItem("user") || "null");

export const loginUser = createAsyncThunk("auth/login", async (credentials, { rejectWithValue }) => {
  try {
    const { data } = await api.post("/auth/login", credentials);
    localStorage.setItem("token", data.token);
    localStorage.setItem("user", JSON.stringify(data.user));
    return data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message || "Login failed");
  }
});

export const fetchMe = createAsyncThunk("auth/me", async (_, { rejectWithValue }) => {
  try {
    const { data } = await api.get("/auth/me");
    return data.user;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message);
  }
});

export const updateProfile = createAsyncThunk("auth/updateProfile", async (updates, { rejectWithValue }) => {
  try {
    const { data } = await api.put("/auth/profile", updates);
    localStorage.setItem("user", JSON.stringify(data.user));
    return data.user;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message);
  }
});

const authSlice = createSlice({
  name: "auth",
  initialState: { user, token, loading: false, error: null },
  reducers: {
    logout(state) {
      state.user = null;
      state.token = null;
      localStorage.removeItem("token");
      localStorage.removeItem("user");
    },
    clearError(state) { state.error = null; },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loginUser.pending, (s) => { s.loading = true; s.error = null; })
      .addCase(loginUser.fulfilled, (s, a) => { s.loading = false; s.token = a.payload.token; s.user = a.payload.user; })
      .addCase(loginUser.rejected, (s, a) => { s.loading = false; s.error = a.payload; })
      .addCase(fetchMe.fulfilled, (s, a) => { s.user = a.payload; })
      .addCase(updateProfile.fulfilled, (s, a) => { s.user = a.payload; });
  },
});

export const { logout, clearError } = authSlice.actions;
export default authSlice.reducer;