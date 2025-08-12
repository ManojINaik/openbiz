const { validateAadhaar, validatePAN, validateOTP, validateGSTIN } = require('./utils/validation');

describe('Form Validation Tests', () => {
  describe('Aadhaar Validation', () => {
    test('should accept valid Aadhaar numbers', () => {
      const validAadhaars = [
        '234567890123',
        '987654321012',
        '556677889900'
      ];

      validAadhaars.forEach(aadhaar => {
        expect(validateAadhaar(aadhaar)).toBe(true);
      });
    });

    test('should reject invalid Aadhaar numbers', () => {
      const invalidAadhaars = [
        '123456789012', // Starts with 1
        '034567890123', // Starts with 0
        '23456789012',  // Too short
        '2345678901234', // Too long
        '23456789012a', // Contains letter
        '234-567-890-123', // Contains hyphens
        ''
      ];

      invalidAadhaars.forEach(aadhaar => {
        expect(validateAadhaar(aadhaar)).toBe(false);
      });
    });
  });

  describe('PAN Validation', () => {
    test('should accept valid PAN numbers', () => {
      const validPANs = [
        'ABCPD1234E', // Person
        'XYZCD5678F', // Company
        'MNOPH9012H', // HUF
        'PQRFG3456T'  // Trust
      ];

      validPANs.forEach(pan => {
        expect(validatePAN(pan)).toBe(true);
      });
    });

    test('should reject invalid PAN numbers', () => {
      const invalidPANs = [
        'ABCD1234E',    // Too short
        'ABCPD12345',   // Missing last letter
        'ABCPD1234e',   // Lowercase letter
        'ABC1D1234E',   // Number in wrong position
        '12CPD1234E',   // Numbers at start
        'ABCPD123EF',   // Too long
        ''
      ];

      invalidPANs.forEach(pan => {
        expect(validatePAN(pan)).toBe(false);
      });
    });
  });

  describe('OTP Validation', () => {
    test('should accept valid OTPs', () => {
      const validOTPs = [
        '123456',
        '000000',
        '999999'
      ];

      validOTPs.forEach(otp => {
        expect(validateOTP(otp)).toBe(true);
      });
    });

    test('should reject invalid OTPs', () => {
      const invalidOTPs = [
        '12345',     // Too short
        '1234567',   // Too long
        '12345a',    // Contains letter
        'abcdef',    // All letters
        '123 456',   // Contains space
        ''
      ];

      invalidOTPs.forEach(otp => {
        expect(validateOTP(otp)).toBe(false);
      });
    });
  });

  describe('GSTIN Validation', () => {
    test('should accept valid GSTIN numbers', () => {
      const validGSTINs = [
        '27ABCPD1234E1ZF',
        '09ABCPD5678F2ZG',
        '19XYZCD9012H3ZH'
      ];

      validGSTINs.forEach(gstin => {
        expect(validateGSTIN(gstin)).toBe(true);
      });
    });

    test('should reject invalid GSTIN numbers', () => {
      const invalidGSTINs = [
        '27ABCPD1234E1Z',   // Too short (14)
        '27ABCPD1234E1ZFF', // Too long (16)
        '2AABCPD1234E1ZF',  // Letter in state code
        '27ABCPD1234E1zF',  // Lowercase letter
        '27ABCPD1234E1YF',  // 14th char not Z
      ];

      invalidGSTINs.forEach(gstin => {
        expect(validateGSTIN(gstin)).toBe(false);
      });
    });

    test('should accept empty GSTIN as valid (optional field)', () => {
      expect(validateGSTIN('')).toBe(true);
      expect(validateGSTIN(null)).toBe(true);
      expect(validateGSTIN(undefined)).toBe(true);
    });
  });
});

describe('Form Integration Tests', () => {
  test('should validate complete Step 1 form data', () => {
    const step1Data = {
      aadhaar_number: '234567890123',
      entrepreneur_name: 'John Doe',
      otp: '123456'
    };

    expect(validateAadhaar(step1Data.aadhaar_number)).toBe(true);
    expect(step1Data.entrepreneur_name.length).toBeGreaterThan(1);
    expect(validateOTP(step1Data.otp)).toBe(true);
  });

  test('should validate complete Step 2 form data', () => {
    const step2Data = {
      organization_type: 'proprietorship',
      pan_number: 'ABCPD1234E',
      gstin: '27ABCPD1234E1ZF',
      filed_itr: 'yes'
    };

    expect(['proprietorship', 'partnership', 'llp', 'pvt_company', 'public_company', 'huf', 'cooperative', 'trust', 'society']).toContain(step2Data.organization_type);
    expect(validatePAN(step2Data.pan_number)).toBe(true);
    expect(validateGSTIN(step2Data.gstin)).toBe(true);
    expect(['yes', 'no']).toContain(step2Data.filed_itr);
  });

  test('should validate PAN-Organization type consistency', () => {
    const testCases = [
      { org: 'proprietorship', pan: 'ABCPD1234E', valid: true },
      { org: 'proprietorship', pan: 'ABCCD1234E', valid: false }, // Company PAN
      { org: 'pvt_company', pan: 'ABCCD1234E', valid: true },
      { org: 'pvt_company', pan: 'ABCPD1234E', valid: false }, // Person PAN
      { org: 'huf', pan: 'ABCHD1234E', valid: true },
      { org: 'trust', pan: 'ABCTD1234E', valid: true }
    ];

    testCases.forEach(({ org, pan, valid }) => {
      const fourthChar = pan.charAt(3);
      const expectedChars = {
        'proprietorship': 'P',
        'partnership': 'F',
        'llp': 'F',
        'pvt_company': 'C',
        'public_company': 'C',
        'huf': 'H',
        'trust': 'T'
      };

      const isConsistent = expectedChars[org] === fourthChar;
      expect(isConsistent).toBe(valid);
    });
  });
});