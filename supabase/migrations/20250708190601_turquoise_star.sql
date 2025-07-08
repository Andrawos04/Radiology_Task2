/*
  # Equipment Management System Database Schema

  1. New Tables
    - `buildings` - Hospital buildings with codes and names
    - `departments` - Departments within buildings
    - `rooms` - Rooms within departments with floor information
    - `manufacturers` - Equipment manufacturers
    - `equipment_types` - Types of medical equipment with GMDN codes
    - `funding_sources` - Funding sources for equipment purchases
    - `equipment` - Main equipment inventory table

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users to read and manage data

  3. Relationships
    - Buildings -> Departments -> Rooms hierarchy
    - Equipment references types, manufacturers, rooms, and funding sources
*/

-- Buildings table
CREATE TABLE IF NOT EXISTS buildings (
  building_id SERIAL PRIMARY KEY,
  building_code TEXT UNIQUE NOT NULL,
  building_name TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE buildings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read buildings"
  ON buildings
  FOR SELECT
  TO authenticated
  USING (true);

-- Departments table
CREATE TABLE IF NOT EXISTS departments (
  department_id SERIAL PRIMARY KEY,
  dept_code TEXT NOT NULL,
  dept_name TEXT NOT NULL,
  building_id INTEGER REFERENCES buildings(building_id),
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE departments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read departments"
  ON departments
  FOR SELECT
  TO authenticated
  USING (true);

-- Rooms table
CREATE TABLE IF NOT EXISTS rooms (
  room_id SERIAL PRIMARY KEY,
  room_code TEXT NOT NULL,
  room_name TEXT NOT NULL,
  department_id INTEGER REFERENCES departments(department_id),
  floor_number INTEGER NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE rooms ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read rooms"
  ON rooms
  FOR SELECT
  TO authenticated
  USING (true);

-- Manufacturers table
CREATE TABLE IF NOT EXISTS manufacturers (
  manufacturer_id SERIAL PRIMARY KEY,
  manufacturer_code TEXT UNIQUE NOT NULL,
  manufacturer_name TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE manufacturers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read manufacturers"
  ON manufacturers
  FOR SELECT
  TO authenticated
  USING (true);

-- Equipment types table
CREATE TABLE IF NOT EXISTS equipment_types (
  equipment_type_id SERIAL PRIMARY KEY,
  type_code TEXT UNIQUE NOT NULL,
  type_name TEXT NOT NULL,
  gmdn_code TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE equipment_types ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read equipment types"
  ON equipment_types
  FOR SELECT
  TO authenticated
  USING (true);

-- Funding sources table
CREATE TABLE IF NOT EXISTS funding_sources (
  funding_id SERIAL PRIMARY KEY,
  funding_code TEXT UNIQUE NOT NULL,
  funding_name TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE funding_sources ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read funding sources"
  ON funding_sources
  FOR SELECT
  TO authenticated
  USING (true);

-- Equipment table
CREATE TABLE IF NOT EXISTS equipment (
  equipment_id SERIAL PRIMARY KEY,
  inventory_code TEXT UNIQUE NOT NULL,
  equipment_name TEXT NOT NULL,
  equipment_type_id INTEGER REFERENCES equipment_types(equipment_type_id),
  manufacturer_id INTEGER REFERENCES manufacturers(manufacturer_id),
  model_number TEXT NOT NULL,
  serial_number TEXT NOT NULL,
  year_manufactured INTEGER,
  purchase_date DATE,
  installation_date DATE,
  commissioning_date DATE,
  warranty_expiry_date DATE,
  purchase_price NUMERIC(12,2),
  current_value NUMERIC(12,2),
  ownership_type TEXT DEFAULT 'OWNED' CHECK (ownership_type IN ('OWNED', 'LEASED', 'RENTAL')),
  room_id INTEGER REFERENCES rooms(room_id),
  equipment_status TEXT DEFAULT 'ACTIVE' CHECK (equipment_status IN ('ACTIVE', 'MAINTENANCE', 'OUT_OF_SERVICE', 'DECOMMISSIONED')),
  condition_rating TEXT DEFAULT 'GOOD' CHECK (condition_rating IN ('EXCELLENT', 'GOOD', 'FAIR', 'POOR')),
  last_maintenance_date DATE,
  next_maintenance_date DATE,
  maintenance_frequency_days INTEGER,
  funding_id INTEGER REFERENCES funding_sources(funding_id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE equipment ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read equipment"
  ON equipment
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can insert equipment"
  ON equipment
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Users can update equipment"
  ON equipment
  FOR UPDATE
  TO authenticated
  USING (true);