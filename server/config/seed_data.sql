-- =============================================
-- DATOS MÍNIMOS ESENCIALES (Seed Data)
-- =============================================

-- 1. Roles (necesarios para el sistema)
INSERT IGNORE INTO rol (id_rol, nombre_rol, descripcion, activo) VALUES
(1, 'Administrador', 'Acceso total al sistema', 1),
(2, 'Docente', 'Acceso a funciones de docencia', 1),
(3, 'Estudiante', 'Acceso a funciones de estudiante', 1);

-- 2. Niveles educativos
INSERT IGNORE INTO nivel_educativo (id_nivel, nombre_nivel, descripcion, activo) VALUES
(1, 'Preescolar', 'Educación inicial', 1),
(2, 'Primaria', 'Grados 1 a 5', 1),
(3, 'Secundaria', 'Grados 6 a 9', 1),
(4, 'Media', 'Grados 10 a 11', 1);

-- 3. Grados (asociados a niveles educativos)
INSERT IGNORE INTO grado (nombre_grado, orden, activo, nivel_educativo_id_nivel) VALUES
('Grado 1', 1, 1, 2),
('Grado 2', 2, 1, 2),
('Grado 3', 3, 1, 2),
('Grado 4', 4, 1, 2),
('Grado 5', 5, 1, 2),
('Grado 6', 6, 1, 3),
('Grado 7', 7, 1, 3),
('Grado 8', 8, 1, 3),
('Grado 9', 9, 1, 3),
('Grado 10', 10, 1, 4),
('Grado 11', 11, 1, 4);

-- 4. Periodos académicos (por defecto para el año actual)
INSERT IGNORE INTO periodo_academico (nombre_periodo, numero_periodo, anio_escolar, activo, fecha_inicio, fecha_fin) VALUES
('Periodo 1', 1, '2026', 1, '2026-01-20', '2026-03-20'),
('Periodo 2', 2, '2026', 1, '2026-04-01', '2026-06-15'),
('Periodo 3', 3, '2026', 1, '2026-07-01', '2026-09-15'),
('Periodo 4', 4, '2026', 1, '2026-10-01', '2026-11-30');

-- 5. Usuario administrador por defecto (contraseña: Admin123)
INSERT IGNORE INTO persona (tipo_identificacion, numero_identificacion, nombres, apellido_paterno, apellido_materno, fecha_nacimiento, genero, telefono, correo_electronico, direccion) 
VALUES ('CC', '123456789', 'Admin', 'Sistema', 'Principal', '1990-01-01', 'M', '3000000000', 'admin@instandes.edu.co', 'Calle Principal #123');

INSERT IGNORE INTO usuario (rol_id_rol, nombre_usuario, contrasena, correo_electronico, telefono, activo) 
VALUES (1, 'admin', '$2a$10$XlX5lX5lX5lX5lX5lX5lX5lX5lX5lX5lX5lX5l', 'admin@instandes.edu.co', '3000000000', 1);