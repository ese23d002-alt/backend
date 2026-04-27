CREATE DATABASE IF NOT EXISTS violations_db;
USE violations_db;

CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(100) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  role ENUM('Admin','User') DEFAULT 'User',
  created_at DATETIME DEFAULT NOW()
);

CREATE TABLE violations (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(200) NOT NULL,
  type VARCHAR(200) NOT NULL,
  severity ENUM('low','mid','high') DEFAULT 'low',
  date DATE NOT NULL,
  status ENUM('new','progress','done') DEFAULT 'new',
  created_at DATETIME DEFAULT NOW()
);

INSERT INTO users (username, password, role) VALUES
('admin', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Admin'),
('user',  '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'User');  