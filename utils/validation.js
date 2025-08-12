const AADHAAR_REGEX = /^[2-9][0-9]{11}$/;
const PAN_REGEX = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
const OTP_REGEX = /^[0-9]{6}$/;
const GSTIN_REGEX = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;

function validateAadhaar(value) {
  if (typeof value !== 'string') return false;
  return AADHAAR_REGEX.test(value.trim());
}

function validatePAN(value) {
  if (typeof value !== 'string') return false;
  return PAN_REGEX.test(value.trim());
}

function validateOTP(value) {
  if (typeof value !== 'string') return false;
  return OTP_REGEX.test(value.trim());
}

function validateGSTIN(value) {
  if (value === '' || value === null || typeof value === 'undefined') return true;
  if (typeof value !== 'string') return false;
  const v = value.trim();
  if (v.length !== 15) return false;
  if (v !== v.toUpperCase()) return false;
  // Explicit positional checks to avoid false positives
  const isDigit = (c) => c >= '0' && c <= '9';
  const isUpper = (c) => c >= 'A' && c <= 'Z';
  const isAlphaNumNoZero = (c) => (c >= '1' && c <= '9') || isUpper(c);
  const isAlphaNum = (c) => isDigit(c) || isUpper(c);

  // 0-1: state code digits
  if (!isDigit(v[0]) || !isDigit(v[1])) return false;
  // 2-6: letters
  for (let i = 2; i <= 6; i++) if (!isUpper(v[i])) return false;
  // 7-10: digits
  for (let i = 7; i <= 10; i++) if (!isDigit(v[i])) return false;
  // 11: letter
  if (!isUpper(v[11])) return false;
  // 12: 1-9 or A-Z
  if (!isAlphaNumNoZero(v[12])) return false;
  // 13: must be Z
  if (v[13] !== 'Z') return false;
  // 14: 0-9 or A-Z
  if (!isAlphaNum(v[14])) return false;
  return true;
}

module.exports = {
  validateAadhaar,
  validatePAN,
  validateOTP,
  validateGSTIN,
};


