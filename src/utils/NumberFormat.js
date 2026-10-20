/**
 * Consistent number formatting for Prices, Quantities, and Balances across the Fatima Mill application.
 */

export const formatNumber = (val, decimals = 2) => {
  if (val === null || val === undefined || val === '') {
    return '0.00';
  }
  const cleanVal = typeof val === 'string' ? val.replace(/,/g, '').trim() : val;
  const num = parseFloat(cleanVal);
  if (isNaN(num)) {
    return String(val);
  }
  return num.toLocaleString('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
};

export const formatPrice = val => formatNumber(val, 2);

export const formatQuantity = val => formatNumber(val, 2);

export default {
  formatNumber,
  formatPrice,
  formatQuantity,
};
