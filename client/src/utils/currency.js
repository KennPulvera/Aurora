// Currency utility functions for Philippine Peso

/**
 * Format amount to Philippine Peso currency
 * @param {number} amount - The amount to format
 * @returns {string} - Formatted currency string
 */
export const formatPHP = (amount) => {
  if (amount === null || amount === undefined || isNaN(amount)) {
    return '₱0.00';
  }
  
  return new Intl.NumberFormat('en-PH', {
    style: 'currency',
    currency: 'PHP',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(amount);
};

export default currencyUtils;

/**
 * Format amount to simple peso string without currency symbol
 * @param {number} amount - The amount to format
 * @returns {string} - Formatted amount string
 */
export const formatAmount = (amount) => {
  if (amount === null || amount === undefined || isNaN(amount)) {
    return '0.00';
  }
  
  return new Intl.NumberFormat('en-PH', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(amount);
};

/**
 * Format amount with peso symbol
 * @param {number} amount - The amount to format
 * @returns {string} - Formatted currency string with ₱ symbol
 */
export const formatPeso = (amount) => {
  if (amount === null || amount === undefined || isNaN(amount)) {
    return '₱0.00';
  }
  
  return `₱${formatAmount(amount)}`;
};

/**
 * Parse currency string to number
 * @param {string} currencyString - The currency string to parse
 * @returns {number} - Parsed number
 */
export const parseCurrency = (currencyString) => {
  if (!currencyString) return 0;
  
  // Remove currency symbols and spaces, then parse
  const cleanString = currencyString.replace(/[₱,$\s]/g, '');
  return parseFloat(cleanString) || 0;
};

/**
 * Currency configuration for forms and inputs
 */
export const currencyConfig = {
  locale: 'en-PH',
  currency: 'PHP',
  symbol: '₱',
  name: 'Philippine Peso',
  code: 'PHP'
};

const currencyUtils = {
  formatPHP,
  formatAmount,
  formatPeso,
  parseCurrency,
  currencyConfig
};