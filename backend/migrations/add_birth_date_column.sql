-- Migration: Add birth_date column to users table if it doesn't exist
-- Run this SQL script in your MySQL database

USE intranet_portal;

-- Check if birth_date column exists, if not add it
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS birth_date DATE NULL AFTER position;

-- Optional: Add an index for faster queries on birth_date
CREATE INDEX IF NOT EXISTS idx_birth_date ON users(birth_date);

-- Verify the change
DESCRIBE users;
