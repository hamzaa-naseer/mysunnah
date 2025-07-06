import { createSelector, createSlice } from "@reduxjs/toolkit";
import { store } from "../store";

const initialState = {
    data: {},
    bookmarkId : ''
}

export const bookmarkSlice = createSlice({
    name: "Bookmark",
    initialState,
    reducers: {
        bookmarkSuccess: (bookmark, action) => {
            bookmark.data = action.payload.data
        },
        bookmarkId: (bookmark, action) => {
            bookmark.bookmarkId = action.payload
        },
    }
})


export const { bookmarkSuccess,bookmarkId } = bookmarkSlice.actions;
export default bookmarkSlice.reducer;

// load data
export const Loadbookmarkdata = (data) => {
    store.dispatch(bookmarkSuccess({ data}))
}

// Selector Functions
export const bookmarkData = createSelector(
    state => state.Bookmark,
    Bookmark => Bookmark.data,
)
