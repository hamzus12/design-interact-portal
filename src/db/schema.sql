
-- Create the database if it doesn't exist
CREATE DATABASE IF NOT EXISTS jovie_jobs;

-- Use the database
USE jovie_jobs;

-- Create jobs table
CREATE TABLE IF NOT EXISTS jobs (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  company VARCHAR(255) NOT NULL,
  companyLogo VARCHAR(10) NOT NULL,
  location VARCHAR(255) NOT NULL,
  category VARCHAR(100) NOT NULL,
  type VARCHAR(50) NOT NULL,
  timeAgo VARCHAR(50) NOT NULL,
  featured BOOLEAN DEFAULT FALSE,
  logoColor VARCHAR(50) NOT NULL,
  jobType VARCHAR(50),
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert sample data
INSERT INTO jobs (title, company, companyLogo, location, category, type, timeAgo, featured, logoColor, jobType)
VALUES
  ('Post-Room Operate', 'Teast Design LTD', 'V', 'Wadesley Rd, London', 'Accountancy', 'Freelance', '1 Hr Ago', TRUE, 'bg-green-500', 'Full Time'),
  ('Data Entry', 'Techno Inc.', 'T', 'Street 45A, London', 'Data Entry', 'Freelance', '3 Hr Ago', FALSE, 'bg-red-600', 'Part Time'),
  ('Graphic Designer', 'Dewen Design', 'U', 'West Sight, USA', 'Graphics', 'Freelance', '4 Hr Ago', FALSE, 'bg-blue-500', 'Full Time'),
  ('Web Developer', 'MegaNews', 'M', 'San Francisco, California', 'Development', 'Freelance', '5 Hr Ago', FALSE, 'bg-purple-500', 'Remote'),
  ('Digital Marketer', 'All Marketer LTD', 'A', 'Wadesley Rd, London', 'Marketing', 'Full Time', '6 Hr Ago', FALSE, 'bg-pink-500', 'On Site'),
  ('UI/UX Designer', 'Design Master', 'D', 'Zac Rd, London', 'Accountancy', 'Part Time', '8 Hr Ago', FALSE, 'bg-indigo-500', 'Hybrid');
