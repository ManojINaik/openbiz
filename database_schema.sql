-- Udyam Registration Database Schema
-- PostgreSQL Database Migration

-- Create database (run this as superuser)
-- CREATE DATABASE udyam_db;

-- Connect to the database and create tables

-- Table: registrations
-- Stores main registration data
CREATE TABLE IF NOT EXISTS registrations (
    id SERIAL PRIMARY KEY,
    aadhaar_number VARCHAR(12) NOT NULL UNIQUE,
    entrepreneur_name VARCHAR(100),
    organization_type VARCHAR(50),
    pan_number VARCHAR(10),
    gstin VARCHAR(15),
    filed_itr VARCHAR(3) CHECK (filed_itr IN ('yes', 'no')),
    udyam_number VARCHAR(50) UNIQUE,
    status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft', 'in_progress', 'completed', 'rejected')),
    step_completed INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP,

    -- Constraints
    CONSTRAINT unique_pan_completed CHECK (
        (status != 'completed') OR 
        (status = 'completed' AND pan_number IS NOT NULL)
    ),
    CONSTRAINT valid_aadhaar CHECK (aadhaar_number ~ '^[2-9][0-9]{11}$'),
    CONSTRAINT valid_pan CHECK (pan_number IS NULL OR pan_number ~ '^[A-Z]{5}[0-9]{4}[A-Z]{1}$'),
    CONSTRAINT valid_gstin CHECK (gstin IS NULL OR gstin ~ '^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$')
);

-- Table: otp_verifications
-- Stores OTP verification data with expiration
CREATE TABLE IF NOT EXISTS otp_verifications (
    id SERIAL PRIMARY KEY,
    aadhaar_number VARCHAR(12) NOT NULL,
    otp VARCHAR(6) NOT NULL,
    type VARCHAR(50) NOT NULL DEFAULT 'aadhaar_verification',
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    used_at TIMESTAMP,

    -- Create unique constraint on aadhaar_number and type
    UNIQUE(aadhaar_number, type),

    -- Constraints
    CONSTRAINT valid_otp CHECK (otp ~ '^[0-9]{6}$'),
    CONSTRAINT valid_expiry CHECK (expires_at > created_at)
);

-- Table: form_submissions
-- Audit trail for all form submissions
CREATE TABLE IF NOT EXISTS form_submissions (
    id SERIAL PRIMARY KEY,
    registration_id INTEGER REFERENCES registrations(id) ON DELETE CASCADE,
    step_number INTEGER NOT NULL,
    form_data JSONB NOT NULL,
    ip_address INET,
    user_agent TEXT,
    submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    -- Constraints
    CONSTRAINT valid_step CHECK (step_number BETWEEN 1 AND 10)
);

-- Table: validation_logs
-- Log validation attempts and results
CREATE TABLE IF NOT EXISTS validation_logs (
    id SERIAL PRIMARY KEY,
    registration_id INTEGER REFERENCES registrations(id) ON DELETE SET NULL,
    validation_type VARCHAR(50) NOT NULL,
    field_name VARCHAR(50) NOT NULL,
    field_value VARCHAR(255),
    is_valid BOOLEAN NOT NULL,
    error_message TEXT,
    validated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    -- Note: Index declared later (CREATE INDEX) because inline INDEX is not valid in PostgreSQL
);

-- Table: enterprise_details (for future use in step 3)
-- Extended enterprise information
CREATE TABLE IF NOT EXISTS enterprise_details (
    id SERIAL PRIMARY KEY,
    registration_id INTEGER REFERENCES registrations(id) ON DELETE CASCADE,
    enterprise_name VARCHAR(200),
    major_activity VARCHAR(50) CHECK (major_activity IN ('manufacturing', 'services')),
    nic_codes JSONB, -- Array of NIC codes
    date_of_incorporation DATE,
    date_of_commencement DATE,
    investment_plant_machinery DECIMAL(15,2),
    previous_year_turnover DECIMAL(15,2),
    number_of_employees JSONB, -- {male: 0, female: 0, others: 0}
    bank_account_number VARCHAR(50),
    ifsc_code VARCHAR(11),
    official_address JSONB, -- Complete address object
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    -- Constraints
    UNIQUE(registration_id),
    CONSTRAINT valid_ifsc CHECK (ifsc_code ~ '^[A-Z]{4}0[A-Z0-9]{6}$'),
    CONSTRAINT valid_investment CHECK (investment_plant_machinery >= 0),
    CONSTRAINT valid_turnover CHECK (previous_year_turnover >= 0)
);

