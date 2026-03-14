CREATE DATABASE IF NOT EXISTS campus_intelligence;
USE campus_intelligence;

-- Drop existing tables to ensure clean Phase 3 setup
SET FOREIGN_KEY_CHECKS = 0;
DROP TABLE IF EXISTS mess_reports;
DROP TABLE IF EXISTS counseling_reports;
DROP TABLE IF EXISTS resource_metrics;
DROP TABLE IF EXISTS room_allocations;
DROP TABLE IF EXISTS hostel_rooms;
DROP TABLE IF EXISTS documents;
DROP TABLE IF EXISTS student_profiles;
DROP TABLE IF EXISTS users;
SET FOREIGN_KEY_CHECKS = 1;

-- Users table handles all roles: Student, Counselor, Admin, HostelManager
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role ENUM('student', 'counselor', 'admin', 'hostel_manager') NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Student Profiles (extends users for students)
CREATE TABLE IF NOT EXISTS student_profiles (
    user_id INT PRIMARY KEY,
    department VARCHAR(100),
    semester VARCHAR(50),
    cgpa DECIMAL(3,2),
    attendance_percentage INT,
    counseling_preference ENUM('needed', 'not_needed') DEFAULT 'not_needed',
    self_reported_stress INT, -- 1 to 10 scale
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Uploaded Documents
CREATE TABLE IF NOT EXISTS documents (
    id INT AUTO_INCREMENT PRIMARY KEY,
    student_id INT NOT NULL,
    doc_type ENUM('marks_memo', 'medical_report', 'attendance_screenshot', 'other') NOT NULL,
    file_path VARCHAR(255) NOT NULL,
    status ENUM('pending', 'approved', 'rejected') DEFAULT 'pending',
    uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (student_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Hostel Rooms
CREATE TABLE IF NOT EXISTS hostel_rooms (
    id INT AUTO_INCREMENT PRIMARY KEY,
    room_number VARCHAR(20) UNIQUE NOT NULL,
    capacity INT NOT NULL,
    current_occupancy INT DEFAULT 0,
    status ENUM('available', 'full', 'maintenance') DEFAULT 'available'
);

-- Room Allocations
CREATE TABLE IF NOT EXISTS room_allocations (
    id INT AUTO_INCREMENT PRIMARY KEY,
    student_id INT NOT NULL,
    room_id INT NOT NULL,
    allocated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (student_id) REFERENCES users(id),
    FOREIGN KEY (room_id) REFERENCES hostel_rooms(id)
);

-- Counseling Reports & AI Analysis
CREATE TABLE IF NOT EXISTS counseling_reports (
    id INT AUTO_INCREMENT PRIMARY KEY,
    student_id INT NOT NULL,
    counselor_id INT NOT NULL,
    report_text TEXT,
    action_type ENUM('session', 'suggestions') NOT NULL,
    risk_score INT, -- AI Risk Analyzer output
    ai_risk_report TEXT, -- Multi-line AI analysis
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (student_id) REFERENCES users(id),
    FOREIGN KEY (counselor_id) REFERENCES users(id)
);

-- Mess Attendance
CREATE TABLE IF NOT EXISTS mess_reports (
    id INT AUTO_INCREMENT PRIMARY KEY,
    student_id INT NOT NULL,
    meal_type ENUM('breakfast', 'lunch', 'dinner') NOT NULL,
    attended_at DATE NOT NULL,
    FOREIGN KEY (student_id) REFERENCES users(id)
);
