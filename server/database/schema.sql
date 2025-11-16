-- BGWealth Database Schema
-- PostgreSQL 14+

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table for authentication
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL DEFAULT 'user' CHECK (role IN ('admin', 'researcher', 'recruiter', 'user')),
    is_active BOOLEAN DEFAULT true,
    email_verified BOOLEAN DEFAULT false,
    last_login TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Members table for recruitment participants
CREATE TABLE members (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    phone VARCHAR(20),
    date_of_birth DATE NOT NULL,
    gender VARCHAR(20),

    -- Address information
    street VARCHAR(100),
    city VARCHAR(50),
    state VARCHAR(50),
    zip_code VARCHAR(10),
    country CHAR(2),

    -- Study-related information
    study_interests TEXT[],
    consent_given BOOLEAN DEFAULT false,
    consent_date TIMESTAMP,

    -- Status tracking
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'withdrawn', 'completed')),
    source VARCHAR(50), -- How they were recruited

    -- Metadata
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by UUID REFERENCES users(id)
);

-- Studies table
CREATE TABLE studies (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(200) NOT NULL,
    description TEXT NOT NULL,
    protocol_number VARCHAR(50) UNIQUE,

    -- Study dates
    start_date DATE NOT NULL,
    end_date DATE,
    enrollment_deadline DATE,

    -- Capacity
    max_participants INTEGER NOT NULL,
    current_participants INTEGER DEFAULT 0,

    -- Status
    status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'paused', 'completed', 'cancelled')),

    -- Eligibility
    eligibility_criteria JSONB,
    min_age INTEGER,
    max_age INTEGER,

    -- Metadata
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by UUID REFERENCES users(id)
);

-- Applications table (linking members to studies)
CREATE TABLE applications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    member_id UUID NOT NULL REFERENCES members(id) ON DELETE CASCADE,
    study_id UUID NOT NULL REFERENCES studies(id) ON DELETE CASCADE,

    -- Application status
    status VARCHAR(20) DEFAULT 'submitted' CHECK (status IN (
        'submitted', 'under_review', 'screening', 'interview_scheduled',
        'approved', 'rejected', 'withdrawn', 'completed'
    )),

    -- Application data
    application_data JSONB,
    screening_score DECIMAL(5,2),

    -- Tracking
    submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    reviewed_at TIMESTAMP,
    reviewed_by UUID REFERENCES users(id),
    decision_notes TEXT,

    -- Interview scheduling
    interview_date TIMESTAMP,
    interview_location VARCHAR(200),
    interview_notes TEXT,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    UNIQUE(member_id, study_id)
);

-- Documents table for file uploads
CREATE TABLE documents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    member_id UUID REFERENCES members(id) ON DELETE CASCADE,
    application_id UUID REFERENCES applications(id) ON DELETE CASCADE,

    file_name VARCHAR(255) NOT NULL,
    file_path VARCHAR(500) NOT NULL,
    file_type VARCHAR(50) NOT NULL,
    file_size INTEGER NOT NULL,
    mime_type VARCHAR(100),

    document_type VARCHAR(50) NOT NULL CHECK (document_type IN (
        'id', 'resume', 'medical_record', 'consent_form', 'other'
    )),

    verified BOOLEAN DEFAULT false,
    verified_by UUID REFERENCES users(id),
    verified_at TIMESTAMP,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    uploaded_by UUID REFERENCES users(id)
);

-- Communication log
CREATE TABLE communications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    member_id UUID NOT NULL REFERENCES members(id) ON DELETE CASCADE,
    application_id UUID REFERENCES applications(id) ON DELETE CASCADE,

    type VARCHAR(20) NOT NULL CHECK (type IN ('email', 'phone', 'sms', 'in_person', 'other')),
    direction VARCHAR(10) NOT NULL CHECK (direction IN ('inbound', 'outbound')),

    subject VARCHAR(200),
    content TEXT,

    sent_by UUID REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Activity audit log
CREATE TABLE audit_log (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id),
    entity_type VARCHAR(50) NOT NULL,
    entity_id UUID,
    action VARCHAR(50) NOT NULL,
    old_values JSONB,
    new_values JSONB,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Dashboard metrics (materialized view for performance)
CREATE MATERIALIZED VIEW dashboard_metrics AS
SELECT
    (SELECT COUNT(*) FROM members WHERE status = 'active') as active_members,
    (SELECT COUNT(*) FROM studies WHERE status = 'active') as active_studies,
    (SELECT COUNT(*) FROM applications WHERE status = 'submitted') as pending_applications,
    (SELECT COUNT(*) FROM applications WHERE status IN ('approved', 'completed')) as successful_placements,
    (SELECT COUNT(*) FROM members WHERE created_at >= CURRENT_DATE - INTERVAL '30 days') as new_members_30d,
    (SELECT AVG(EXTRACT(DAY FROM (reviewed_at - submitted_at)))
     FROM applications
     WHERE reviewed_at IS NOT NULL) as avg_review_time_days;

-- Indexes for performance
CREATE INDEX idx_members_email ON members(email);
CREATE INDEX idx_members_status ON members(status);
CREATE INDEX idx_members_created_at ON members(created_at);
CREATE INDEX idx_studies_status ON studies(status);
CREATE INDEX idx_applications_member_id ON applications(member_id);
CREATE INDEX idx_applications_study_id ON applications(study_id);
CREATE INDEX idx_applications_status ON applications(status);
CREATE INDEX idx_documents_member_id ON documents(member_id);
CREATE INDEX idx_communications_member_id ON communications(member_id);
CREATE INDEX idx_audit_log_user_id ON audit_log(user_id);
CREATE INDEX idx_audit_log_created_at ON audit_log(created_at);

-- Triggers for updated_at timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_members_updated_at BEFORE UPDATE ON members
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_studies_updated_at BEFORE UPDATE ON studies
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_applications_updated_at BEFORE UPDATE ON applications
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to refresh dashboard metrics
CREATE OR REPLACE FUNCTION refresh_dashboard_metrics()
RETURNS void AS $$
BEGIN
    REFRESH MATERIALIZED VIEW dashboard_metrics;
END;
$$ LANGUAGE plpgsql;
