export const DISCOUNT_CODES = {
  'KHOGABAMI': 0.18,
  'RAUMANIAN': 0.36,
  'CHUATAYDAU': 0.50,
  'TEAFROMHAND': 0.75,
  'PRISONNOW': 0.90,
  'BANMOITRAINGHIEM': 0.99,
  'LGTV': 0.10,
  'LO': 0.29,
};

export const validateDiscountCode = (code) => {
  return DISCOUNT_CODES[code.toUpperCase()] || null;
};