-- Create indexes for performance optimization
CREATE INDEX IF NOT EXISTS idx_registrations_aadhaar ON registrations(aadhaar_number);
CREATE INDEX IF NOT EXISTS idx_registrations_pan ON registrations(pan_number);
CREATE INDEX IF NOT EXISTS idx_registrations_status ON registrations(status);
CREATE INDEX IF NOT EXISTS idx_registrations_created_at ON registrations(created_at);
CREATE INDEX IF NOT EXISTS idx_otp_aadhaar_type ON otp_verifications(aadhaar_number, type);
CREATE INDEX IF NOT EXISTS idx_otp_expires_at ON otp_verifications(expires_at);
CREATE INDEX IF NOT EXISTS idx_form_submissions_reg_id ON form_submissions(registration_id);
CREATE INDEX IF NOT EXISTS idx_form_submissions_step ON form_submissions(step_number);

-- Index for validation_logs performance
CREATE INDEX IF NOT EXISTS idx_validation_logs_type_time ON validation_logs(validation_type, validated_at);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for automatic updated_at updates
CREATE TRIGGER update_registrations_updated_at 
    BEFORE UPDATE ON registrations 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_enterprise_details_updated_at 
    BEFORE UPDATE ON enterprise_details 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create function to clean up expired OTPs
CREATE OR REPLACE FUNCTION cleanup_expired_otps()
RETURNS void AS $$
BEGIN
    DELETE FROM otp_verifications 
    WHERE expires_at < CURRENT_TIMESTAMP - INTERVAL '1 day';
END;
$$ language 'plpgsql';

-- Views for reporting and analytics

-- View: registration_summary
-- Summary of registrations by status and date
CREATE OR REPLACE VIEW registration_summary AS
SELECT 
    DATE(created_at) as registration_date,
    status,
    organization_type,
    COUNT(*) as count,
    COUNT(*) FILTER (WHERE step_completed >= 1) as aadhaar_verified,
    COUNT(*) FILTER (WHERE step_completed >= 2) as pan_verified,
    COUNT(*) FILTER (WHERE status = 'completed') as completed_registrations
FROM registrations 
WHERE created_at >= CURRENT_DATE - INTERVAL '30 days'
GROUP BY DATE(created_at), status, organization_type
ORDER BY registration_date DESC;

-- View: daily_statistics
-- Daily registration statistics
CREATE OR REPLACE VIEW daily_statistics AS
SELECT 
    DATE(created_at) as date,
    COUNT(*) as total_registrations,
    COUNT(*) FILTER (WHERE status = 'completed') as completed,
    COUNT(*) FILTER (WHERE status = 'draft') as in_progress,
    ROUND(
        COUNT(*) FILTER (WHERE status = 'completed')::numeric / 
        COUNT(*)::numeric * 100, 2
    ) as completion_rate
FROM registrations 
GROUP BY DATE(created_at)
ORDER BY date DESC;

-- Seed data for testing (optional)
-- INSERT INTO registrations (aadhaar_number, entrepreneur_name, status) 
-- VALUES ('234567890123', 'Test User', 'draft')
-- ON CONFLICT (aadhaar_number) DO NOTHING;

-- Grant permissions (adjust as needed)
-- GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO udyam_app_user;
-- GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO udyam_app_user;

COMMENT ON TABLE registrations IS 'Main table storing Udyam registration applications';
COMMENT ON TABLE otp_verifications IS 'Temporary storage for OTP verification';
COMMENT ON TABLE form_submissions IS 'Audit trail for all form submissions';
COMMENT ON TABLE validation_logs IS 'Logs of field validation attempts';
COMMENT ON TABLE enterprise_details IS 'Extended enterprise information for completed registrations';

COMMENT ON COLUMN registrations.step_completed IS '1: Aadhaar verified, 2: PAN verified, 3: Registration completed';
COMMENT ON COLUMN registrations.udyam_number IS 'Generated Udyam registration number (format: UDYAM-XX-XX-XXXXXXX)';
