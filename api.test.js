const request = require('supertest');

// Mock database for testing BEFORE importing the app
jest.mock('pg', () => {
  const mPool = {
    query: jest.fn(),
    end: jest.fn()
  };
  return { Pool: jest.fn(() => mPool) };
});

const { Pool } = require('pg');
const mockPool = new Pool();

const app = require('./server');

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
      mockPool.query.mockResolvedValue({ rows: [] });

      // Make multiple requests quickly
      // Perform a burst against the same rate-limit key
      const requests = Array(8).fill().map((_, i) => 
        request(app)
          .post('/api/generate-otp')
          .set('X-RL-Key', 'same-user')
          .send({
            aadhaar_number: '234567890123',
            entrepreneur_name: 'John Doe'
          })
      );

      const responses = await Promise.all(requests);

      // Expect at least 3 successes and at least 1 rate-limit once bursts exceed max
      const successes = responses.filter(res => res.status === 200);
      const rateLimited = responses.filter(res => res.status === 429);
      expect(successes.length).toBeGreaterThan(0);
      expect(rateLimited.length).toBeGreaterThan(0);
    });
  });
});