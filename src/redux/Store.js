import { combineReducers, configureStore , Tuple  } from '@reduxjs/toolkit';
import counterReducer from './AuthSlice';
import {
    persistStore,
    persistReducer,
    FLUSH,
    REHYDRATE,
    PAUSE,
    PERSIST,
    PURGE,
    REGISTER,
  } from 'redux-persist';
import AsyncStorage from '@react-native-async-storage/async-storage';


const persistConfig = {
    key: 'root',
    storage: AsyncStorage,
};

const persistedReducer = persistReducer(persistConfig, counterReducer);



export const Store = configureStore({
    reducer: {
        Data: persistedReducer,
    },
    devTools: process.env.NODE_ENV !== 'production',

    middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }),

});


export const persistor = persistStore(Store);
