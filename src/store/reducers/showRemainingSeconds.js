import { createSlice } from "@reduxjs/toolkit";


const initialState = {
    totalSecond: 0,
    secondSnap: 0,
    storeSecond:0,
    remainingSecond:0,
    
    user2totalSecond: 0,
    user2secondSnap: 0,
    user2storeSecond:0,
    user2remainingSecond:0
}

export const showRemainingSeconds = createSlice({
    name: "showSecond",
    initialState,
    reducers: {
        setTotalSecond: (state, action) => {
            state.totalSecond = action.payload;
        },
        setSecondSnap: (state, action) => {
            const timeParts = action.payload.split(':');
            const hours = parseInt(timeParts[0], 10) || 0;
    const minutes = parseInt(timeParts[1], 10) || 0;
    const seconds = parseInt(timeParts[2], 10) || 0;
    let totalsec = (hours * 3600) + (minutes * 60) + seconds;
            state.secondSnap = totalsec 
            let totalSeconds= state.storeSecond += (state.totalSecond - state.secondSnap)
                    // let totalSeconds = state.remainingSecond 
            const minute = Math.floor(totalSeconds / 60);
    const second = totalSeconds % 60;
    state.remainingSecond = `${String(minute).padStart(2, '0')}:${String(second).padStart(2, '0')}`;
       
        },
        resetremainingSecond: (state,action) => {
            state.remainingSecond = action.payload
            state.storeSecond = action.payload
        },
        
         // USER 2 TOTAL TIME
        user2setTotalSecond: (state, action) => {
            state.user2totalSecond = action.payload;
        },
        user2setSecondSnap: (state, action) => {
            const timeParts = action.payload.split(':');
            const hours = parseInt(timeParts[0], 10) || 0;
    const minutes = parseInt(timeParts[1], 10) || 0;
    const seconds = parseInt(timeParts[2], 10) || 0;
    let totalsec = (hours * 3600) + (minutes * 60) + seconds;
            state.user2secondSnap = totalsec 
            let user2totalSecond= state.user2storeSecond += (state.user2totalSecond - state.user2secondSnap)
                    // let user2totalSecond = state.user2remainingSecond 
            const minute = Math.floor(user2totalSecond / 60);
    const second = user2totalSecond % 60;
    state.user2remainingSecond = `${String(minute).padStart(2, '0')}:${String(second).padStart(2, '0')}`;
       
        },
        user2resetremainingSecond: (state,action) => {
            state.user2remainingSecond = action.payload
            state.user2storeSecond = action.payload
    }

    }
        
})


export const {  setTotalSecond, setSecondSnap, resetremainingSecond,user2setTotalSecond,user2setSecondSnap,user2resetremainingSecond } = showRemainingSeconds.actions;
export default showRemainingSeconds.reducer;

