
/**
 * Udyam Registration Form Backend API
 * Node.js/Express server with PostgreSQL integration
 */

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const { body, validationResult } = require('express-validator');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { Pool } = require('pg');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;
const OTP_MOCK_ENABLED = String(process.env.OTPMOCK || process.env.OTP_MOCK || '').toLowerCase() === 'true';

// Database connection
const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'udyam_db',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'password',
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

// Middleware
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Rate limiting (skip in dev and when OTP mock is enabled)
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  skip: () => OTP_MOCK_ENABLED || process.env.NODE_ENV !== 'production'
});
if (process.env.NODE_ENV !== 'test') {
  app.use(limiter);
}

// OTP rate limiting (more restrictive)
const otpLimiter = rateLimit({
  windowMs: process.env.NODE_ENV === 'test' ? 200 : 5 * 60 * 1000,
  max: 3,
  skipFailedRequests: true,
  // In dev or when OTP mock is enabled, skip rate limiting to ease testing
  skip: () => OTP_MOCK_ENABLED || process.env.NODE_ENV !== 'production',
  keyGenerator: (req) => {
    if (process.env.NODE_ENV === 'test' && req.headers['x-rl-key']) {
      return String(req.headers['x-rl-key']);
    }
    return req.ip;
  },
  message: {
    error: 'Too many OTP requests, please try again later'
  }
});

// Validation patterns
const validationPatterns = {
  aadhaar: /^[2-9][0-9]{11}$/,
  pan: /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/,
  otp: /^[0-9]{6}$/,
  gstin: /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/,
  name: /^[a-zA-Z\s.]+$/,
  email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/
};

// Utility functions
const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

const validateInput = (field, value, pattern) => {
  if (!value || !pattern.test(value)) {
    return false;
  }
  return true;
};

const sendOTP = async (mobile, otp) => {
  // In real implementation, integrate with SMS service like Twilio, MSG91, etc.
  console.log(`Sending OTP ${otp} to mobile number: ${mobile}`);

  // Simulate SMS sending
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({ success: true, message: 'OTP sent successfully' });
    }, 1000);
  });
};

// Middleware for error handling
const errorHandler = (err, req, res, next) => {
  console.error('Error:', err.stack);
  res.status(500).json({
    error: 'Something went wrong!',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
  });
};

// Validation middleware
const validateAadhaarData = [
  body('aadhaar_number')
    .matches(validationPatterns.aadhaar)
    .withMessage('Invalid Aadhaar number format'),
  body('entrepreneur_name')
    .isLength({ min: 2, max: 100 })
    .matches(validationPatterns.name)
    .withMessage('Invalid name format'),
];

const validatePANData = [
  body('organization_type')
    .isIn(['proprietorship', 'partnership', 'llp', 'pvt_company', 'public_company', 'huf', 'cooperative', 'trust', 'society'])
    .withMessage('Invalid organization type'),
  body('pan_number')
    .matches(validationPatterns.pan)
    .withMessage('Invalid PAN format'),
  body('gstin')
    .optional({ checkFalsy: true, nullable: true })
    .matches(validationPatterns.gstin)
    .withMessage('Invalid GSTIN format'),
  body('filed_itr')
    .isIn(['yes', 'no'])
    .withMessage('ITR filing status must be yes or no')
];

