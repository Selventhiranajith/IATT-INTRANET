-- Migration: Create thoughts table for Thought of the Day feature
-- Run this SQL script in your MySQL database

USE intranet_portal;

-- Create thoughts table
CREATE TABLE IF NOT EXISTS thoughts (
    id INT AUTO_INCREMENT PRIMARY KEY,
    content TEXT NOT NULL,
    author VARCHAR(255) NOT NULL,
    branch VARCHAR(50) NOT NULL,
    created_by INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    is_active BOOLEAN DEFAULT TRUE,
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_branch (branch),
    INDEX idx_created_at (created_at),
    INDEX idx_is_active (is_active)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Insert some sample thoughts
INSERT INTO thoughts (content, author, branch, created_by, is_active) VALUES
('Success is not final, failure is not fatal: it is the courage to continue that counts.', 'Winston Churchill', 'Guindy', 1, TRUE),
('The only way to do great work is to love what you do.', 'Steve Jobs', 'Nungambakkam', 1, TRUE),
('Innovation distinguishes between a leader and a follower.', 'Steve Jobs', 'Guindy', 1, TRUE);

-- Verify the table
DESCRIBE thoughts;
SELECT * FROM thoughts;
