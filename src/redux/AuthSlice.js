import {createSlice, createAsyncThunk} from '@reduxjs/toolkit';
import axios from 'axios';
import Toast from 'react-native-toast-message';
import CryptoJS from 'crypto-js';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {BASE_URL, setActiveCompany} from '../utils/BaseUrl';

export const CurrentLogin = createAsyncThunk(
  'user',
  async ({config, username, password, company, companyLabel}) => {
    try {
      const data = await axios(config);
      let foundUser = null;

      if (Array.isArray(data?.data?.data)) {
        foundUser = data.data.data.find(
          user =>
            String(user.user_id).trim().toLowerCase() ===
            String(username).trim().toLowerCase(),
        );
      } else if (data?.data?.data && typeof data.data.data === 'object') {
        foundUser = data.data.data;
      } else if (Array.isArray(data?.data)) {
        foundUser = data.data.find(
          user =>
            String(user.user_id).trim().toLowerCase() ===
            String(username).trim().toLowerCase(),
        );
      } else if (data?.data && typeof data.data === 'object') {
        foundUser = data.data;
      }

      if (foundUser) {
        const hashedPassword = CryptoJS.MD5(password).toString();
        const isPasswordMatch =
          !foundUser.password ||
          foundUser.password === hashedPassword ||
          foundUser.password === password;

        if (isPasswordMatch) {
          const finalCompany = company || 'company1';
          const finalLabel = companyLabel || 'IBR-ENT';
          setActiveCompany(finalCompany);
          await AsyncStorage.setItem('SELECTED_COMPANY_CODE', finalCompany);
          await AsyncStorage.setItem('SELECTED_COMPANY', finalLabel);

          return {
            user: foundUser,
            company: finalCompany,
            companyLabel: finalLabel,
            credentials: {
              username: String(username).trim(),
              password: String(password).trim(),
              company: finalCompany,
              companyLabel: finalLabel,
            },
          };
        } else {
          console.log('Invalid password');
          return null;
        }
      } else {
        console.log('Not Found User');
        Toast.show({
          type: 'error',
          text1: 'Invalid username',
          text2: 'Your username is invalid',
        });
        return null;
      }
    } catch (error) {
      console.log('Login Error:', error);
      return null;
    }
  },
);

export const switchCompanyAndSync = createAsyncThunk(
  'user/switchCompany',
  async ({company, companyLabel}, {getState}) => {
    setActiveCompany(company);
    await AsyncStorage.setItem('SELECTED_COMPANY_CODE', company);
    await AsyncStorage.setItem('SELECTED_COMPANY', companyLabel);

    const state = getState();
    const creds = state.Data?.savedCredentials;

    if (creds?.username && creds?.password) {
      try {
        const formData = new FormData();
        formData.append('user_id', creds.username);
        formData.append('password', creds.password);
        formData.append('company', company);

        const res = await axios.post(`${BASE_URL}users.php`, formData, {
          headers: {'Content-Type': 'multipart/form-data'},
        });

        let newUser = null;
        if (Array.isArray(res?.data?.data)) {
          newUser =
            res.data.data.find(
              u =>
                String(u.user_id).trim().toLowerCase() ===
                String(creds.username).trim().toLowerCase(),
            ) || res.data.data[0];
        } else if (res?.data?.data && typeof res.data.data === 'object') {
          newUser = res.data.data;
        }

        return {company, companyLabel, user: newUser};
      } catch (e) {
        console.log('Silent switch profile sync error:', e);
      }
    }

    return {company, companyLabel, user: null};
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
    activeCompany: 'company1',
    selectedCompany: 'IBR-ENT',
    savedCredentials: null,
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
    setActiveCompanyState: (state, action) => {
      state.activeCompany = action.payload.company;
      state.selectedCompany = action.payload.companyLabel;
      if (state.savedCredentials) {
        state.savedCredentials = {
          ...state.savedCredentials,
          company: action.payload.company,
          companyLabel: action.payload.companyLabel,
        };
      }
    },
    setLogout: state => {
      state.token = '';
      state.currentData = [];
      state.savedCredentials = null;
    },
  },

  extraReducers: builder => {
    builder
      .addCase(CurrentLogin.fulfilled, (state, action) => {
        state.Loading = false;
        if (action.payload?.user) {
          state.currentData = action.payload.user;
          state.token = action.payload.user.password || 'authenticated';
          state.activeCompany = action.payload.company || 'company1';
          state.selectedCompany = action.payload.companyLabel || 'IBR-ENT';
          state.savedCredentials = action.payload.credentials || null;
        } else {
          Toast.show({
            type: 'error',
            text1: 'Your username or password is incorrect',
          });
        }
      })
      .addCase(CurrentLogin.rejected, (state, action) => {
        state.Loading = false;
      })
      .addCase(switchCompanyAndSync.fulfilled, (state, action) => {
        if (action.payload) {
          state.activeCompany = action.payload.company;
          state.selectedCompany = action.payload.companyLabel;
          if (action.payload.user) {
            state.currentData = action.payload.user;
          }
          if (state.savedCredentials) {
            state.savedCredentials = {
              ...state.savedCredentials,
              company: action.payload.company,
              companyLabel: action.payload.companyLabel,
            };
          }
        }
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
  setActiveCompanyState,
} = AuthSlice.actions;

export default AuthSlice.reducer;
