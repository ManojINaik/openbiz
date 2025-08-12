const v = require('./utils/validation');
const arr = [
  '27ABCPD1234E1Z',
  '27ABCPD1234E1ZFF',
  '2AABCPD1234E1ZF',
  '27ABCPD1234E1zF',
  '27ABCPD1234E1YF'
];
console.log(arr.map(s => [s, v.validateGSTIN(s)]));

