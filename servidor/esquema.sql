CREATE TABLE IF NOT EXISTS clientes (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(100) NOT NULL,
  email VARCHAR(150) NOT NULL UNIQUE,
  telefono VARCHAR(20) NOT NULL,
  contrasena_hash VARCHAR(255) NOT NULL,
  visitas_acumuladas INT DEFAULT 0,
  fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS empleados (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(100) NOT NULL,
  email VARCHAR(150) NOT NULL UNIQUE,
  telefono VARCHAR(20) NOT NULL,
  contrasena_hash VARCHAR(255) NOT NULL,
  rol ENUM('admin', 'empleado') DEFAULT 'empleado',
  activo BOOLEAN DEFAULT TRUE
);

INSERT INTO empleados (nombre, email, telefono, contrasena_hash, rol) VALUES
('Administrador', 'admin@peluqueria.com', '123456789', '$2b$10$.kOC45A5IyyzaKKf.OqUIeGKyKIGVQbKPTX5o74gmtTwCP1vzL9g2', 'admin')
ON DUPLICATE KEY UPDATE nombre = nombre;
