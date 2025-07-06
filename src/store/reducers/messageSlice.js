import { createSlice } from '@reduxjs/toolkit'

const initialState = {
  firestoreId: null,
  roomCodeFirestoreId: null,
  roomCode: null
}
export const messageSlice = createSlice({
  name: 'messageId',
  initialState,
  reducers: {
    getFirestoreId: (state, action) => {
      state.firestoreId = action.payload
    },
    getFirestoreDocIdForRoomcode: (state, action) => {
      state.roomCodeFirestoreId = action.payload
    },
    getRoomCode: (state, action) => {
      state.roomCode = action.payload
    }
  }
})

export const { getFirestoreId, getFirestoreDocIdForRoomcode, getRoomCode } = messageSlice.actions
export default messageSlice.reducer
