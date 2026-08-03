-- MySQL dump 10.13  Distrib 8.4.10, for Linux (x86_64)
--

-- ------------------------------------------------------
-- Server version	8.4.2-2

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `administrativo`
--

DROP TABLE IF EXISTS `administrativo`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `administrativo` (
  `id_administrativo` int NOT NULL AUTO_INCREMENT,
  `codigo_empleado` varchar(20) NOT NULL,
  `cargo` varchar(100) NOT NULL,
  `fecha_ingreso` date NOT NULL,
  `estado` enum('activo','inactivo','licencia','retirado','vacaciones') NOT NULL DEFAULT 'activo',
  `persona_id_persona` int NOT NULL,
  `usuario_id_usuario` int NOT NULL,
  PRIMARY KEY (`id_administrativo`),
  UNIQUE KEY `codigo_empleado_UNIQUE` (`codigo_empleado`),
  KEY `fk_administrativo_persona1_idx` (`persona_id_persona`),
  KEY `fk_administrativo_usuario1_idx` (`usuario_id_usuario`),
  CONSTRAINT `fk_administrativo_persona1` FOREIGN KEY (`persona_id_persona`) REFERENCES `persona` (`id_persona`),
  CONSTRAINT `fk_administrativo_usuario1` FOREIGN KEY (`usuario_id_usuario`) REFERENCES `usuario` (`id_usuario`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `asignacion_materia`
--

DROP TABLE IF EXISTS `asignacion_materia`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `asignacion_materia` (
  `id_asignacion` int NOT NULL AUTO_INCREMENT,
  `anio_escolar` varchar(9) NOT NULL,
  `activo` tinyint NOT NULL DEFAULT '1',
  `materia_id_materia` int NOT NULL,
  `grupo_id_grupo` int NOT NULL,
  `docente_id_docente` int NOT NULL,
  `fecha_creacion` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id_asignacion`),
  KEY `fk_asignacion_materia_materia1_idx` (`materia_id_materia`),
  KEY `fk_asignacion_materia_grupo1_idx` (`grupo_id_grupo`),
  KEY `fk_asignacion_materia_docente1_idx` (`docente_id_docente`),
  CONSTRAINT `fk_asignacion_materia_docente1` FOREIGN KEY (`docente_id_docente`) REFERENCES `docente` (`id_docente`),
  CONSTRAINT `fk_asignacion_materia_grupo1` FOREIGN KEY (`grupo_id_grupo`) REFERENCES `grupo` (`id_grupo`),
  CONSTRAINT `fk_asignacion_materia_materia1` FOREIGN KEY (`materia_id_materia`) REFERENCES `materia` (`id_materia`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb3;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `bitacora_sistema`
--

DROP TABLE IF EXISTS `bitacora_sistema`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `bitacora_sistema` (
  `id_bitacora` int NOT NULL AUTO_INCREMENT,
  `usuario_id_usuario` int NOT NULL,
  `accion` varchar(100) NOT NULL,
  `modulo` varchar(50) DEFAULT NULL,
  `tabla_afectada` varchar(50) DEFAULT NULL,
  `descripcion` text,
  `id_adrees` varchar(45) DEFAULT NULL,
  `resultado` enum('Exitoso','Fallido') DEFAULT NULL,
  `Fecha_hora` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id_bitacora`),
  KEY `fk_bitacora_sistema_usuario1_idx` (`usuario_id_usuario`),
  CONSTRAINT `fk_bitacora_sistema_usuario1` FOREIGN KEY (`usuario_id_usuario`) REFERENCES `usuario` (`id_usuario`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `calificacion`
--

DROP TABLE IF EXISTS `calificacion`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `calificacion` (
  `id_calificacion` int NOT NULL AUTO_INCREMENT,
  `nota` decimal(4,2) NOT NULL,
  `observaciones` text,
  `fecha_registro` date NOT NULL,
  `criterio_evaluacion_id_criterio` int NOT NULL,
  `estudiante_id_estudiante` int NOT NULL,
  `asignacion_materia_id_asignacion` int NOT NULL,
  `docente_id_docente` int NOT NULL,
  `periodo_academico_id_periodo` int NOT NULL,
  PRIMARY KEY (`id_calificacion`),
  KEY `fk_calificacion_criterio_evaluacion1_idx` (`criterio_evaluacion_id_criterio`),
  KEY `fk_calificacion_estudiante1_idx` (`estudiante_id_estudiante`),
  KEY `fk_calificacion_asignacion_materia1_idx` (`asignacion_materia_id_asignacion`),
  KEY `fk_calificacion_docente1_idx` (`docente_id_docente`),
  KEY `fk_calificacion_periodo_academico1_idx` (`periodo_academico_id_periodo`),
  CONSTRAINT `fk_calificacion_asignacion_materia1` FOREIGN KEY (`asignacion_materia_id_asignacion`) REFERENCES `asignacion_materia` (`id_asignacion`),
  CONSTRAINT `fk_calificacion_criterio_evaluacion1` FOREIGN KEY (`criterio_evaluacion_id_criterio`) REFERENCES `criterio_evaluacion` (`id_criterio`),
  CONSTRAINT `fk_calificacion_docente1` FOREIGN KEY (`docente_id_docente`) REFERENCES `docente` (`id_docente`),
  CONSTRAINT `fk_calificacion_estudiante1` FOREIGN KEY (`estudiante_id_estudiante`) REFERENCES `estudiante` (`id_estudiante`),
  CONSTRAINT `fk_calificacion_periodo_academico1` FOREIGN KEY (`periodo_academico_id_periodo`) REFERENCES `periodo_academico` (`id_periodo`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `criterio_evaluacion`
--

DROP TABLE IF EXISTS `criterio_evaluacion`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `criterio_evaluacion` (
  `id_criterio` int NOT NULL AUTO_INCREMENT,
  `nombre_criterio` varchar(100) NOT NULL,
  `porcentaje` decimal(5,2) NOT NULL,
  `activo` tinyint NOT NULL DEFAULT '1',
  `asignacion_materia_id_asignacion` int NOT NULL,
  `fecha_creacion` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id_criterio`),
  KEY `fk_criterio_evaluacion_asignacion_materia1_idx` (`asignacion_materia_id_asignacion`),
  CONSTRAINT `fk_criterio_evaluacion_asignacion_materia1` FOREIGN KEY (`asignacion_materia_id_asignacion`) REFERENCES `asignacion_materia` (`id_asignacion`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb3;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `docente`
--

DROP TABLE IF EXISTS `docente`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `docente` (
  `id_docente` int NOT NULL AUTO_INCREMENT,
  `codigo_docente` varchar(20) NOT NULL,
  `titulo_profesional` varchar(200) DEFAULT NULL,
  `especialidad` varchar(200) DEFAULT NULL,
  `fecha_ingreso` date NOT NULL,
  `estado` enum('activo','inactivo','licencia','retirado','pensionado') DEFAULT 'activo',
  `persona_id_persona` int NOT NULL,
  `usuario_id_usuario` int NOT NULL,
  PRIMARY KEY (`id_docente`),
  UNIQUE KEY `codigo_docente_UNIQUE` (`codigo_docente`),
  KEY `fk_docente_persona1_idx` (`persona_id_persona`),
  KEY `fk_docente_usuario1_idx` (`usuario_id_usuario`),
  CONSTRAINT `fk_docente_persona1` FOREIGN KEY (`persona_id_persona`) REFERENCES `persona` (`id_persona`),
  CONSTRAINT `fk_docente_usuario1` FOREIGN KEY (`usuario_id_usuario`) REFERENCES `usuario` (`id_usuario`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb3;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `estudiante`
--

DROP TABLE IF EXISTS `estudiante`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `estudiante` (
  `id_estudiante` int NOT NULL AUTO_INCREMENT,
  `codigo_estudiante` varchar(20) NOT NULL,
  `fecha_ingreso` date NOT NULL,
  `estado` enum('activo','inactivo','retirado','graduado','suspendido') NOT NULL DEFAULT 'activo',
  `eps` varchar(100) DEFAULT NULL,
  `observaciones` text,
  `usuario_id_usuario` int NOT NULL,
  `persona_id_persona` int NOT NULL,
  `grupo_id_grupo` int NOT NULL,
  PRIMARY KEY (`id_estudiante`),
  UNIQUE KEY `codigo_estudiante_UNIQUE` (`codigo_estudiante`),
  KEY `fk_estudiante_usuario1_idx` (`usuario_id_usuario`),
  KEY `fk_estudiante_persona1_idx` (`persona_id_persona`),
  KEY `fk_estudiante_grupo1_idx` (`grupo_id_grupo`),
  CONSTRAINT `fk_estudiante_grupo1` FOREIGN KEY (`grupo_id_grupo`) REFERENCES `grupo` (`id_grupo`),
  CONSTRAINT `fk_estudiante_persona1` FOREIGN KEY (`persona_id_persona`) REFERENCES `persona` (`id_persona`),
  CONSTRAINT `fk_estudiante_usuario1` FOREIGN KEY (`usuario_id_usuario`) REFERENCES `usuario` (`id_usuario`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb3;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `grado`
--

DROP TABLE IF EXISTS `grado`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `grado` (
  `id_grado` int NOT NULL AUTO_INCREMENT,
  `nombre_grado` varchar(50) NOT NULL,
  `orden` int NOT NULL,
  `activo` tinyint NOT NULL DEFAULT '1',
  `nivel_educativo_id_nivel` int NOT NULL,
  PRIMARY KEY (`id_grado`),
  KEY `fk_grado_nivel_educativo1_idx` (`nivel_educativo_id_nivel`),
  CONSTRAINT `fk_grado_nivel_educativo1` FOREIGN KEY (`nivel_educativo_id_nivel`) REFERENCES `nivel_educativo` (`id_nivel`)
) ENGINE=InnoDB AUTO_INCREMENT=23 DEFAULT CHARSET=utf8mb3;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `grupo`
--

DROP TABLE IF EXISTS `grupo`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `grupo` (
  `id_grupo` int NOT NULL AUTO_INCREMENT,
  `nombre_grupo` varchar(50) NOT NULL,
  `anio_escolar` varchar(9) NOT NULL,
  `capacidad_maxima` tinyint NOT NULL,
  `activo` tinyint NOT NULL DEFAULT '1',
  `grado_id_grado` int NOT NULL,
  `docente_id_docente` int DEFAULT NULL,
  PRIMARY KEY (`id_grupo`),
  KEY `fk_grupo_grado1_idx` (`grado_id_grado`),
  KEY `fk_grupo_docente1_idx` (`docente_id_docente`),
  CONSTRAINT `fk_grupo_docente1` FOREIGN KEY (`docente_id_docente`) REFERENCES `docente` (`id_docente`),
  CONSTRAINT `fk_grupo_grado1` FOREIGN KEY (`grado_id_grado`) REFERENCES `grado` (`id_grado`),
  CONSTRAINT `grupo_chk_1` CHECK ((`capacidad_maxima` > 0))
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb3;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `incapacidad`
--

DROP TABLE IF EXISTS `incapacidad`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `incapacidad` (
  `id_incapacidad` int NOT NULL AUTO_INCREMENT,
  `fecha_inicio` date NOT NULL,
  `fecha_fin` date NOT NULL,
  `motivo` text NOT NULL,
  `archivo_url` varchar(255) DEFAULT NULL,
  `estado` enum('pendiente','aprobada','rechazada') DEFAULT 'pendiente',
  `docente_id_docente` int NOT NULL,
  `fecha_creacion` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id_incapacidad`),
  KEY `fk_incapacidad_docente1_idx` (`docente_id_docente`),
  CONSTRAINT `fk_incapacidad_docente1` FOREIGN KEY (`docente_id_docente`) REFERENCES `docente` (`id_docente`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `intentos_login`
--

DROP TABLE IF EXISTS `intentos_login`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `intentos_login` (
  `id` int NOT NULL AUTO_INCREMENT,
  `nombre_usuario` varchar(50) DEFAULT NULL,
  `ip` varchar(45) DEFAULT NULL,
  `fecha_intento` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb3;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `materia`
--

DROP TABLE IF EXISTS `materia`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `materia` (
  `id_materia` int NOT NULL AUTO_INCREMENT,
  `codigo_materia` varchar(20) NOT NULL,
  `nombre_materia` varchar(100) NOT NULL,
  `descripcion` text,
  `intensidad_horaria_semanal` int NOT NULL,
  `activo` tinyint NOT NULL DEFAULT '1',
  `fecha_creacion` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id_materia`),
  UNIQUE KEY `codigo_materia_UNIQUE` (`codigo_materia`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb3;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `nivel_educativo`
--

DROP TABLE IF EXISTS `nivel_educativo`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `nivel_educativo` (
  `id_nivel` int NOT NULL AUTO_INCREMENT,
  `nombre_nivel` varchar(100) NOT NULL,
  `descripcion` text,
  `activo` tinyint NOT NULL DEFAULT '1',
  PRIMARY KEY (`id_nivel`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb3;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `periodo_academico`
--

DROP TABLE IF EXISTS `periodo_academico`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `periodo_academico` (
  `id_periodo` int NOT NULL AUTO_INCREMENT,
  `nombre_periodo` varchar(50) NOT NULL,
  `numero_periodo` int NOT NULL,
  `anio_escolar` varchar(9) NOT NULL,
  `activo` tinyint NOT NULL DEFAULT '1',
  `fecha_inicio` date NOT NULL,
  `fecha_fin` date NOT NULL,
  `fecha_creacion` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id_periodo`)
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb3;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `persona`
--

DROP TABLE IF EXISTS `persona`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `persona` (
  `id_persona` int NOT NULL AUTO_INCREMENT,
  `tipo_identificacion` varchar(20) NOT NULL,
  `numero_identificacion` varchar(50) NOT NULL,
  `nombres` varchar(100) NOT NULL,
  `apellido_paterno` varchar(100) NOT NULL,
  `apellido_materno` varchar(100) NOT NULL,
  `fecha_nacimiento` date NOT NULL,
  `genero` enum('M','F') NOT NULL,
  `telefono` varchar(20) NOT NULL,
  `correo_electronico` varchar(255) NOT NULL,
  `direccion` text,
  PRIMARY KEY (`id_persona`),
  UNIQUE KEY `numero_identificacion_UNIQUE` (`numero_identificacion`)
) ENGINE=InnoDB AUTO_INCREMENT=15 DEFAULT CHARSET=utf8mb3;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `rol`
--

DROP TABLE IF EXISTS `rol`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `rol` (
  `id_rol` int NOT NULL,
  `nombre_rol` varchar(50) NOT NULL,
  `descripcion` text,
  `activo` tinyint NOT NULL DEFAULT '1',
  `fecha_creacion` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id_rol`),
  UNIQUE KEY `nombre_rol_UNIQUE` (`nombre_rol`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `usuario`
--

DROP TABLE IF EXISTS `usuario`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `usuario` (
  `id_usuario` int NOT NULL AUTO_INCREMENT,
  `rol_id_rol` int NOT NULL,
  `nombre_usuario` varchar(50) NOT NULL,
  `contrasena` varchar(255) NOT NULL,
  `correo_electronico` varchar(100) NOT NULL,
  `telefono` varchar(20) NOT NULL,
  `foto_perfil` varchar(255) DEFAULT NULL,
  `activo` tinyint NOT NULL DEFAULT '1',
  `intentos_fallidos` int DEFAULT '0',
  `fecha_bloqueo` datetime DEFAULT NULL,
  `ultimo_acceso` datetime DEFAULT NULL,
  `token_recuperacion` varchar(255) DEFAULT NULL,
  `fecha_creacion` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `fecha_modificacion` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id_usuario`),
  UNIQUE KEY `id_usuario_UNIQUE` (`id_usuario`),
  UNIQUE KEY `nombre_usuario_UNIQUE` (`nombre_usuario`),
  UNIQUE KEY `correo_electronico_UNIQUE` (`correo_electronico`),
  KEY `fk_usuario_rol_idx` (`rol_id_rol`),
  CONSTRAINT `fk_usuario_rol` FOREIGN KEY (`rol_id_rol`) REFERENCES `rol` (`id_rol`)
) ENGINE=InnoDB AUTO_INCREMENT=13 DEFAULT CHARSET=utf8mb3;
/*!40101 SET character_set_client = @saved_cs_client */;

--

--
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-08-02 18:47:37
