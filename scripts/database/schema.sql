-- Bandcestr Database Schema
-- PostgreSQL 15+

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ===========================================
-- CORE TABLES
-- ===========================================

-- Bands Table
CREATE TABLE bands (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    formed_year INTEGER,
    disbanded_year INTEGER,
    location_city VARCHAR(255),
    location_state VARCHAR(100),
    location_country VARCHAR(100) DEFAULT 'United States',
    description TEXT,
    genre_tags TEXT[],
    image_url VARCHAR(512),
    musicbrainz_id VARCHAR(100) UNIQUE,
    spotify_id VARCHAR(100) UNIQUE,
    discogs_id INTEGER,
    verification_status VARCHAR(20) DEFAULT 'pending' CHECK (verification_status IN ('verified', 'pending', 'user_submitted')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- People/Musicians Table
CREATE TABLE people (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    birth_year INTEGER,
    death_year INTEGER,
    location_city VARCHAR(255),
    location_state VARCHAR(100),
    location_country VARCHAR(100),
    biography TEXT,
    instruments TEXT[],
    image_url VARCHAR(512),
    musicbrainz_id VARCHAR(100) UNIQUE,
    is_premium_user BOOLEAN DEFAULT FALSE,
    user_id UUID REFERENCES users(id),
    verification_status VARCHAR(20) DEFAULT 'pending' CHECK (verification_status IN ('verified', 'pending', 'user_submitted')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Memberships (relationships between people and bands)
CREATE TABLE memberships (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    person_id UUID NOT NULL REFERENCES people(id) ON DELETE CASCADE,
    band_id UUID NOT NULL REFERENCES bands(id) ON DELETE CASCADE,
    role VARCHAR(255) NOT NULL,
    start_date DATE,
    end_date DATE,
    is_current BOOLEAN DEFAULT TRUE,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(person_id, band_id, role, start_date)
);

-- Albums Table
CREATE TABLE albums (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(255) NOT NULL,
    band_id UUID NOT NULL REFERENCES bands(id) ON DELETE CASCADE,
    release_date DATE,
    release_year INTEGER,
    album_type VARCHAR(50) CHECK (album_type IN ('studio', 'live', 'compilation', 'ep', 'single')),
    label VARCHAR(255),
    description TEXT,
    cover_art_url VARCHAR(512),
    musicbrainz_id VARCHAR(100) UNIQUE,
    spotify_id VARCHAR(100) UNIQUE,
    discogs_id INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Album Credits (who played what on which album)
CREATE TABLE album_credits (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    album_id UUID NOT NULL REFERENCES albums(id) ON DELETE CASCADE,
    person_id UUID NOT NULL REFERENCES people(id) ON DELETE CASCADE,
    credit_type VARCHAR(255) NOT NULL,
    role VARCHAR(255) NOT NULL,
    track_numbers INTEGER[],
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(album_id, person_id, credit_type, role)
);

-- Users Table (for accounts and premium features)
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(255),
    subscription_tier VARCHAR(20) DEFAULT 'free' CHECK (subscription_tier IN ('free', 'premium')),
    subscription_status VARCHAR(20) DEFAULT 'active' CHECK (subscription_status IN ('active', 'cancelled', 'expired')),
    stripe_customer_id VARCHAR(255) UNIQUE,
    person_id UUID REFERENCES people(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_login_at TIMESTAMP
);

-- Submissions Queue (user-contributed data awaiting moderation)
CREATE TABLE submissions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    submitter_user_id UUID REFERENCES users(id),
    submission_type VARCHAR(50) NOT NULL CHECK (submission_type IN ('band', 'person', 'membership', 'album', 'album_credit')),
    entity_id UUID,
    data_json JSONB NOT NULL,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    moderator_notes TEXT,
    submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    reviewed_at TIMESTAMP,
    reviewed_by UUID REFERENCES users(id)
);

-- Data Sources (track where data came from)
CREATE TABLE data_sources (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    entity_type VARCHAR(50) NOT NULL CHECK (entity_type IN ('band', 'person', 'album', 'membership')),
    entity_id UUID NOT NULL,
    source_name VARCHAR(100) NOT NULL,
    source_id VARCHAR(255),
    confidence_score DECIMAL(3,2) CHECK (confidence_score >= 0 AND confidence_score <= 1),
    imported_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    data_snapshot JSONB
);

-- ===========================================
-- INDEXES FOR PERFORMANCE
-- ===========================================

-- Bands indexes
CREATE INDEX idx_bands_location ON bands(location_city, location_state);
CREATE INDEX idx_bands_genre ON bands USING GIN(genre_tags);
CREATE INDEX idx_bands_formed_year ON bands(formed_year);
CREATE INDEX idx_bands_slug ON bands(slug);

-- People indexes
CREATE INDEX idx_people_slug ON people(slug);
CREATE INDEX idx_people_instruments ON people USING GIN(instruments);

-- Memberships indexes
CREATE INDEX idx_memberships_person ON memberships(person_id);
CREATE INDEX idx_memberships_band ON memberships(band_id);
CREATE INDEX idx_memberships_current ON memberships(is_current);

-- Albums indexes
CREATE INDEX idx_albums_band ON albums(band_id);
CREATE INDEX idx_albums_year ON albums(release_year);

-- Album Credits indexes
CREATE INDEX idx_album_credits_album ON album_credits(album_id);
CREATE INDEX idx_album_credits_person ON album_credits(person_id);

-- Users indexes
CREATE INDEX idx_users_email ON users(email);

-- Submissions indexes
CREATE INDEX idx_submissions_status ON submissions(status);
CREATE INDEX idx_submissions_submitter ON submissions(submitter_user_id);

-- Data Sources indexes
CREATE INDEX idx_data_sources_entity ON data_sources(entity_type, entity_id);

-- ===========================================
-- FUNCTIONS & TRIGGERS
-- ===========================================

-- Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply trigger to all tables with updated_at
CREATE TRIGGER update_bands_updated_at BEFORE UPDATE ON bands
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_people_updated_at BEFORE UPDATE ON people
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_memberships_updated_at BEFORE UPDATE ON memberships
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_albums_updated_at BEFORE UPDATE ON albums
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ===========================================
-- SAMPLE DATA (for development/testing)
-- ===========================================

-- Insert sample band
INSERT INTO bands (name, slug, formed_year, disbanded_year, location_city, location_state, genre_tags, description, verification_status)
VALUES (
    'Fugazi',
    'fugazi',
    1987,
    2003,
    'Washington',
    'D.C.',
    ARRAY['Post-Hardcore', 'Punk', 'Alternative'],
    'Influential DC post-hardcore band known for DIY ethics and $5 shows',
    'verified'
);

-- Insert sample people
INSERT INTO people (name, slug, birth_year, instruments, verification_status)
VALUES 
    ('Ian MacKaye', 'ian-mackaye', 1962, ARRAY['Guitar', 'Vocals'], 'verified'),
    ('Guy Picciotto', 'guy-picciotto', 1965, ARRAY['Guitar', 'Vocals'], 'verified');

-- Insert sample memberships
INSERT INTO memberships (person_id, band_id, role, start_date, end_date, is_current)
SELECT 
    p.id, 
    b.id, 
    'Lead Vocals, Guitar',
    '1987-01-01',
    '2003-12-31',
    FALSE
FROM people p, bands b
WHERE p.slug = 'ian-mackaye' AND b.slug = 'fugazi';

-- ===========================================
-- VIEWS (for common queries)
-- ===========================================

-- Active bands with member count
CREATE OR REPLACE VIEW active_bands_with_members AS
SELECT 
    b.*,
    COUNT(DISTINCT m.person_id) as member_count,
    ARRAY_AGG(DISTINCT p.name) as member_names
FROM bands b
LEFT JOIN memberships m ON b.id = m.band_id AND m.is_current = TRUE
LEFT JOIN people p ON m.person_id = p.id
WHERE b.disbanded_year IS NULL
GROUP BY b.id;

-- People with band count
CREATE OR REPLACE VIEW people_with_band_count AS
SELECT 
    p.*,
    COUNT(DISTINCT m.band_id) as band_count,
    COUNT(DISTINCT ac.album_id) as album_count
FROM people p
LEFT JOIN memberships m ON p.id = m.person_id
LEFT JOIN album_credits ac ON p.id = ac.person_id
GROUP BY p.id;

COMMENT ON TABLE bands IS 'Core table storing band/group information';
COMMENT ON TABLE people IS 'Musicians and other music industry people';
COMMENT ON TABLE memberships IS 'Relationships between people and bands over time - the genealogy core';
COMMENT ON TABLE albums IS 'Album releases by bands';
COMMENT ON TABLE album_credits IS 'Detailed credits for who played what on albums';