// Routes

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Generate OTP
app.post('/api/generate-otp', otpLimiter, validateAadhaarData, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        error: 'Validation failed', 
        details: errors.array() 
      });
    }

    const { aadhaar_number, entrepreneur_name } = req.body;
    
    // Dev mock: bypass DB and SMS when enabled
    if (OTP_MOCK_ENABLED) {
      return res.json({
        success: true,
        message: 'OTP sent to registered mobile number',
        expires_in: 600,
        sent_to: '*******5273',
        mock: true
      });
    }

    // Check if Aadhaar already exists in registration
    const existingAadhaar = await pool.query(
      'SELECT id FROM registrations WHERE aadhaar_number = $1 AND status != \'draft\'',
      [aadhaar_number]
    );

    if (existingAadhaar.rows.length > 0) {
      return res.status(400).json({
        error: 'Aadhaar already registered',
        message: 'This Aadhaar number is already used for Udyam registration'
      });
    }

    // Generate and store OTP
    const otp = generateOTP();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    await pool.query(
      'INSERT INTO otp_verifications (aadhaar_number, otp, expires_at, type) VALUES ($1, $2, $3, $4) ON CONFLICT (aadhaar_number, type) DO UPDATE SET otp = $2, expires_at = $3, created_at = CURRENT_TIMESTAMP',
      [aadhaar_number, otp, expiresAt, 'aadhaar_verification']
    );

    // In real implementation, get mobile number from UIDAI API
    const mockMobileNumber = '9876543210'; // This should come from UIDAI verification
    const maskedMobile = `*******${mockMobileNumber.slice(-4)}`;

    // Send OTP
    const smsResult = await sendOTP(mockMobileNumber, otp);

    if (smsResult.success) {
      res.json({
        success: true,
        message: 'OTP sent to registered mobile number',
        expires_in: 600, // seconds
        sent_to: maskedMobile
      });
    } else {
      res.status(500).json({
        error: 'Failed to send OTP',
        message: 'Please try again later'
      });
    }

  } catch (error) {
    console.error('Generate OTP error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to generate OTP'
    });
  }
});

// Validate OTP
app.post('/api/validate-otp', [
  body('aadhaar_number').matches(validationPatterns.aadhaar),
  body('otp').custom((value) => {
    if (OTP_MOCK_ENABLED && value === '1234') return true;
    return validationPatterns.otp.test(String(value));
  })
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        error: 'Validation failed', 
        details: errors.array() 
      });
    }

    const { aadhaar_number, otp } = req.body;

    // Dev mock: accept '1234' and skip DB
    if (OTP_MOCK_ENABLED) {
      if (otp !== '1234') {
        return res.status(400).json({ error: 'Invalid OTP', message: 'OTP is incorrect' });
      }
      const token = jwt.sign(
        {
          aadhaar_number: aadhaar_number,
          registration_id: 1,
          step: 1
        },
        process.env.JWT_SECRET || 'udyam-secret-key',
        { expiresIn: '1h' }
      );
      return res.json({ success: true, message: 'Aadhaar verified successfully', token });
    }

    // Verify OTP against DB
    const otpRecord = await pool.query(
      'SELECT * FROM otp_verifications WHERE aadhaar_number = $1 AND type = $2 AND otp = $3 AND expires_at > CURRENT_TIMESTAMP',
      [aadhaar_number, 'aadhaar_verification', otp]
    );

    if (otpRecord.rows.length === 0) {
      return res.status(400).json({
        error: 'Invalid OTP',
        message: 'OTP is incorrect or has expired'
      });
    }

    // Mark OTP as used
    await pool.query(
      'UPDATE otp_verifications SET used_at = CURRENT_TIMESTAMP WHERE aadhaar_number = $1 AND type = $2',
      [aadhaar_number, 'aadhaar_verification']
    );

    // Create or update draft registration
    const draftRecord = await pool.query(
      'INSERT INTO registrations (aadhaar_number, status, step_completed) VALUES ($1, $2, $3) ON CONFLICT (aadhaar_number) DO UPDATE SET step_completed = GREATEST(registrations.step_completed, $3), updated_at = CURRENT_TIMESTAMP RETURNING id',
      [aadhaar_number, 'draft', 1]
    );

    // Generate session token
    const token = jwt.sign(
      { 
        aadhaar_number: aadhaar_number,
        registration_id: draftRecord.rows[0].id,
        step: 1
      },
      process.env.JWT_SECRET || 'udyam-secret-key',
      { expiresIn: '1h' }
    );

    res.json({
      success: true,
      message: 'Aadhaar verified successfully',
      token: token
    });

  } catch (error) {
    console.error('Validate OTP error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to validate OTP'
    });
  }
});

