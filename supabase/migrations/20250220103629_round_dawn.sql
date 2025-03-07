-- Create users table
CREATE TABLE IF NOT EXISTS users (
  id VARCHAR(36) PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  role ENUM('admin', 'user') DEFAULT 'user',
  last_login TIMESTAMP NULL,
  status ENUM('active', 'inactive') DEFAULT 'active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create vehicles table
CREATE TABLE IF NOT EXISTS vehicles (
  id VARCHAR(36) PRIMARY KEY,
  vrn VARCHAR(20) UNIQUE NOT NULL,
  road_tax_expiry DATE,
  fitness_expiry DATE,
  insurance_validity DATE,
  pollution_expiry DATE,
  permit_expiry DATE,
  national_permit_expiry DATE,
  last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  chassis_number VARCHAR(50),
  engine_number VARCHAR(50),
  financer_name VARCHAR(100),
  insurance_company VARCHAR(100),
  blacklist_status BOOLEAN DEFAULT FALSE,
  rto_location VARCHAR(100),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  user_id VARCHAR(36),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Create challans table
CREATE TABLE IF NOT EXISTS challans (
  id VARCHAR(36) PRIMARY KEY,
  vehicle_id VARCHAR(36),
  violation_type VARCHAR(100) NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  status ENUM('pending', 'paid') DEFAULT 'pending',
  location VARCHAR(255),
  issued_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  paid_at TIMESTAMP NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  user_id VARCHAR(36),
  FOREIGN KEY (vehicle_id) REFERENCES vehicles(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Insert demo data
INSERT INTO users (id, email, password, role) VALUES
('1', 'admin@example.com', '$2a$10$xVfLWZ7eOQBOQAS8.O/H6.Kx6bXp5H5gs4ZBECCxm7DJ9H0dXVE2e', 'admin'),
('2', 'user@example.com', '$2a$10$xVfLWZ7eOQBOQAS8.O/H6.Kx6bXp5H5gs4ZBECCxm7DJ9H0dXVE2e', 'user');

INSERT INTO vehicles (id, vrn, road_tax_expiry, fitness_expiry, insurance_validity, user_id) VALUES
('1', 'RJ09GB9453', '2025-03-31', '2024-11-24', '2024-10-16', '1'),
('2', 'RJ09GB9450', '2025-05-12', '2024-05-12', '2024-10-12', '1'),
('3', 'RJ09GB9451', '2025-06-15', '2024-06-15', '2024-11-15', '2');

INSERT INTO challans (id, vehicle_id, violation_type, amount, location, user_id) VALUES
('1', '1', 'Speed Limit Violation', 1000.00, 'Main Street', '1'),
('2', '1', 'Parking Violation', 500.00, 'City Center', '1'),
('3', '2', 'Red Light Violation', 1500.00, 'Highway 101', '1');