process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'udyam-secret-key';
const { Pool } = require('pg');

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
});