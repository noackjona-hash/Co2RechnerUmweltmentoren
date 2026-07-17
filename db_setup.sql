-- Create role jona if not exists
DO $$
BEGIN
   IF NOT EXISTS (SELECT FROM pg_catalog.pg_roles WHERE rolname = 'jona') THEN
      CREATE ROLE jona WITH LOGIN PASSWORD 'jonajona';
   END IF;
END
$$;

-- Create database co2_rechner if not exists
SELECT 'CREATE DATABASE co2_rechner OWNER jona' WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'co2_rechner')\gexec

-- Grant privileges on database
GRANT ALL PRIVILEGES ON DATABASE co2_rechner TO jona;

-- Connect to the database and grant schema privileges
\c co2_rechner

GRANT ALL ON SCHEMA public TO jona;
ALTER SCHEMA public OWNER TO jona;
