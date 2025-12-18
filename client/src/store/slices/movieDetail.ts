import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import type { Movie, Showtime } from "../../types";
import axios from "axios";

interface MovieState {
    movie: Movie[];
    showtime: Showtime[];
    loading: boolean;
}
const initialState: MovieState ={
    movie: [],
    showtime: [],
    loading: false
}
export const getAllMovie = createAsyncThunk(    
    "movieDetail/getAllMovieDetail",
    async () => {
        const res = await axios.get("http://localhost:8080/movies");
        return res.data
    }
)
const movieDetailSlice = createSlice({  
    name:"movieDetail",
    initialState,
    reducers:{},
    extraReducers: (builder)=>{
        
     builder
     .addCase(getAllMovie.pending, (state) =>{
        state.loading = true
     })
     .addCase(getAllMovie.fulfilled, (state, action) =>{
        state.loading = false;
        state.movie = action.payload
     })
    }
})
export default movieDetailSlice.reducer