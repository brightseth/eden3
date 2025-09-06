-- PostgreSQL Initialization Script for Eden3
-- This script sets up the database with proper extensions and configurations

-- Enable UUID extension for generating UUIDs
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Enable pgcrypto for additional cryptographic functions
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Create additional indexes for performance (will be created by Prisma migrations)
-- These are just comments for reference

-- Performance optimization settings
-- These can be adjusted based on production requirements
ALTER DATABASE eden3 SET timezone = 'UTC';

-- Log successful initialization
INSERT INTO pg_stat_statements_info (dealloc) VALUES (0) ON CONFLICT DO NOTHING;

-- Grant necessary permissions
GRANT ALL PRIVILEGES ON DATABASE eden3 TO eden3;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO eden3;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO eden3;
GRANT ALL PRIVILEGES ON ALL FUNCTIONS IN SCHEMA public TO eden3;

-- Set default privileges for future objects
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL PRIVILEGES ON TABLES TO eden3;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL PRIVILEGES ON SEQUENCES TO eden3;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL PRIVILEGES ON FUNCTIONS TO eden3;