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

const callEndpoint = async (subPath, formData) => {
  const urls = [
    `${BaseUrl}pnl_module/${subPath}`,
    `${BaseUrl}${subPath}`,
  ];

  for (const url of urls) {
    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        body: formData,
      });
      if (res.ok) {
        const data = await res.json();
        if (data) {
          return data;
        }
      }
    } catch (e) {}
  }
  return null;
};

export const GetIncomeAndExpense = async (fromDate, toDate) => {
  const formData = new FormData();
  formData.append('from_date', fromDate);
  formData.append('to_date', toDate);

  return await callEndpoint('income_and_expense.php', formData);
};

export const GetParentAccountDetail = async (accountType, fromDate, toDate) => {
  const formData = new FormData();
  formData.append('from_date', fromDate);
  formData.append('to_date', toDate);
  formData.append('account_type', accountType ? accountType.toString() : '');

  return await callEndpoint('parent_account_detail.php', formData);
};


