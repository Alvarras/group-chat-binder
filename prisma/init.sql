-- Initialize the database with any extensions or configurations
-- This file is run when the PostgreSQL container starts

-- Enable UUID extension (if needed)
-- CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Set timezone
SET timezone = 'UTC';

-- Create database if it doesn't exist
-- (The database is already created by POSTGRES_DB environment variable)