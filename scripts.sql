-- ============================================================================
-- REFERENCIA DE TABLAS Y COLECCIONES USADAS POR EL BACKEND (DJANGO / API):
-- ============================================================================
/*
Tablas PostgreSQL del Backend (2):
1. vehicles / marcas (vehículos gestionados por el API)
2. rentals / vehiculos (alquileres registrados en el API)

Colecciones MongoDB del Backend (2):
1. service_types / fleet_logs (tipos de servicio de flota)
2. vehicle_services / rental_events (bitácora de alquileres y servicios)
*/

-- TABLAS POSTGRESQL (2 TABLAS)

-- Tabla marcas (marcas de vehículos)

CREATE TABLE IF NOT EXISTS marcas (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(50) NOT NULL UNIQUE,
    pais_origen VARCHAR(40) NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    creado_en TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Tabla vehiculos (vehículos gestionados por el API)

CREATE TABLE IF NOT EXISTS vehiculos (
    id SERIAL PRIMARY KEY,
    placa VARCHAR(10) NOT NULL UNIQUE,
    modelo VARCHAR(60) NOT NULL,
    marca_id INTEGER REFERENCES marcas(id) ON DELETE RESTRICT,
    anio INTEGER NOT NULL,
    precio_dia DECIMAL(10,2) NOT NULL,
    estado VARCHAR(20) NOT NULL CHECK (estado IN ('DISPONIBLE', 'ALQUILADO', 'MANTENIMIENTO', 'INACTIVO')),
    creado_en TIMESTAMP NOT NULL DEFAULT NOW()
);

-- COLECCIONES MONGODB (2 COLECCIONES)

-- COLECCION service_types (tipos de servicio de flota)
/*
_id ObjectId
service_type_name string (unique)
code string (short code)
is_active boolean
description string
*/

-- COLECCION vehicle_services (bitácora de alquileres y servicios)
/*
_id ObjectId
vehicle_id ObjectId (referencia a vehiculos)
service_type_id ObjectId (referencia a service_types)
start_date date
end_date date
customer_name string
total_cost decimal
status string (PENDING, IN_PROGRESS, COMPLETED, CANCELLED)
created_at date
*/

-- ============================================================================
-- EXAMEN COMPLEXIVO PRÁCTICO - CASO AGENCIA DE ALQUILER DE VEHÍCULOS
-- GUÍA DE COMANDOS SQL (POSTGRESQL) Y NOSQL (MONGODB) CON EVIDENCIAS
-- (TABLAS Y COLECCIONES INDEPENDIENTES PARA PRUEBAS Y CAPTURAS DEL EXAMEN)
-- ============================================================================

-- ============================================================================
-- SECCIÓN 1: BASE DE DATOS RELACIONAL (POSTGRESQL) - CAPTURAS 1 A 8
-- ============================================================================

-- ----------------------------------------------------------------------------
-- CAPTURA 1: Creación de Base de Datos
-- ----------------------------------------------------------------------------
-- Ingreso a PostgreSQL como superusuario:
-- sudo -u postgres psql

CREATE DATABASE rentals_db;

-- ----------------------------------------------------------------------------
-- CAPTURA 2: Creación de Usuario y Asignación de Permisos (No Superusuario)
-- ----------------------------------------------------------------------------
CREATE USER backend_user WITH PASSWORD 'admin123';

GRANT ALL PRIVILEGES ON DATABASE rentals_db TO backend_user;
ALTER DATABASE rentals_db OWNER TO backend_user;

-- Conectar a la base de datos para configurar permisos sobre el esquema public:
\c rentals_db

ALTER SCHEMA public OWNER TO backend_user;
GRANT ALL ON SCHEMA public TO backend_user;
GRANT CREATE ON SCHEMA public TO backend_user;

ALTER DEFAULT PRIVILEGES FOR USER backend_user IN SCHEMA public
GRANT ALL ON TABLES TO backend_user;

ALTER DEFAULT PRIVILEGES FOR USER backend_user IN SCHEMA public
GRANT ALL ON SEQUENCES TO backend_user;

ALTER DEFAULT PRIVILEGES FOR USER backend_user IN SCHEMA public
GRANT ALL ON FUNCTIONS TO backend_user;

\q

-- ----------------------------------------------------------------------------
-- CAPTURA 3: Conexión con el Usuario Creado
-- ----------------------------------------------------------------------------
-- Probar la conexión desde terminal con el usuario creado:
-- psql -h 127.0.0.1 -U backend_user -d rentals_db
-- Password: admin123

-- Listar las bases de datos para evidenciar conexión y existencia de rentals_db:
\l

-- ----------------------------------------------------------------------------
-- CAPTURA 4 y 5: Creación de Tablas Independientes con Relaciones (FK)
-- (Independientes del API: talleres_mantenimiento y ordenes_servicio)
-- ----------------------------------------------------------------------------

-- Tabla Principal 1: talleres_mantenimiento
CREATE TABLE IF NOT EXISTS talleres_mantenimiento (
    id BIGSERIAL PRIMARY KEY,
    codigo VARCHAR(10) NOT NULL UNIQUE,
    nombre VARCHAR(60) NOT NULL,
    ciudad VARCHAR(40) NOT NULL,
    capacidad_autos INTEGER NOT NULL DEFAULT 5,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    creado_en TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Tabla Dependiente 2: ordenes_servicio (con FK a talleres_mantenimiento)
CREATE TABLE IF NOT EXISTS ordenes_servicio (
    id BIGSERIAL PRIMARY KEY,
    taller_id BIGINT NOT NULL REFERENCES talleres_mantenimiento(id) ON DELETE PROTECT,
    placa_auto VARCHAR(10) NOT NULL,
    mecanico_responsable VARCHAR(120) NOT NULL,
    costo NUMERIC(10,2) NOT NULL,
    estado VARCHAR(20) NOT NULL CHECK (estado IN ('PENDIENTE', 'EN_PROCESO', 'COMPLETADO', 'CANCELADO')),
    creada_en TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Listar tablas creadas:
\dt

-- Ver estructura detallada y relaciones (FK):
\d talleres_mantenimiento
\d ordenes_servicio

-- ----------------------------------------------------------------------------
-- INSERCIÓN DE REGISTROS DE PRUEBA (Mínimo 1 por tabla)
-- ----------------------------------------------------------------------------
-- 1. Insertar talleres:
INSERT INTO talleres_mantenimiento (codigo, nombre, ciudad, capacidad_autos)
VALUES 
    ('TAL-01', 'Taller Central Norte', 'Quito', 10),
    ('TAL-02', 'Taller Express Sur', 'Guayaquil', 6),
    ('TAL-03', 'Taller Mecánica Integral', 'Cuenca', 4)
ON CONFLICT (codigo) DO NOTHING;

-- 2. Insertar órdenes de servicio vinculadas a los talleres:
INSERT INTO ordenes_servicio (taller_id, placa_auto, mecanico_responsable, costo, estado, creada_en)
VALUES 
    (1, 'PBA-1020', 'Juan Mecanico', 120.00, 'EN_PROCESO', NOW() - INTERVAL '2 days'),
    (1, 'PBA-3040', 'Juan Mecanico', 45.00, 'PENDIENTE', NOW() - INTERVAL '1 day'),
    (2, 'GYE-5060', 'Marcos Salguero', 200.00, 'COMPLETADO', NOW() - INTERVAL '5 days'),
    (3, 'AZU-7080', 'Luis Paredes', 80.00, 'CANCELADO', NOW() - INTERVAL '3 days');

-- Verificar registros:
SELECT * FROM talleres_mantenimiento;
SELECT * FROM ordenes_servicio;

-- ----------------------------------------------------------------------------
-- CAPTURA 6: Creación de Índice en campo frecuente y Demostración con EXPLAIN
-- ----------------------------------------------------------------------------
-- Crear índice en la columna 'estado' de ordenes_servicio:
CREATE INDEX IF NOT EXISTS idx_ordenes_estado ON ordenes_servicio (estado);

-- Verificar la existencia del índice:
SELECT indexname, indexdef 
FROM pg_indexes 
WHERE tablename = 'ordenes_servicio';

-- Demostrar el uso del índice con EXPLAIN ANALYZE:
EXPLAIN ANALYZE 
SELECT * FROM ordenes_servicio 
WHERE estado = 'EN_PROCESO';

-- ----------------------------------------------------------------------------
-- CAPTURA 7: Creación de Vista que Filtra por Subconjunto de Estados
-- ----------------------------------------------------------------------------
-- Vista que lista órdenes activas (PENDIENTE y EN_PROCESO) con datos del taller:
CREATE OR REPLACE VIEW vw_ordenes_activas AS
SELECT 
    o.id AS orden_id,
    o.placa_auto,
    o.mecanico_responsable,
    o.costo,
    o.estado,
    t.codigo AS codigo_taller,
    t.nombre AS nombre_taller,
    t.ciudad,
    o.creada_en AS orden_fecha
FROM ordenes_servicio o
INNER JOIN talleres_mantenimiento t ON o.taller_id = t.id
WHERE o.estado IN ('PENDIENTE', 'EN_PROCESO');

-- Consulta ejecutada sobre la vista:
SELECT * FROM vw_ordenes_activas;

-- ----------------------------------------------------------------------------
-- CAPTURA 8: Función o Trigger con Regla de Integridad del Dominio
-- ----------------------------------------------------------------------------

-- OPCIÓN A: Función almacenada para contar total de órdenes por estado
CREATE OR REPLACE FUNCTION fn_total_ordenes_por_estado(p_estado VARCHAR)
RETURNS INTEGER AS $$
DECLARE
    v_total INTEGER;
BEGIN
    SELECT COUNT(*) INTO v_total
    FROM ordenes_servicio
    WHERE estado = UPPER(p_estado);
    
    RETURN v_total;
END;
$$ LANGUAGE plpgsql;

-- Probar la función:
SELECT fn_total_ordenes_por_estado('EN_PROCESO') AS total_en_proceso;
SELECT fn_total_ordenes_por_estado('PENDIENTE') AS total_pendientes;

-- OPCIÓN B: Trigger para validar que el costo del servicio sea mayor a 0
CREATE OR REPLACE FUNCTION fn_validar_costo_servicio()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.costo <= 0 THEN
        RAISE EXCEPTION 'El costo del servicio debe ser mayor a $0.00 (Recibido: %)', NEW.costo;
    END IF;
    -- Normalizar placa y estado a mayúsculas
    NEW.placa_auto := UPPER(TRIM(NEW.placa_auto));
    NEW.estado := UPPER(TRIM(NEW.estado));
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER trg_validar_costo_servicio
BEFORE INSERT OR UPDATE ON ordenes_servicio
FOR EACH ROW
EXECUTE FUNCTION fn_validar_costo_servicio();

-- Prueba del trigger con inserción válida:
INSERT INTO ordenes_servicio (taller_id, placa_auto, mecanico_responsable, costo, estado, creada_en)
VALUES (1, 'pba-9999', 'Tecnico Especialista', 95.00, 'PENDIENTE', NOW());

-- Prueba del trigger que debe fallar (costo <= 0):
-- INSERT INTO ordenes_servicio (taller_id, placa_auto, mecanico_responsable, costo, estado, creada_en)
-- VALUES (1, 'PBA-9999', 'Tecnico Especialista', 0.00, 'PENDIENTE', NOW());


-- ============================================================================
-- SECCIÓN 2: BASE DE DATOS NO RELACIONAL (MONGODB) - CAPTURAS 9 A 14
-- (COLECCIONES INDEPENDIENTES PARA PRUEBAS Y EVIDENCIAS DEL EXAMEN)
-- ============================================================================

-- Ejecutar en terminal: mongosh

/*
// ----------------------------------------------------------------------------
// CAPTURA 9: Creación y Selección de Base de Datos
// ----------------------------------------------------------------------------
use rentals_logs;

// ----------------------------------------------------------------------------
// CAPTURA 10: Creación de Usuario con Roles Mínimos de Lectura/Escritura
// ----------------------------------------------------------------------------
db.createUser({
  user: "mongo_backend_user",
  pwd: "exa_2026_ute",
  roles: [
    { role: "readWrite", db: "rentals_logs" }
  ]
});

// Prueba de autenticación con el usuario creado:
db.auth("mongo_backend_user", "exa_2026_ute");

// ----------------------------------------------------------------------------
// CAPTURA 11: Definición de Colecciones Independientes e Inserción de Prueba
// ----------------------------------------------------------------------------
// 1. Inserción en colección repuestos_inventario (Independiente):
db.repuestos_inventario.insertMany([
  {
    codigo_repuesto: "REP-001",
    nombre: "Filtro de Aceite Sintético",
    fabricante: "Bosch",
    precio_unitario: 18.50,
    stock: 45,
    is_active: true,
    created_at: new Date()
  },
  {
    codigo_repuesto: "REP-002",
    nombre: "Pastillas de Freno Delanteras",
    fabricante: "Brembo",
    precio_unitario: 55.00,
    stock: 20,
    is_active: true,
    created_at: new Date()
  },
  {
    codigo_repuesto: "REP-003",
    nombre: "Batería 12V 65Ah",
    fabricante: "Bosch",
    precio_unitario: 110.00,
    stock: 12,
    is_active: true,
    created_at: new Date()
  }
]);

// 2. Inserción en colección ordenes_bitacora (vinculando orden_id de SQL):
db.ordenes_bitacora.insertMany([
  {
    orden_id: NumberLong(1),
    event_type: "ORDEN_CREADA",
    source: "SYSTEM",
    note: "Vehículo PBA-1020 ingresó a mantenimiento preventivo",
    created_at: new Date("2026-08-13T08:00:00Z")
  },
  {
    orden_id: NumberLong(1),
    event_type: "EN_DIAGNOSTICO",
    source: "MOBILE",
    note: "Diagnóstico computarizado completado sin fallas de motor",
    created_at: new Date("2026-08-13T09:30:00Z")
  },
  {
    orden_id: NumberLong(1),
    event_type: "TRABAJO_FINALIZADO",
    source: "WEB",
    note: "Cambio de pastillas de freno y cambio de aceite completados",
    created_at: new Date("2026-08-13T16:00:00Z")
  },
  {
    orden_id: NumberLong(2),
    event_type: "ORDEN_CREADA",
    source: "MOBILE",
    note: "Revisión de suspensión registrada desde tablet móvil",
    created_at: new Date("2026-08-14T10:00:00Z")
  },
  {
    orden_id: NumberLong(3),
    event_type: "ORDEN_ENTREGADA",
    source: "SYSTEM",
    note: "Vehículo entregado al conductor con firma electrónica",
    created_at: new Date("2026-08-15T15:30:00Z")
  }
]);

// Listar colecciones creadas:
show collections;

// Mostrar documentos insertados:
db.repuestos_inventario.find().pretty();
db.ordenes_bitacora.find().pretty();

// ----------------------------------------------------------------------------
// CAPTURA 12: Creación de Índice sobre el campo que referencia a SQL (orden_id)
// ----------------------------------------------------------------------------
db.ordenes_bitacora.createIndex({ orden_id: 1 });

// Evidenciar índices creados con getIndexes():
db.ordenes_bitacora.getIndexes();

// ----------------------------------------------------------------------------
// CAPTURA 13: Consulta por Campo Clave (orden_id)
// ----------------------------------------------------------------------------
db.ordenes_bitacora.find({ orden_id: NumberLong(1) }).pretty();

// ----------------------------------------------------------------------------
// CAPTURA 14: Consulta por Rango de Fechas (created_at)
// ----------------------------------------------------------------------------
db.ordenes_bitacora.find({
  created_at: {
    $gte: new Date("2026-08-13T00:00:00Z"),
    $lte: new Date("2026-08-15T23:59:59Z")
  }
}).pretty();

*/
