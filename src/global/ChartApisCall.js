import axios from 'axios';
import BaseUrl, {getActiveCompany} from '../utils/BaseUrl';

const createCompanyFormData = () => {
  const fd = new FormData();
  fd.append('company', getActiveCompany());
  return fd;
};

export const GetBankBalance = async () => {
  const fd = createCompanyFormData();
  let config = {
    method: 'post',
    maxBodyLength: Infinity,
    url: `${BaseUrl}dash_banks.php`,
    data: fd,
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  };

  const res = await axios.request(config);
  return res.data;
};

export const GetSalesman = async () => {
  const fd = createCompanyFormData();
  let config = {
    method: 'post',
    maxBodyLength: Infinity,
    url: `${BaseUrl}dash_salesman.php`,
    data: fd,
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  };

  const res = await axios.request(config);
  return res.data;
};

export const GetItemBalance = async () => {
  const fd = createCompanyFormData();
  let config = {
    method: 'post',
    url: `${BaseUrl}dash_items.php`,
    data: fd,
    headers: {
      'Content-Type': 'multipart/form-data',
      Pragma: 'no-cache',
    },
  };

  const res = await axios.request(config);
  return res.data;
};

export const GetPayable = async () => {
  const fd = createCompanyFormData();
  let config = {
    method: 'post',
    maxBodyLength: Infinity,
    url: `${BaseUrl}dash_payable.php`,
    data: fd,
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  };

  const res = await axios.request(config);
  return res.data;
};

export const GetReceivable = async () => {
  const fd = createCompanyFormData();
  let config = {
    method: 'post',
    maxBodyLength: Infinity,
    url: `${BaseUrl}dash_receivable.php`,
    data: fd,
    headers: {
      'Content-Type': 'multipart/form-data',
    },
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
  formData.append('company', getActiveCompany());

  return await callEndpoint('income_and_expense.php', formData);
};

export const GetParentAccountDetail = async (accountType, fromDate, toDate) => {
  const formData = new FormData();
  formData.append('from_date', fromDate);
  formData.append('to_date', toDate);
  formData.append('account_type', accountType ? accountType.toString() : '');
  formData.append('company', getActiveCompany());

  return await callEndpoint('parent_account_detail.php', formData);
};
