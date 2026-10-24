import AsyncStorage from '@react-native-async-storage/async-storage';

export const BASE_URL = 'https://e.de2solutions.com/mobile_dash/';

export const COMPANY_CODES = {
  'IBR-ENT': 'company1',
  FBPM: 'company2',
};

export const COMPANY_LABELS = {
  company1: 'IBR-ENT',
  company2: 'FBPM',
};

export const COMPANY_URLS = {
  'IBR-ENT': BASE_URL,
  FBPM: BASE_URL,
};

let currentCompany = 'company1';

AsyncStorage.getItem('SELECTED_COMPANY_CODE').then(val => {
  if (val) {
    currentCompany = val;
  }
});

export const getActiveCompany = () => currentCompany;

export const setActiveCompany = code => {
  if (code) {
    currentCompany = code;
    AsyncStorage.setItem('SELECTED_COMPANY_CODE', code);
  }
};

const BASEURL = {
  toString() {
    return BASE_URL;
  },
  valueOf() {
    return BASE_URL;
  },
  set() {
    // Single URL architecture: base URL is fixed to BASE_URL
  },
  get() {
    return BASE_URL;
  },
  getActiveCompany() {
    return currentCompany;
  },
  setActiveCompany(code) {
    setActiveCompany(code);
  },
};

export default BASEURL;
