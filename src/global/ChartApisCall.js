import axios from 'axios';
import BaseUrl from '../utils/BaseUrl';
import { Alert } from 'react-native';


export const GetBankBalance = async () => {

  let config = {
    method: 'get',
    maxBodyLength: Infinity,
    url: `${BaseUrl}dash_banks.php`,
    headers: {},
  };

 const res = await axios.request(config)
 return res.data

};


export const GetSalesman = async () => {

  let config = {
    method: 'get',
    maxBodyLength: Infinity,
    url: `${BaseUrl}dash_salesman.php`,
    headers: {},
  };


 const res = await axios.request(config)
 return res.data
};


export const GetItemBalance = async () => {

  let config = {
    method: 'get',
    maxBodyLength: Infinity,
    url: `${BaseUrl}dash_items.php`,
    headers: {},
  };


 const res = await axios.request(config)
 return res.data
};

export const GetPayable = async () => {

  let config = {
    method: 'get',
    maxBodyLength: Infinity,
    url: `${BaseUrl}dash_payable.php`,
    headers: {},
  };


 const res = await axios.request(config)
 return res.data
};


export const GetReceivable = async () => {

  let config = {
    method: 'get',
    maxBodyLength: Infinity,
    url: `${BaseUrl}dash_receivable.php`,
    headers: {},
  };

 const res = await axios.request(config)
 return res.data
};