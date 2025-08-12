# Create the React/Next.js frontend implementation with TypeScript

# First, create the main component
react_form_component = '''
"use client";

import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Types
interface FormField {
  name: string;
  label: string;
  type: string;
  required: boolean;
  maxLength?: number;
  placeholder?: string;
  validation?: {
    pattern: string;
    errorMessage: string;
    minLength?: number;
  };
  options?: Array<{
    value: string;
    label: string;
  }>;
}

interface Step {
  step_name: string;
  step_number: number;
  fields: FormField[];
  buttons: Array<{
    name: string;
    label: string;
    type: string;
  }>;
}

interface FormData {
  aadhaar_number: string;
  entrepreneur_name: string;
  otp: string;
  organization_type: string;
  pan_number: string;
  gstin: string;
  filed_itr: string;
}

interface FormErrors {
  [key: string]: string;
}

const UdyamRegistrationForm: React.FC = () => {
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [formData, setFormData] = useState<FormData>({
    aadhaar_number: '',
    entrepreneur_name: '',
    otp: '',
    organization_type: '',
    pan_number: '',
    gstin: '',
    filed_itr: ''
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [loading, setLoading] = useState<boolean>(false);
  const [otpSent, setOtpSent] = useState<boolean>(false);
  const [panValidated, setPanValidated] = useState<boolean>(false);

  // Validation patterns
  const validationPatterns = {
    aadhaar: /^[2-9][0-9]{11}$/,
    pan: /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/,
    otp: /^[0-9]{6}$/,
    gstin: /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/,
    name: /^[a-zA-Z\\s.]+$/
  };

  // Form validation
  const validateField = (fieldName: string, value: string): string => {
    if (!value.trim() && ['aadhaar_number', 'entrepreneur_name', 'organization_type', 'pan_number', 'filed_itr'].includes(fieldName)) {
      return 'This field is required';
    }

    switch (fieldName) {
      case 'aadhaar_number':
        if (!validationPatterns.aadhaar.test(value)) {
          return 'Please enter valid 12-digit Aadhaar number starting with 2-9';
        }
        break;
      case 'entrepreneur_name':
        if (!validationPatterns.name.test(value)) {
          return 'Name should contain only letters, spaces and dots';
        }
        if (value.length < 2) {
          return 'Name must be at least 2 characters long';
        }
        break;
      case 'otp':
        if (otpSent && !validationPatterns.otp.test(value)) {
          return 'Please enter valid 6-digit OTP';
        }
        break;
      case 'pan_number':
        if (!validationPatterns.pan.test(value)) {
          return 'PAN format: AAAAA9999A (5 letters, 4 numbers, 1 letter)';
        }
        break;
      case 'gstin':
        if (value && !validationPatterns.gstin.test(value)) {
          return 'Please enter valid 15-character GSTIN';
        }
        break;
    }
    return '';
  };

  // Handle input change
  const handleInputChange = (fieldName: string, value: string) => {
    // Format input based on field type
    let formattedValue = value;
    
    if (fieldName === 'aadhaar_number') {
      formattedValue = value.replace(/\\D/g, '').slice(0, 12);
    } else if (fieldName === 'pan_number') {
      formattedValue = value.toUpperCase().slice(0, 10);
    } else if (fieldName === 'otp') {
      formattedValue = value.replace(/\\D/g, '').slice(0, 6);
    } else if (fieldName === 'gstin') {
      formattedValue = value.toUpperCase().slice(0, 15);
    }

    setFormData(prev => ({
      ...prev,
      [fieldName]: formattedValue
    }));

    // Clear error when user starts typing
    if (errors[fieldName]) {
      setErrors(prev => ({
        ...prev,
        [fieldName]: ''
      }));
    }

    // Real-time validation
    const error = validateField(fieldName, formattedValue);
    if (error) {
      setErrors(prev => ({
        ...prev,
        [fieldName]: error
      }));
    }
  };

  // Generate OTP
  const handleGenerateOTP = async () => {
    setLoading(true);
    
    try {
      // Validate Aadhaar and name first
      const aadhaarError = validateField('aadhaar_number', formData.aadhaar_number);
      const nameError = validateField('entrepreneur_name', formData.entrepreneur_name);
      
      if (aadhaarError || nameError) {
        setErrors({
          aadhaar_number: aadhaarError,
          entrepreneur_name: nameError
        });
        setLoading(false);
        return;
      }

      // Simulate API call
      const response = await fetch('/api/generate-otp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          aadhaar_number: formData.aadhaar_number,
          entrepreneur_name: formData.entrepreneur_name
        }),
      });

      if (response.ok) {
        setOtpSent(true);
        toast.success('OTP sent to your registered mobile number');
      } else {
        const errorData = await response.json();
        toast.error(errorData.message || 'Failed to generate OTP');
      }
    } catch (error) {
      toast.error('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Validate OTP
  const handleValidateOTP = async () => {
    setLoading(true);
    
    try {
      const otpError = validateField('otp', formData.otp);
      if (otpError) {
        setErrors({ otp: otpError });
        setLoading(false);
        return;
      }

      // Simulate API call
      const response = await fetch('/api/validate-otp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          aadhaar_number: formData.aadhaar_number,
          otp: formData.otp
        }),
      });

      if (response.ok) {
        toast.success('Aadhaar verified successfully');
        setCurrentStep(2);
      } else {
        const errorData = await response.json();
        toast.error(errorData.message || 'Invalid OTP');
      }
    } catch (error) {
      toast.error('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Validate PAN
  const handleValidatePAN = async () => {
    setLoading(true);
    
    try {
      const orgTypeError = !formData.organization_type ? 'Please select organization type' : '';
      const panError = validateField('pan_number', formData.pan_number);
      const gstinError = validateField('gstin', formData.gstin);
      const itrError = !formData.filed_itr ? 'Please select ITR filing status' : '';
      
      if (orgTypeError || panError || gstinError || itrError) {
        setErrors({
          organization_type: orgTypeError,
          pan_number: panError,
          gstin: gstinError,
          filed_itr: itrError
        });
        setLoading(false);
        return;
      }

      // Simulate API call
      const response = await fetch('/api/validate-pan', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          organization_type: formData.organization_type,
          pan_number: formData.pan_number,
          gstin: formData.gstin,
          filed_itr: formData.filed_itr
        }),
      });

      if (response.ok) {
        const responseData = await response.json();
        if (responseData.already_registered) {
          toast.error('Udyam Registration has already been done through this PAN');
        } else {
          toast.success('PAN verified successfully');
          setPanValidated(true);
        }
      } else {
        const errorData = await response.json();
        toast.error(errorData.message || 'PAN validation failed');
      }
    } catch (error) {
      toast.error('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Render Step 1: Aadhaar Verification
  const renderStep1 = () => (
    <div className="step-container">
      <h2 className="step-title">Step 1: Aadhaar Verification with OTP</h2>
      
      <div className="form-group">
        <label htmlFor="aadhaar_number" className="form-label">
          Aadhaar Number / आधार संख्या <span className="required">*</span>
        </label>
        <input
          type="text"
          id="aadhaar_number"
          name="aadhaar_number"
          className={`form-input ${errors.aadhaar_number ? 'error' : ''}`}
          placeholder="Enter 12-digit Aadhaar number"
          value={formData.aadhaar_number}
          onChange={(e) => handleInputChange('aadhaar_number', e.target.value)}
          maxLength={12}
        />
        {errors.aadhaar_number && <span className="error-message">{errors.aadhaar_number}</span>}
      </div>

      <div className="form-group">
        <label htmlFor="entrepreneur_name" className="form-label">
          Name of Entrepreneur / उद्यमी का नाम <span className="required">*</span>
        </label>
        <input
          type="text"
          id="entrepreneur_name"
          name="entrepreneur_name"
          className={`form-input ${errors.entrepreneur_name ? 'error' : ''}`}
          placeholder="Enter name as per Aadhaar"
          value={formData.entrepreneur_name}
          onChange={(e) => handleInputChange('entrepreneur_name', e.target.value)}
        />
        {errors.entrepreneur_name && <span className="error-message">{errors.entrepreneur_name}</span>}
      </div>

      {!otpSent ? (
        <button
          type="button"
          className="btn btn-primary"
          onClick={handleGenerateOTP}
          disabled={loading}
        >
          {loading ? 'Generating...' : 'Validate & Generate OTP'}
        </button>
      ) : (
        <>
          <div className="form-group">
            <label htmlFor="otp" className="form-label">
              Enter OTP <span className="required">*</span>
            </label>
            <input
              type="text"
              id="otp"
              name="otp"
              className={`form-input ${errors.otp ? 'error' : ''}`}
              placeholder="Enter 6-digit OTP"
              value={formData.otp}
              onChange={(e) => handleInputChange('otp', e.target.value)}
              maxLength={6}
            />
            {errors.otp && <span className="error-message">{errors.otp}</span>}
          </div>

          <div className="button-group">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={handleGenerateOTP}
              disabled={loading}
            >
              Resend OTP
            </button>
            <button
              type="button"
              className="btn btn-primary"
              onClick={handleValidateOTP}
              disabled={loading}
            >
              {loading ? 'Validating...' : 'Validate OTP'}
            </button>
          </div>
        </>
      )}
    </div>
  );

  // Render Step 2: PAN Verification
  const renderStep2 = () => (
    <div className="step-container">
      <h2 className="step-title">Step 2: PAN Verification</h2>
      
      <div className="form-group">
        <label htmlFor="organization_type" className="form-label">
          Type of Organisation <span className="required">*</span>
        </label>
        <select
          id="organization_type"
          name="organization_type"
          className={`form-input ${errors.organization_type ? 'error' : ''}`}
          value={formData.organization_type}
          onChange={(e) => handleInputChange('organization_type', e.target.value)}
        >
          <option value="">Select Organisation Type</option>
          <option value="proprietorship">Proprietorship</option>
          <option value="partnership">Partnership Firm</option>
          <option value="llp">Limited Liability Partnership (LLP)</option>
          <option value="pvt_company">Private Limited Company</option>
          <option value="public_company">Public Limited Company</option>
          <option value="huf">Hindu Undivided Family (HUF)</option>
          <option value="cooperative">Co-operative Society</option>
          <option value="trust">Trust</option>
          <option value="society">Society</option>
        </select>
        {errors.organization_type && <span className="error-message">{errors.organization_type}</span>}
      </div>

      <div className="form-group">
        <label htmlFor="pan_number" className="form-label">
          PAN Number <span className="required">*</span>
        </label>
        <input
          type="text"
          id="pan_number"
          name="pan_number"
          className={`form-input ${errors.pan_number ? 'error' : ''}`}
          placeholder="Enter 10-digit PAN"
          value={formData.pan_number}
          onChange={(e) => handleInputChange('pan_number', e.target.value)}
          maxLength={10}
        />
        {errors.pan_number && <span className="error-message">{errors.pan_number}</span>}
        <small className="help-text">Format: AAAAA9999A (5 letters, 4 numbers, 1 letter)</small>
      </div>

      <div className="form-group">
        <label htmlFor="gstin" className="form-label">
          GSTIN (if applicable)
        </label>
        <input
          type="text"
          id="gstin"
          name="gstin"
          className={`form-input ${errors.gstin ? 'error' : ''}`}
          placeholder="Enter GSTIN"
          value={formData.gstin}
          onChange={(e) => handleInputChange('gstin', e.target.value)}
          maxLength={15}
        />
        {errors.gstin && <span className="error-message">{errors.gstin}</span>}
      </div>

      <div className="form-group">
        <label className="form-label">
          Have you filed last year's ITR? <span className="required">*</span>
        </label>
        <div className="radio-group">
          <label className="radio-label">
            <input
              type="radio"
              name="filed_itr"
              value="yes"
              checked={formData.filed_itr === 'yes'}
              onChange={(e) => handleInputChange('filed_itr', e.target.value)}
            />
            Yes
          </label>
          <label className="radio-label">
            <input
              type="radio"
              name="filed_itr"
              value="no"
              checked={formData.filed_itr === 'no'}
              onChange={(e) => handleInputChange('filed_itr', e.target.value)}
            />
            No
          </label>
        </div>
        {errors.filed_itr && <span className="error-message">{errors.filed_itr}</span>}
      </div>

      <div className="button-group">
        <button
          type="button"
          className="btn btn-secondary"
          onClick={() => setCurrentStep(1)}
        >
          Back to Step 1
        </button>
        <button
          type="button"
          className="btn btn-primary"
          onClick={handleValidatePAN}
          disabled={loading}
        >
          {loading ? 'Validating...' : 'Validate PAN'}
        </button>
      </div>

      {panValidated && (
        <div className="success-message">
          <p>✅ PAN verification successful! You can now proceed with the registration.</p>
        </div>
      )}
    </div>
  );

  // Progress tracker
  const ProgressTracker = () => (
    <div className="progress-tracker">
      <div className="progress-steps">
        <div className={`progress-step ${currentStep >= 1 ? 'active' : ''}`}>
          <div className="step-number">1</div>
          <div className="step-label">Aadhaar Verification</div>
        </div>
        <div className={`progress-step ${currentStep >= 2 ? 'active' : ''}`}>
          <div className="step-number">2</div>
          <div className="step-label">PAN Verification</div>
        </div>
        <div className={`progress-step ${currentStep >= 3 ? 'active' : ''}`}>
          <div className="step-number">3</div>
          <div className="step-label">Registration Details</div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="udyam-form-container">
      <div className="form-header">
        <h1>UDYAM REGISTRATION FORM</h1>
        <p>For New Enterprise who are not Registered yet as MSME</p>
      </div>
      
      <ProgressTracker />
      
      <div className="form-content">
        {currentStep === 1 && renderStep1()}
        {currentStep === 2 && renderStep2()}
      </div>
    </div>
  );
};

export default UdyamRegistrationForm;
'''

# Save the React component
with open('UdyamRegistrationForm.tsx', 'w') as f:
    f.write(react_form_component)

print("✅ React/TypeScript Component Created Successfully!")
print("📁 File: UdyamRegistrationForm.tsx")
print("🛠️ Features:")
print("- Real-time validation with regex patterns")
print("- Step-by-step form navigation")
print("- Mobile-responsive design ready")
print("- TypeScript for type safety")
print("- Toast notifications for user feedback")
print("- Auto-formatting for PAN, Aadhaar, OTP fields")