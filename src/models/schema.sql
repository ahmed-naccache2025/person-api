CREATE TABLE IF NOT EXISTS persons (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  surname VARCHAR(100) NOT NULL, 
  age INT,
  gender ENUM('male','female'),
  birthday DATE,
  phone VARCHAR(20),
  email VARCHAR(150) UNIQUE NOT NULL,
  created TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  modified TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Junction table for contacts
CREATE TABLE IF NOT EXISTS person_contacts (
  person_id INT,
  contact_id INT,
  PRIMARY KEY (person_id, contact_id),
  FOREIGN KEY (person_id) REFERENCES persons(id) ON DELETE CASCADE,
  FOREIGN KEY (contact_id) REFERENCES persons(id) ON DELETE CASCADE
);
