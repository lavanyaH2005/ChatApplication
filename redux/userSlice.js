import { createSlice } from '@reduxjs/toolkit'

const initialState = {
  _id: "",
  name: "",
  email: "",
  profile_pic: "",
  token: "",
  onlineUser: [],
  socketConnection: null,
  friends: [] // Add a friends array to track the list of friends
}

export const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setUser: (state, action) => {
      state._id = action.payload._id
      state.name = action.payload.name 
      state.email = action.payload.email 
      state.profile_pic = action.payload.profile_pic 
    },
    setToken: (state, action) => {
      state.token = action.payload
    },
    logout: (state, action) => {
      state._id = ""
      state.name = ""
      state.email = ""
      state.profile_pic = ""
      state.token = ""
      state.socketConnection = null
      state.friends = [] // Clear friends on logout
    },
    setOnlineUser: (state, action) => {
      state.onlineUser = action.payload
    },
    setSocketConnection: (state, action) => {
      state.socketConnection = action.payload
    },
    addFriend: (state, action) => {
      state.friends.push(action.payload) // Add a friend
    },
    removeFriend: (state, action) => {
      state.friends = state.friends.filter(friend => friend._id !== action.payload._id) // Remove a friend
    }
  },
})

// Action creators are generated for each case reducer function
export const { 
  setUser, 
  setToken, 
  logout, 
  setOnlineUser, 
  setSocketConnection, 
  addFriend, 
  removeFriend 
} = userSlice.actions

export default userSlice.reducer
