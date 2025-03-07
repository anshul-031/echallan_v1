/*
  # Initial Schema Setup

  1. New Tables
    - users
      - id (uuid, primary key)
      - email (text, unique)
      - created_at (timestamp)
      - role (text)
      - last_login (timestamp)
      - status (text)
    
    - vehicles
      - id (uuid, primary key)
      - vrn (text, unique)
      - road_tax_expiry (date)
      - fitness_expiry (date)
      - insurance_validity (date)
      - pollution_expiry (date)
      - permit_expiry (date)
      - national_permit_expiry (date)
      - last_updated (timestamp)
      - chassis_number (text)
      - engine_number (text)
      - financer_name (text)
      - insurance_company (text)
      - blacklist_status (boolean)
      - rto_location (text)
      - created_at (timestamp)
      - user_id (uuid, foreign key)

    - challans
      - id (uuid, primary key)
      - vehicle_id (uuid, foreign key)
      - violation_type (text)
      - amount (numeric)
      - status (text)
      - location (text)
      - issued_at (timestamp)
      - paid_at (timestamp)
      - created_at (timestamp)
      - user_id (uuid, foreign key)

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users
*/

-- Create users table
CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text UNIQUE NOT NULL,
  role text NOT NULL DEFAULT 'user',
  last_login timestamptz,
  status text NOT NULL DEFAULT 'active',
  created_at timestamptz DEFAULT now()
);

-- Create vehicles table
CREATE TABLE IF NOT EXISTS vehicles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  vrn text UNIQUE NOT NULL,
  road_tax_expiry date,
  fitness_expiry date,
  insurance_validity date,
  pollution_expiry date,
  permit_expiry date,
  national_permit_expiry date,
  last_updated timestamptz DEFAULT now(),
  chassis_number text,
  engine_number text,
  financer_name text,
  insurance_company text,
  blacklist_status boolean DEFAULT false,
  rto_location text,
  created_at timestamptz DEFAULT now(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE
);

-- Create challans table
CREATE TABLE IF NOT EXISTS challans (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  vehicle_id uuid REFERENCES vehicles(id) ON DELETE CASCADE,
  violation_type text NOT NULL,
  amount numeric NOT NULL,
  status text NOT NULL DEFAULT 'pending',
  location text,
  issued_at timestamptz DEFAULT now(),
  paid_at timestamptz,
  created_at timestamptz DEFAULT now(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE
);

-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE vehicles ENABLE ROW LEVEL SECURITY;
ALTER TABLE challans ENABLE ROW LEVEL SECURITY;

-- Create policies for users
CREATE POLICY "Users can read own data"
  ON users
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own data"
  ON users
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

-- Create policies for vehicles
CREATE POLICY "Users can read own vehicles"
  ON vehicles
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert own vehicles"
  ON vehicles
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own vehicles"
  ON vehicles
  FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can delete own vehicles"
  ON vehicles
  FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());

-- Create policies for challans
CREATE POLICY "Users can read own challans"
  ON challans
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert own challans"
  ON challans
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own challans"
  ON challans
  FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can delete own challans"
  ON challans
  FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());