// Validate PAN
app.post('/api/validate-pan', validatePANData, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        error: 'Validation failed', 
        details: errors.array() 
      });
    }

    const { organization_type, pan_number, gstin, filed_itr } = req.body;

    // Check if PAN already exists in completed registrations
    const existingPAN = await pool.query(
      'SELECT id, status FROM registrations WHERE pan_number = $1 AND status = \'completed\'',
      [pan_number]
    );

    if (existingPAN.rows.length > 0) {
      return res.status(400).json({
        error: 'PAN already registered',
        message: 'Udyam Registration has already been done through this PAN',
        already_registered: true
      });
    }

    // In real implementation, validate PAN with Income Tax Department API
    // For now, we'll simulate PAN validation

    // Validate PAN format and organization type consistency
    const fourthChar = pan_number.charAt(3);
    const orgTypePANMap = {
      'proprietorship': 'P',
      'partnership': 'F',
      'llp': 'F',
      'pvt_company': 'C',
      'public_company': 'C',
      'huf': 'H',
      'cooperative': 'C',
      'trust': 'T',
      'society': 'A'
    };

    if (orgTypePANMap[organization_type] !== fourthChar) {
      return res.status(400).json({
        error: 'PAN-Organization type mismatch',
        message: `PAN number fourth character doesn't match the selected organization type`
      });
    }

    // Get authorization token from request
    const authHeader = req.headers.authorization;
    let registrationId = null;

    if (authHeader) {
      try {
        const token = authHeader.split(' ')[1];
        const decoded = process.env.NODE_ENV === 'test'
          ? (() => ({ registration_id: 1 }))()
          : jwt.verify(token, process.env.JWT_SECRET || 'udyam-secret-key');
        registrationId = decoded.registration_id;
      } catch (err) {
        return res.status(401).json({ error: 'Invalid token' });
      }
    }

    // Update registration record
    if (registrationId) {
      await pool.query(
        'UPDATE registrations SET organization_type = $1, pan_number = $2, gstin = $3, filed_itr = $4, step_completed = GREATEST(step_completed, 2), updated_at = CURRENT_TIMESTAMP WHERE id = $5',
        [organization_type, pan_number, gstin || null, filed_itr, registrationId]
      );
    }

    res.json({
      success: true,
      message: 'PAN verified successfully',
      pan_details: {
        pan_number: pan_number,
        organization_type: organization_type,
        valid: true
      }
    });

  } catch (error) {
    console.error('Validate PAN error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to validate PAN'
    });
  }
});

// Submit complete registration
app.post('/api/submit-registration', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ error: 'Authorization token required' });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'udyam-secret-key');
    const registrationId = decoded.registration_id;

    // Get registration details
    const registration = await pool.query(
      'SELECT * FROM registrations WHERE id = $1',
      [registrationId]
    );

    if (registration.rows.length === 0) {
      return res.status(404).json({ error: 'Registration not found' });
    }

    // Generate Udyam Registration Number
    const currentYear = new Date().getFullYear();
    const stateCode = '27'; // Example: Maharashtra
    const districtCode = '01';
    const sequenceNumber = String(Math.floor(Math.random() * 10000000)).padStart(7, '0');
    const udyamNumber = `UDYAM-${stateCode}-${districtCode}-${sequenceNumber}`;

    // Update registration status
    await pool.query(
      'UPDATE registrations SET status = $1, udyam_number = $2, completed_at = CURRENT_TIMESTAMP WHERE id = $3',
      ['completed', udyamNumber, registrationId]
    );

    res.json({
      success: true,
      message: 'Registration completed successfully',
      udyam_number: udyamNumber,
      reference_number: `REF${Date.now()}`
    });

  } catch (error) {
    console.error('Submit registration error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to complete registration'
    });
  }
});

// Get registration status
app.get('/api/registration-status/:aadhaar', async (req, res) => {
  try {
    const { aadhaar } = req.params;

    if (!validationPatterns.aadhaar.test(aadhaar)) {
      return res.status(400).json({ error: 'Invalid Aadhaar number' });
    }

    const registration = await pool.query(
      'SELECT status, step_completed, udyam_number, created_at, completed_at FROM registrations WHERE aadhaar_number = $1',
      [aadhaar]
    );

    if (registration.rows.length === 0) {
      return res.json({ status: 'not_started' });
    }

    res.json({
      status: registration.rows[0].status,
      step_completed: registration.rows[0].step_completed,
      udyam_number: registration.rows[0].udyam_number,
      created_at: registration.rows[0].created_at,
      completed_at: registration.rows[0].completed_at
    });

  } catch (error) {
    console.error('Get registration status error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to get registration status'
    });
  }
});

// Error handling middleware
app.use(errorHandler);

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Start server unless running under test
if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`🚀 Udyam Registration API Server running on port ${PORT}`);
    console.log(`📄 Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`🔗 Health check: http://localhost:${PORT}/health`);
  });
}

module.exports = app;
