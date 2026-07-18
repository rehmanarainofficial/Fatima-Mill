import AsyncStorage from '@react-native-async-storage/async-storage';

export const COMPANY_URLS = {
  'IBR-ENT': 'https://e.de2solutions.com/mobile_dash/',
  FBPM: 'https://e.de2solutions.com/mobile_dash_fbpm/',
};    

let currentUrl = COMPANY_URLS['IBR-ENT'];

AsyncStorage.getItem('SELECTED_BASEURL').then(val => {
  if (val) {
    currentUrl = val;
  }
});

const BASEURL = {
  toString() {
    return currentUrl;
  },
  valueOf() {
    return currentUrl;
  },
  set(url) {
    currentUrl = url;
    AsyncStorage.setItem('SELECTED_BASEURL', url);
  },
  get() {
    return currentUrl;
  },
};

export default BASEURL;
