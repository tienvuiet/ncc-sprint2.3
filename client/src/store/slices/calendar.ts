import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";

interface Showtime {
  id: number;
  movie_id: number;
  day: string;
  time: string;
  created_at: string;
}

interface CalendarState {
  showtime: Showtime[];
  loading: boolean;
}

const initialState: CalendarState = {
  showtime: [],
  loading: false,
};

export const getAllShowtime = createAsyncThunk("calendar/getAllShowtime", async () => {
  const res = await axios.get("http://localhost:8080/showtimes");
  return res.data;
});

export const addShowtime = createAsyncThunk("calendar/addShowtime", async (data: Omit<Showtime, "id">) => {
  const res = await axios.post("http://localhost:8080/showtimes", data);
  return res.data;
});

export const updateShowtime = createAsyncThunk("calendar/updateShowtime", async (data: Showtime) => {
  const res = await axios.put(`http://localhost:8080/showtimes/${data.id}`, data);
  return res.data;
});

export const deleteShowtime = createAsyncThunk("calendar/deleteShowtime", async (id: number) => {
  await axios.delete(`http://localhost:8080/showtimes/${id}`);
  return id;
});

const calendarSlice = createSlice({
  name: "calendar",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      /* GET */
      .addCase(getAllShowtime.pending, (state) => {
        state.loading = true;
      })
      .addCase(getAllShowtime.fulfilled, (state, action) => {
        state.loading = false;
        state.showtime = action.payload;
      })
      .addCase(getAllShowtime.rejected, (state) => {
        state.loading = false;
      })

      /* ADD */
      .addCase(addShowtime.fulfilled, (state, action) => {
        state.showtime.push(action.payload);
      })

      /* UPDATE */
      .addCase(updateShowtime.fulfilled, (state, action) => {
        const index = state.showtime.findIndex((s) => s.id === action.payload.id);
        if (index !== -1) {
          state.showtime[index] = action.payload;
        }
      })

      /* DELETE */
      .addCase(deleteShowtime.fulfilled, (state, action) => {
        state.showtime = state.showtime.filter((s) => s.id !== action.payload);
      });
  },
});

export default calendarSlice.reducer;
