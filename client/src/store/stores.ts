import { configureStore } from "@reduxjs/toolkit";
import movieDeatail from "./slices/movieDetail"
import showTimeMovie from "./slices/calendar"
import calendarReducer from "./slices/calendar"
export const store = configureStore({   
    reducer:{

          movie: movieDeatail,
        //   showtime: showTimeMovie,
           calendar: calendarReducer,
    }
})
export type RootState = ReturnType<typeof store.getState>
export type AppDispatch  = typeof store.dispatch
