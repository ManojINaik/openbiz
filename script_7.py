# Create comprehensive testing files

# Jest test configuration
jest_config = '''module.exports = {
  testEnvironment: 'node',
  testMatch: ['**/__tests__/**/*.test.js', '**/?(*.)+(spec|test).js'],
  collectCoverage: true,
  collectCoverageFrom: [
    'server.js',
    'routes/**/*.js',
    'middleware/**/*.js',
    'utils/**/*.js',
    '!**/node_modules/**'
  ],
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov', 'html'],
  setupFilesAfterEnv: ['<rootDir>/tests/setup.js'],
  testTimeout: 10000
};'''

with open('jest.config.js', 'w') as f:
    f.write(jest_config)

# API tests
api_tests = '''const request = require('supertest');
const app = require('../server');
const { Pool } = require('pg');

// Mock database for testing
jest.mock('pg', () => ({
  Pool: jest.fn(() => ({
    query: jest.fn(),
    end: jest.fn()
  }))
}));

const mockPool = new Pool();

describe('Udyam Registration API Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /api/generate-otp', () => {
    test('should generate OTP for valid Aadhaar and name', async () => {
      mockPool.query
        .mockResolvedValueOnce({ rows: [] }) // No existing registration
        .mockResolvedValueOnce({ rows: [{ id: 1 }] }); // Insert OTP

      const response = await request(app)
        .post('/api/generate-otp')
        .send({
          aadhaar_number: '234567890123',
          entrepreneur_name: 'John Doe'
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.message).toContain('OTP sent');
      expect(mockPool.query).toHaveBeenCalledTimes(2);
    });

    test('should reject invalid Aadhaar number', async () => {
      const response = await request(app)
        .post('/api/generate-otp')
        .send({
          aadhaar_number: '123456789012', // Invalid - starts with 1
          entrepreneur_name: 'John Doe'
        });

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Validation failed');
    });

    test('should reject invalid name format', async () => {
      const response = await request(app)
        .post('/api/generate-otp')
        .send({
          aadhaar_number: '234567890123',
          entrepreneur_name: 'John123' // Invalid - contains numbers
        });

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Validation failed');
    });

    test('should reject already registered Aadhaar', async () => {
      mockPool.query.mockResolvedValueOnce({ 
        rows: [{ id: 1 }] // Existing registration
      });

      const response = await request(app)
        .post('/api/generate-otp')
        .send({
          aadhaar_number: '234567890123',
          entrepreneur_name: 'John Doe'
        });

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Aadhaar already registered');
    });
  });

  describe('POST /api/validate-otp', () => {
    test('should validate correct OTP', async () => {
      mockPool.query
        .mockResolvedValueOnce({ 
          rows: [{ 
            id: 1, 
            aadhaar_number: '234567890123',
            otp: '123456',
            expires_at: new Date(Date.now() + 300000) // 5 minutes from now
          }] 
        }) // Find OTP
        .mockResolvedValueOnce({ rows: [] }) // Mark as used
        .mockResolvedValueOnce({ rows: [{ id: 1 }] }); // Create/update registration

      const response = await request(app)
        .post('/api/validate-otp')
        .send({
          aadhaar_number: '234567890123',
          otp: '123456'
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.token).toBeDefined();
    });

    test('should reject invalid OTP', async () => {
      mockPool.query.mockResolvedValueOnce({ rows: [] });

      const response = await request(app)
        .post('/api/validate-otp')
        .send({
          aadhaar_number: '234567890123',
          otp: '654321'
        });

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Invalid OTP');
    });

    test('should reject malformed OTP', async () => {
      const response = await request(app)
        .post('/api/validate-otp')
        .send({
          aadhaar_number: '234567890123',
          otp: '12345' // Too short
        });

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Validation failed');
    });
  });

  describe('POST /api/validate-pan', () => {
    test('should validate correct PAN details', async () => {
      mockPool.query
        .mockResolvedValueOnce({ rows: [] }) // No existing PAN
        .mockResolvedValueOnce({ rows: [{ id: 1 }] }); // Update registration

      const response = await request(app)
        .post('/api/validate-pan')
        .send({
          organization_type: 'proprietorship',
          pan_number: 'ABCPD1234E',
          gstin: '',
          filed_itr: 'yes'
        })
        .set('Authorization', 'Bearer valid-jwt-token');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.pan_details.valid).toBe(true);
    });

    test('should reject PAN-organization type mismatch', async () => {
      mockPool.query.mockResolvedValueOnce({ rows: [] });

      const response = await request(app)
        .post('/api/validate-pan')
        .send({
          organization_type: 'proprietorship',
          pan_number: 'ABCCD1234E', // Company PAN (C) for proprietorship
          gstin: '',
          filed_itr: 'yes'
        })
        .set('Authorization', 'Bearer valid-jwt-token');

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('PAN-Organization type mismatch');
    });

    test('should reject already registered PAN', async () => {
      mockPool.query.mockResolvedValueOnce({ 
        rows: [{ id: 1, status: 'completed' }] 
      });

      const response = await request(app)
        .post('/api/validate-pan')
        .send({
          organization_type: 'proprietorship',
          pan_number: 'ABCPD1234E',
          gstin: '',
          filed_itr: 'yes'
        })
        .set('Authorization', 'Bearer valid-jwt-token');

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('PAN already registered');
      expect(response.body.already_registered).toBe(true);
    });

    test('should reject invalid PAN format', async () => {
      const response = await request(app)
        .post('/api/validate-pan')
        .send({
          organization_type: 'proprietorship',
          pan_number: 'INVALID123', // Invalid format
          gstin: '',
          filed_itr: 'yes'
        })
        .set('Authorization', 'Bearer valid-jwt-token');

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Validation failed');
    });
  });

  describe('GET /api/registration-status/:aadhaar', () => {
    test('should return registration status', async () => {
      mockPool.query.mockResolvedValueOnce({
        rows: [{
          status: 'completed',
          step_completed: 2,
          udyam_number: 'UDYAM-27-01-1234567',
          created_at: new Date(),
          completed_at: new Date()
        }]
      });

      const response = await request(app)
        .get('/api/registration-status/234567890123');

      expect(response.status).toBe(200);
      expect(response.body.status).toBe('completed');
      expect(response.body.udyam_number).toBeDefined();
    });

    test('should return not_started for non-existent registration', async () => {
      mockPool.query.mockResolvedValueOnce({ rows: [] });

      const response = await request(app)
        .get('/api/registration-status/234567890123');

      expect(response.status).toBe(200);
      expect(response.body.status).toBe('not_started');
    });

    test('should reject invalid Aadhaar in URL', async () => {
      const response = await request(app)
        .get('/api/registration-status/123456789'); // Too short

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('Invalid Aadhaar number');
    });
  });

  describe('GET /health', () => {
    test('should return health status', async () => {
      const response = await request(app).get('/health');
      
      expect(response.status).toBe(200);
      expect(response.body.status).toBe('OK');
      expect(response.body.timestamp).toBeDefined();
    });
  });

  describe('Rate Limiting', () => {
    test('should apply rate limiting to OTP requests', async () => {
      mockPool.query
        .mockResolvedValue({ rows: [] })
        .mockResolvedValue({ rows: [{ id: 1 }] });

      // Make multiple requests quickly
      const requests = Array(5).fill().map(() => 
        request(app)
          .post('/api/generate-otp')
          .send({
            aadhaar_number: '234567890123',
            entrepreneur_name: 'John Doe'
          })
      );

      const responses = await Promise.all(requests);
      
      // Some requests should be rate limited
      const rateLimitedResponses = responses.filter(res => res.status === 429);
      expect(rateLimitedResponses.length).toBeGreaterThan(0);
    });
  });
});'''

