SET NAMES utf8mb4;

-- ============================================
-- Inicialización de base de datos - Peluquería
-- ============================================

-- Tabla de clientes -------------------------------------------------
CREATE TABLE IF NOT EXISTS clientes (
  id                INT             PRIMARY KEY AUTO_INCREMENT,
  nombre            VARCHAR(100)    NOT NULL,
  email             VARCHAR(150)    NOT NULL UNIQUE,
  telefono          VARCHAR(20),
  contrasena_hash   VARCHAR(255)    NOT NULL,
  visitas_acumuladas INT            DEFAULT 0,
  fecha_registro    DATETIME        DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de empleados ------------------------------------------------
CREATE TABLE IF NOT EXISTS empleados (
  id              INT             PRIMARY KEY AUTO_INCREMENT,
  nombre          VARCHAR(100)    NOT NULL,
  email           VARCHAR(150)    NOT NULL UNIQUE,
  telefono        VARCHAR(20),
  contrasena_hash VARCHAR(255)    NOT NULL,
  rol             ENUM('admin','empleado') DEFAULT 'empleado',
  activo          BOOLEAN         DEFAULT TRUE
);

-- Tabla de servicios ------------------------------------------------
CREATE TABLE IF NOT EXISTS servicios (
  id                INT             PRIMARY KEY AUTO_INCREMENT,
  nombre            VARCHAR(100)    NOT NULL,
  descripcion       TEXT,
  duracion_minutos  INT             NOT NULL,
  precio            DECIMAL(10,2)   NOT NULL,
  activo            BOOLEAN         DEFAULT TRUE
);

-- Tabla de turnos ---------------------------------------------------
CREATE TABLE IF NOT EXISTS turnos (
  id                    INT       PRIMARY KEY AUTO_INCREMENT,
  cliente_id            INT       NOT NULL,
  empleado_id           INT       NOT NULL,
  servicio_id           INT       NOT NULL,
  fecha                 DATE      NOT NULL,
  hora_inicio           TIME      NOT NULL,
  hora_fin              TIME      NOT NULL,
  estado                ENUM('pendiente','confirmado','cancelado','completado') DEFAULT 'pendiente',
  observaciones         TEXT,
  recordatorio_enviado  BOOLEAN   DEFAULT FALSE,
  FOREIGN KEY (cliente_id)   REFERENCES clientes(id),
  FOREIGN KEY (empleado_id)  REFERENCES empleados(id),
  FOREIGN KEY (servicio_id)  REFERENCES servicios(id)
);

-- Tabla de horarios -------------------------------------------------
CREATE TABLE IF NOT EXISTS horarios (
  id              INT       PRIMARY KEY AUTO_INCREMENT,
  empleado_id     INT       NOT NULL,
  dia_semana      TINYINT   NOT NULL COMMENT '0=Domingo, 1=Lunes ... 6=Sábado',
  hora_apertura   TIME      NOT NULL,
  hora_cierre     TIME      NOT NULL,
  activo          BOOLEAN   DEFAULT TRUE,
  FOREIGN KEY (empleado_id) REFERENCES empleados(id)
);

-- Tabla de configuración de notificaciones --------------------------
CREATE TABLE IF NOT EXISTS confignotificaciones (
  id                    INT             PRIMARY KEY AUTO_INCREMENT,
  horas_antes           INT             NOT NULL DEFAULT 24,
  activo                BOOLEAN         DEFAULT TRUE
);

-- Tabla de configuración de fidelización ----------------------------
CREATE TABLE IF NOT EXISTS configfidelizacion (
  id                    INT             PRIMARY KEY AUTO_INCREMENT,
  visitas_requeridas    INT             NOT NULL,
  descripcion_beneficio TEXT,
  activo                BOOLEAN         DEFAULT TRUE
);

-- ============================================
-- Seed data
-- ============================================

-- Usuarios seed (contraseña: 123456 para todos) --------------------
INSERT IGNORE INTO empleados (id, nombre, email, telefono, contrasena_hash, rol, activo) VALUES
  (1, 'Administrador', 'admin@peluqueria.com', '1111111111', '$2b$10$0Zr61uIJDpRxGVSh.hc3oeJxhCz21RmCQ8zEptnvhc5JeEclMr3b.', 'admin', TRUE),
  (3, 'María García',  'maria@peluqueria.com',  '3334445555', '$2b$10$0Zr61uIJDpRxGVSh.hc3oeJxhCz21RmCQ8zEptnvhc5JeEclMr3b.', 'empleado', TRUE),
  (4, 'Carlos López',  'carlos@peluqueria.com', '4445556666', '$2b$10$0Zr61uIJDpRxGVSh.hc3oeJxhCz21RmCQ8zEptnvhc5JeEclMr3b.', 'empleado', TRUE);

INSERT IGNORE INTO clientes (id, nombre, email, telefono, contrasena_hash, visitas_acumuladas) VALUES
  (1, 'Cliente Demo',    'cliente@peluqueria.com',  '3333333333', '$2b$10$0Zr61uIJDpRxGVSh.hc3oeJxhCz21RmCQ8zEptnvhc5JeEclMr3b.', 6),
  (2, 'Ana Martínez',    'ana@example.com',         '5556667777', '$2b$10$0Zr61uIJDpRxGVSh.hc3oeJxhCz21RmCQ8zEptnvhc5JeEclMr3b.', 3),
  (3, 'Pedro Ramírez',   'pedro@example.com',       '6667778888', '$2b$10$0Zr61uIJDpRxGVSh.hc3oeJxhCz21RmCQ8zEptnvhc5JeEclMr3b.', 1),
  (4, 'Laura Fernández', 'laura@example.com',       '7778889999', '$2b$10$0Zr61uIJDpRxGVSh.hc3oeJxhCz21RmCQ8zEptnvhc5JeEclMr3b.', 0);

-- Servicios de ejemplo ---------------------------------------------
INSERT IGNORE INTO servicios (id, nombre, descripcion, duracion_minutos, precio, activo) VALUES
  (1, 'Corte de cabello',       'Corte clásico con lavado incluido',                 30, 12000, TRUE),
  (2, 'Lavado y peinado',       'Lavado con productos profesionales más peinado',    40, 15000, TRUE),
  (3, 'Tinte completo',         'Coloración completa con productos de primera',      90, 35000, TRUE),
  (4, 'Barba y bigote',         'Arreglo de barba con navaja',                       20,  8000, TRUE),
  (5, 'Corte infantil',         'Corte para niños hasta 12 años',                    25,  9000, TRUE);

-- Horarios del administrador (Lun-Vie 9-18, Sáb 9-14) --------------
INSERT IGNORE INTO horarios (id, empleado_id, dia_semana, hora_apertura, hora_cierre, activo) VALUES
  (1,  1, 1, '09:00', '18:00', TRUE),
  (2,  1, 2, '09:00', '18:00', TRUE),
  (3,  1, 3, '09:00', '18:00', TRUE),
  (4,  1, 4, '09:00', '18:00', TRUE),
  (5,  1, 5, '09:00', '18:00', TRUE),
  (6,  1, 6, '09:00', '14:00', TRUE);

-- Horarios María García (Lun-Vie 8-17) ------------------------------
INSERT IGNORE INTO horarios (id, empleado_id, dia_semana, hora_apertura, hora_cierre, activo) VALUES
  (13, 3, 1, '08:00', '17:00', TRUE),
  (14, 3, 2, '08:00', '17:00', TRUE),
  (15, 3, 3, '08:00', '17:00', TRUE),
  (16, 3, 4, '08:00', '17:00', TRUE),
  (17, 3, 5, '08:00', '17:00', TRUE),
  (18, 3, 6, '08:00', '13:00', TRUE);

-- Horarios Carlos López (Mar-Sáb 11-20) -----------------------------
INSERT IGNORE INTO horarios (id, empleado_id, dia_semana, hora_apertura, hora_cierre, activo) VALUES
  (19, 4, 2, '11:00', '20:00', TRUE),
  (20, 4, 3, '11:00', '20:00', TRUE),
  (21, 4, 4, '11:00', '20:00', TRUE),
  (22, 4, 5, '11:00', '20:00', TRUE),
  (23, 4, 6, '11:00', '18:00', TRUE);

-- Fidelización: 5 visitas → 20% descuento --------------------------
INSERT IGNORE INTO configfidelizacion (id, visitas_requeridas, descripcion_beneficio, activo) VALUES
  (1, 5, '20% de descuento en tu próximo servicio', TRUE);

-- Turnos de ejemplo ---------------------------------------------------
INSERT IGNORE INTO turnos (id, cliente_id, empleado_id, servicio_id, fecha, hora_inicio, hora_fin, estado, observaciones, recordatorio_enviado) VALUES
  (1,  1, 1, 1, '2026-06-08',  '10:00', '10:30', 'completado',  'Corte rápido, quedó conforme',                     TRUE),
  (2,  1, 3, 2, '2026-06-04',  '11:00', '11:40', 'completado',  'Lavado con tratamiento keratina',                  TRUE),
  (3,  2, 3, 1, '2026-06-10',  '09:00', '09:30', 'completado',  'Primera visita, recomendó el servicio',            TRUE),
  (4,  1, 1, 1, '2026-06-09',  '15:00', '15:30', 'completado',  NULL,                                               TRUE),
  (5,  1, 3, 2, '2026-06-11',  '16:00', '16:40', 'completado',  'Peinado para evento',                              TRUE),
  (6,  2, 1, 3, '2026-06-15',  '14:00', '15:30', 'completado',  'Tinte color castaño oscuro',                       TRUE),
  (7,  1, 1, 4, '2026-06-13',  '12:00', '12:20', 'cancelado',   'Canceló por imprevisto',                           TRUE),
  (8,  1, 3, 2, '2026-06-13',  '10:00', '10:40', 'cancelado',   NULL,                                               TRUE),
  (9,  3, 3, 4, '2026-06-16',  '10:00', '10:20', 'confirmado',  'Arreglo de barba completa',                        FALSE),
  (10, 1, 1, 1, '2026-06-16',  '11:00', '11:30', 'pendiente',   NULL,                                               FALSE),
  (11, 2, 3, 5, '2026-06-17',  '09:00', '09:25', 'confirmado',  'Corte para su hijo',                               FALSE),
  (12, 3, 4, 3, '2026-06-18',  '14:00', '15:30', 'pendiente',   'Tinte rubio cenizo',                               FALSE),
  (13, 4, 1, 1, '2026-06-19',  '15:00', '15:30', 'pendiente',   'Quiere probar antes de decidir',                   FALSE),
  (14, 1, 3, 5, '2026-06-20',  '10:00', '10:25', 'pendiente',   'Corte para su hija',                               FALSE);

-- Notificaciones: recordatorio con 24 horas de anticipación ----------
INSERT IGNORE INTO confignotificaciones (id, horas_antes, activo) VALUES
  (1, 24, TRUE);
