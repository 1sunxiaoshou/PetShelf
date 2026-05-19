-- database.sql
-- Create pets table
CREATE TABLE IF NOT EXISTS pets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    manifest_id VARCHAR(100) NOT NULL UNIQUE,
    display_name VARCHAR(100) NOT NULL,
    description TEXT,
    author_id VARCHAR(255) NOT NULL,
    author_name VARCHAR(100) NOT NULL,
    spritesheet_path TEXT NOT NULL,
    downloads_count INT DEFAULT 0,
    likes_count INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Create pet_likes table for many-to-many relationship
CREATE TABLE IF NOT EXISTS pet_likes (
    pet_id UUID REFERENCES pets(id) ON DELETE CASCADE,
    user_id VARCHAR(255) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (pet_id, user_id)
);
