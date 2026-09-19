import axios from 'axios';
import BaseUrl from '../utils/BaseUrl';

export const GetBankBalance = async () => {
  let config = {
    method: 'get',
    maxBodyLength: Infinity,
    url: `${BaseUrl}dash_banks.php`,
    headers: {},
  };

  const res = await axios.request(config);
  return res.data;
};

export const GetSalesman = async () => {
  let config = {
    method: 'get',
    maxBodyLength: Infinity,
    url: `${BaseUrl}dash_salesman.php`,
    headers: {},
  };

  const res = await axios.request(config);
  return res.data;
};

export const GetItemBalance = async () => {
  let config = {
    method: 'get',
    url: `${BaseUrl}dash_items.php`,
    headers: {
      Pragma: 'no-cache',
    },
  };

  const res = await axios.request(config);
  return res.data;
};

export const GetPayable = async () => {
  let config = {
    method: 'get',
    maxBodyLength: Infinity,
    url: `${BaseUrl}dash_payable.php`,
    headers: {},
  };

  const res = await axios.request(config);
  return res.data;
};

export const GetReceivable = async () => {
  let config = {
    method: 'get',
    maxBodyLength: Infinity,
    url: `${BaseUrl}dash_receivable.php`,
    headers: {},
  };

  const res = await axios.request(config);
  return res.data;
};

export const GetIncomeAndExpenseDetail = async (fromDate, toDate) => {
  const formData = new FormData();
  formData.append('from_date', fromDate);
  formData.append('to_date', toDate);

  const response = await fetch(`${BaseUrl}income_and_expense_detail.php`, {
    method: 'POST',
    headers: {
      'Content-Type': 'multipart/form-data',
    },
    body: formData,
  });
  return await response.json();
};

