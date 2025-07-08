/*
  # Insert Initial Data

  1. Reference Data
    - Buildings, departments, rooms
    - Manufacturers and equipment types
    - Funding sources

  2. Sample Equipment
    - Initial equipment inventory data
*/

-- Insert buildings
INSERT INTO buildings (building_id, building_code, building_name) VALUES
  (1, 'MAIN', 'Main Hospital Building'),
  (2, 'OUTPT', 'Outpatient Imaging Center'),
  (3, 'EMRG', 'Emergency Department')
ON CONFLICT (building_id) DO NOTHING;

-- Insert departments
INSERT INTO departments (department_id, dept_code, dept_name, building_id) VALUES
  (1, 'RA', 'Radiology', 1),
  (2, 'ER', 'Emergency Radiology', 3),
  (3, 'OI', 'Outpatient Imaging', 2),
  (4, 'NM', 'Nuclear Medicine', 1),
  (5, 'US', 'Ultrasound', 1)
ON CONFLICT (department_id) DO NOTHING;

-- Insert rooms
INSERT INTO rooms (room_id, room_code, room_name, department_id, floor_number) VALUES
  (1, '01', 'CT Scanner Room 1', 1, 1),
  (2, '02', 'MRI Suite 1', 1, 1),
  (3, '03', 'X-Ray Room 1', 1, 1),
  (4, '04', 'Mammography Suite', 1, 2),
  (5, '05', 'Ultrasound Room 1', 5, 2),
  (6, '06', 'DEXA Room', 1, 1)
ON CONFLICT (room_id) DO NOTHING;

-- Insert manufacturers
INSERT INTO manufacturers (manufacturer_id, manufacturer_code, manufacturer_name) VALUES
  (1, 'GE', 'GE Healthcare'),
  (2, 'SIE', 'Siemens Healthineers'),
  (3, 'PHI', 'Philips Healthcare'),
  (4, 'HIT', 'Hitachi Medical'),
  (5, 'CAN', 'Canon Medical Systems'),
  (6, 'HOL', 'Hologic Inc.')
ON CONFLICT (manufacturer_id) DO NOTHING;

-- Insert equipment types
INSERT INTO equipment_types (equipment_type_id, type_code, type_name, gmdn_code) VALUES
  (1, 'XRA', 'X-Ray System', '37644'),
  (2, 'MRI', 'MRI Scanner', '37708'),
  (3, 'CTX', 'CT Scanner', '37975'),
  (4, 'USC', 'Ultrasound System', '13275'),
  (5, 'MAM', 'Mammography System', '37672'),
  (6, 'DXA', 'DEXA Scanner', '36987')
ON CONFLICT (equipment_type_id) DO NOTHING;

-- Insert funding sources
INSERT INTO funding_sources (funding_id, funding_code, funding_name) VALUES
  (1, 'CAP-2024-001', 'Capital Equipment Fund 2024'),
  (2, 'GRANT-NIH-001', 'NIH Research Grant'),
  (3, 'DON-SMITH-001', 'Smith Family Foundation'),
  (4, 'LEASE-2024', 'Equipment Lease Program')
ON CONFLICT (funding_id) DO NOTHING;

-- Insert sample equipment
INSERT INTO equipment (
  equipment_id, inventory_code, equipment_name, equipment_type_id, manufacturer_id,
  model_number, serial_number, year_manufactured, purchase_date, installation_date,
  commissioning_date, warranty_expiry_date, purchase_price, current_value,
  ownership_type, room_id, equipment_status, condition_rating,
  last_maintenance_date, next_maintenance_date, maintenance_frequency_days, funding_id
) VALUES
  (1, 'XRA-RA-1-01-0001', 'Digital Radiography System', 1, 1, 'Discovery XR656', 'GE12345XR001', 2023, '2023-03-15', '2023-04-10', '2023-04-15', '2026-03-15', 285000.00, 250000.00, 'OWNED', 3, 'ACTIVE', 'EXCELLENT', '2024-06-10', '2024-09-10', 90, 1),
  (2, 'MRI-RA-1-02-0001', '3.0T MRI Scanner', 2, 2, 'MAGNETOM Vida', 'SIE67890MR001', 2022, '2022-08-20', '2022-10-15', '2022-11-01', '2025-08-20', 2500000.00, 2200000.00, 'OWNED', 2, 'ACTIVE', 'GOOD', '2024-05-01', '2024-11-01', 180, 2),
  (3, 'CTX-RA-1-01-0001', '128-Slice CT Scanner', 3, 1, 'Revolution CT', 'GE54321CT001', 2024, '2024-01-10', '2024-02-20', '2024-03-01', '2027-01-10', 1800000.00, 1800000.00, 'OWNED', 1, 'ACTIVE', 'EXCELLENT', '2024-06-01', '2024-09-01', 90, 1),
  (4, 'MAM-RA-2-04-0001', '3D Mammography System', 5, 6, 'Selenia Dimensions', 'HOL98765MAM01', 2021, '2021-11-01', '2021-11-20', '2021-12-01', '2024-11-01', 450000.00, 350000.00, 'OWNED', 4, 'MAINTENANCE', 'GOOD', '2024-07-01', '2025-01-01', 180, 3),
  (5, 'USC-US-2-05-0001', 'General Ultrasound System', 4, 3, 'EPIQ Elite', 'PHI24680US01', 2023, '2023-05-10', '2023-05-15', '2023-05-16', '2026-05-10', 150000.00, 135000.00, 'LEASED', 5, 'ACTIVE', 'EXCELLENT', '2024-05-15', '2025-05-15', 365, 4),
  (6, 'XRA-ER-1-03-0002', 'Mobile X-Ray Unit', 1, 2, 'Mobilett Elara Max', 'SIE55555XR02', 2020, '2020-09-01', '2020-09-05', '2020-09-06', '2023-09-01', 180000.00, 110000.00, 'OWNED', 3, 'OUT_OF_SERVICE', 'POOR', '2024-02-15', '2024-08-15', 180, 1),
  (7, 'DXA-RA-1-06-0001', 'Bone Densitometer', 6, 6, 'Horizon DXA', 'HOL11223DXA01', 2022, '2022-07-20', '2022-08-01', '2022-08-02', '2025-07-20', 95000.00, 80000.00, 'OWNED', 6, 'ACTIVE', 'EXCELLENT', '2024-07-15', '2024-08-12', 365, 3)
ON CONFLICT (equipment_id) DO NOTHING;