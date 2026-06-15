import {createSlice, createAsyncThunk} from '@reduxjs/toolkit';
import axios from 'axios';
import Toast from 'react-native-toast-message';
import CryptoJS from 'crypto-js';

export const CurrentLogin = createAsyncThunk(
  'user',
  async ({config, username, password}) => {
    return axios(config)
      .then(data => {
        console.log('first.>>>>>>>>>>>>>', config, username, password);
        // console.log("data", data.data.data)
        const user = data?.data?.data?.find(user => user.user_id === username);
        if (user) {
          const hashedPassword = CryptoJS.MD5(password).toString();

          if (hashedPassword === user.password) {
            console.log('Login successful');
            return user;
          } else {
            console.log('Invalid password');
            // Toast.show({
            //   type: 'error',
            //   text1: 'Invalid password',
            //   text2: 'Your password is incorrect',
            // });
          }
        } else {
          console.log('Not Found User');
          Toast.show({
            type: 'error',
            text1: 'Invalid username',
            text2: 'Your username is invalid',
          });
        }
      })
      .catch(error => {
        console.log(error);
      });
  },
);

export const AuthSlice = createSlice({
  name: 'UsersData',
  initialState: {
    currentData: [],
    cartData: [],
    token: '',
    GrandCartTotalPrice: '0',
    Loading: false,
    AllProduct: [],
  },
  reducers: {
    setLoader: (state, action) => {
      state.Loading = action.payload;
    },
    setMyData: (state, action) => {
      state.currentData = action.payload;
    },
    setToken: (state, action) => {
      state.token = action.payload.data;
    },
    setCartData: (state, action) => {
      state.cartData = action.payload;
    },
    setGrandCartTotalPrice: (state, action) => {
      state.GrandCartTotalPrice = action.payload;
    },
    setAllProducts: (state, action) => {
      state.AllProduct = action.payload;
    },

    setLogout: state => {
      (state.token = ''), (state.currentData = []);
    },
  },

  extraReducers: builder => {
    builder
      .addCase(CurrentLogin.fulfilled, (state, action) => {
        state.Loading = false;
        if (action.payload) {
          state.currentData = action.payload;
          state.token = action.payload.password;
        } else {
          Toast.show({
            type: 'error',
            text1: 'Your username or password is incorrect',
          });
        }
        console.log('first', action.payload);
      })
      .addCase(CurrentLogin.rejected, (state, action) => {
        state.Loading = false;
      });
  },
});

export const {
  setMyData,
  setToken,
  setLogout,
  setLoader,
  setCartData,
  setGrandCartTotalPrice,
  setAllProducts,
} = AuthSlice.actions;

export default AuthSlice.reducer;