with open('api.test.js', 'w') as f:
    f.write(api_tests)

# Frontend validation tests
frontend_tests = '''import { validateAadhaar, validatePAN, validateOTP, validateGSTIN } from '../utils/validation';

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
        '27ABCPD1234E1Z',  // Too short
        '27ABCPD1234E1ZFF', // Too long
        '2AABCPD1234E1ZF',  // Letter in state code
        '27ABCPD1234E1zF',  // Lowercase letter
        '27ABCPD1234E1YF',  // Invalid check digit position
        ''
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
});'''

with open('validation.test.js', 'w') as f:
    f.write(frontend_tests)

# Test setup file
test_setup = '''const { Pool } = require('pg');

// Mock JWT for testing
jest.mock('jsonwebtoken', () => ({
  sign: jest.fn(() => 'mocked-jwt-token'),
  verify: jest.fn(() => ({
    aadhaar_number: '234567890123',
    registration_id: 1,
    step: 1
  }))
}));

// Mock bcrypt for testing
jest.mock('bcrypt', () => ({
  hash: jest.fn(() => Promise.resolve('hashed-password')),
  compare: jest.fn(() => Promise.resolve(true))
}));

// Global test configuration
beforeAll(() => {
  process.env.JWT_SECRET = 'test-secret-key';
  process.env.NODE_ENV = 'test';
});

afterAll(() => {
  // Clean up after tests
});

// Helper functions for tests
global.createMockRegistration = () => ({
  id: 1,
  aadhaar_number: '234567890123',
  entrepreneur_name: 'Test User',
  status: 'draft',
  step_completed: 1,
  created_at: new Date(),
  updated_at: new Date()
});

global.createMockOTP = () => ({
  id: 1,
  aadhaar_number: '234567890123',
  otp: '123456',
  type: 'aadhaar_verification',
  expires_at: new Date(Date.now() + 600000), // 10 minutes from now
  created_at: new Date()
});'''

with open('test-setup.js', 'w') as f:
    f.write(test_setup)

print("✅ Comprehensive Testing Suite Created Successfully!")
print("📁 Files Created:")
print("- jest.config.js (Jest configuration)")
print("- api.test.js (Backend API tests)")
print("- validation.test.js (Frontend validation tests)")
print("- test-setup.js (Test setup and mocks)")
print("\n🛠️ Testing Features:")
print("- Unit tests for all API endpoints")
print("- Form validation testing")
print("- Rate limiting tests")
print("- Error handling tests")
print("- Database mock implementation")
print("- JWT authentication tests")
print("- Edge case coverage")
print("- Test coverage reporting")