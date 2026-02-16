-- Create Database
CREATE DATABASE IF NOT EXISTS intranet_portal;
USE intranet_portal;

-- Users Table for Authentication
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    employee_id VARCHAR(50) UNIQUE,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    role ENUM('superadmin', 'admin', 'employee') DEFAULT 'employee',
    branch ENUM('Guindy', 'Nungambakkam') DEFAULT NULL,
    department VARCHAR(100),
    position VARCHAR(100),
    birth_date DATE,
    phone VARCHAR(20),
    status ENUM('active', 'inactive', 'suspended') DEFAULT 'active',
    last_login DATETIME,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_email (email),
    INDEX idx_employee_id (employee_id),
    INDEX idx_role (role),
    INDEX idx_status (status),
    INDEX idx_branch (branch)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Sample Superadmin (Handles both branches)
-- Password: superadmin123
INSERT INTO users (employee_id, email, password, first_name, last_name, role, branch, department, position, status, birth_date) 
VALUES (
    'SA001',
    'superadmin@iattechnologies.com',
    'superadmin123', -- Plain text password
    'Super',
    'Admin',
    'superadmin',
    NULL, -- Superadmin has access to all branches
    'Management',
    'Director',
    'active',
    '1980-01-01'
);


-- Sample Admin (Guindy Branch)
-- Password: admin123
INSERT INTO users (employee_id, email, password, first_name, last_name, role, branch, department, position, status, birth_date) 
VALUES (
    'ADM001',
    'admin.guindy@iattechnologies.com',
    'admin123', -- Plain text password
    'Guindy',
    'Admin',
    'admin',
    'Guindy',
    'Operations',
    'Branch Manager',
    'active',
    '1985-06-15'
);

-- Sample Admin (Nungambakkam Branch)
-- Password: admin123
INSERT INTO users (employee_id, email, password, first_name, last_name, role, branch, department, position, status, birth_date) 
VALUES (
    'ADM002',
    'admin.nungambakkam@iattechnologies.com',
    'admin123', -- Plain text password
    'Nungambakkam',
    'Admin',
    'admin',
    'Nungambakkam',
    'Operations',
    'Branch Manager',
    'active',
    '1988-03-22'
);

-- Sample Employee (Guindy Branch)
INSERT INTO users (employee_id, email, password, first_name, last_name, role, branch, department, position, status, birth_date) 
VALUES (
    'EMP001',
    'employee.guindy@iattechnologies.com',
    'employee123', -- Plain text password
    'John',
    'Doe',
    'employee',
    'Guindy',
    'Development',
    'Software Engineer',
    'active',
    '1995-08-10'
);

-- Sessions Table (Optional - for tracking active sessions)
CREATE TABLE IF NOT EXISTS sessions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    token VARCHAR(500) NOT NULL,
    ip_address VARCHAR(45),
    user_agent TEXT,
    expires_at DATETIME NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id),
    INDEX idx_token (token(255)),
    INDEX idx_expires_at (expires_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Password Reset Tokens Table (Optional - for password reset functionality)
CREATE TABLE IF NOT EXISTS password_resets (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    token VARCHAR(255) NOT NULL,
    expires_at DATETIME NOT NULL,
    used BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_token (token),
    INDEX idx_user_id (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Attendance Logs Table
CREATE TABLE IF NOT EXISTS attendance_logs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    date DATE NOT NULL,
    check_in DATETIME NOT NULL,
    check_out DATETIME,
    check_in_remarks TEXT,
    check_out_remarks TEXT,
    status ENUM('active', 'completed') DEFAULT 'active',
    duration_minutes DECIMAL(10, 2) DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id),
    INDEX idx_date (date),
    INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- Events Table
CREATE TABLE IF NOT EXISTS events (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    event_date DATE NOT NULL,
    event_time VARCHAR(50),
    location VARCHAR(255),
    image_url VARCHAR(500),
    created_by INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (created_by) REFERENCES users(id),
    INDEX idx_event_date (event_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Event Images Table
CREATE TABLE IF NOT EXISTS event_images (
    id INT AUTO_INCREMENT PRIMARY KEY,
    event_id INT NOT NULL,
    image_url VARCHAR(500) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE,
    INDEX idx_event_id (event_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
