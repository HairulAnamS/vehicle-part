export const formatNumber = (num) => {
  if (num === null || num === undefined || num === '') return '';
  if (isNaN(num)) return '0';
  return new Intl.NumberFormat('id-ID').format(num);
};

export const parseNumber = (str) => {
  if (str === undefined || str === null) return '';
  return str.toString().replace(/\./g, '');
};
