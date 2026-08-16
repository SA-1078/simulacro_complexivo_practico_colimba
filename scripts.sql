-- ================================================================================
-- EXAMEN COMPLEXIVO PRÁCTICO - CASO AGENCIA DE ALQUILER DE VEHÍCULOS
-- SISTEMA BÁSICO DE GESTIÓN DE ALQUILERES Y OPERACIONES
-- SCRIPTS COMPLETOS: POSTGRESQL (RELACIONAL) Y MONGODB (NOSQL)
-- ================================================================================

-- ================================================================================
-- SECCIÓN 1: POSTGRESQL (BASE DE DATOS I) - CAPTURAS 1 A 8
-- ================================================================================

-- --------------------------------------------------------------------------------
-- 1. CONEXIÓN INICIAL COMO SUPERUSUARIO (Terminal / psql):
-- --------------------------------------------------------------------------------
sudo -u postgres psql

-- --------------------------------------------------------------------------------
-- 2. CREACIÓN DE BASE DE DATOS Y USUARIO DE SERVICIO:
-- --------------------------------------------------------------------------------
CREATE USER backend_user WITH PASSWORD 'admin123';
-- También compatible con:
-- CREATE USER gestion_user WITH PASSWORD 'admin123';

CREATE DATABASE rentals_db OWNER backend_user;
-- Si tu proyecto usa gestion_vehiculos_db:
-- CREATE DATABASE gestion_vehiculos_db OWNER backend_user;

-- Conectar a la base de datos recién creada:
\c rentals_db

-- --------------------------------------------------------------------------------
-- 3. ASIGNACIÓN DE PRIVILEGIOS AL ESQUEMA PUBLIC:
-- --------------------------------------------------------------------------------
ALTER SCHEMA public OWNER TO backend_user;
GRANT ALL ON SCHEMA public TO backend_user;
GRANT CREATE ON SCHEMA public TO backend_user;

ALTER DEFAULT PRIVILEGES FOR USER backend_user IN SCHEMA public
GRANT ALL ON TABLES TO backend_user;

ALTER DEFAULT PRIVILEGES FOR USER backend_user IN SCHEMA public
GRANT ALL ON SEQUENCES TO backend_user;

ALTER DEFAULT PRIVILEGES FOR USER backend_user IN SCHEMA public
GRANT ALL ON FUNCTIONS TO backend_user;

-- Salir de psql:
\q

-- --------------------------------------------------------------------------------
-- 4. VERIFICACIÓN DE CONEXIÓN CON EL USUARIO DE SERVICIO:
-- --------------------------------------------------------------------------------
psql -U backend_user -d rentals_db -h 127.0.0.1 -W
-- (Ingresar contraseña: admin123)

-- --------------------------------------------------------------------------------
-- 5. TABLAS RELACIONALES (Generadas por Django Migrations o DDL Manual):
-- --------------------------------------------------------------------------------

-- Tabla 1: vehicles (vehículos)
CREATE TABLE IF NOT EXISTS vehicles (
    id BIGSERIAL PRIMARY KEY,
    plate VARCHAR(10) NOT NULL UNIQUE,
    brand VARCHAR(40) NOT NULL,
    daily_rate NUMERIC(10,2) NOT NULL,
    is_available BOOLEAN NOT NULL DEFAULT TRUE
);

-- Tabla 2: rentals (alquileres)
CREATE TABLE IF NOT EXISTS rentals (
    id BIGSERIAL PRIMARY KEY,
    vehicle_id BIGINT NOT NULL REFERENCES vehicles(id) ON DELETE PROTECT,
    customer_name VARCHAR(120) NOT NULL,
    total NUMERIC(10,2) NOT NULL,
    status VARCHAR(20) NOT NULL CHECK (status IN ('RESERVED', 'ACTIVE', 'CLOSED', 'CANCELLED')),
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Verificar tablas creadas:
\dt
SELECT * FROM vehicles;
SELECT * FROM rentals;

-- --------------------------------------------------------------------------------
-- 6. INSERCIÓN DE DATOS DE PRUEBA (SEED DATA):
-- --------------------------------------------------------------------------------
INSERT INTO vehicles (plate, brand, daily_rate, is_available) VALUES
('PBA-1020', 'Toyota RAV4', 45.00, TRUE),
('PBA-3040', 'Chevrolet Tracker', 40.00, FALSE),
('GYE-5060', 'Hyundai Tucson', 50.00, TRUE),
('AZU-7080', 'Nissan Kicks', 38.00, FALSE)
ON CONFLICT (plate) DO NOTHING;

INSERT INTO rentals (vehicle_id, customer_name, total, status, created_at) VALUES
(1, 'Carlos Mendoza', 135.00, 'ACTIVE', NOW() - INTERVAL '2 days'),
(2, 'Andrea Paredes', 200.00, 'RESERVED', NOW() - INTERVAL '1 day'),
(3, 'Juan Colimba', 150.00, 'CLOSED', NOW() - INTERVAL '5 days'),
(4, 'Sofia Morales', 114.00, 'CANCELLED', NOW() - INTERVAL '3 days');

-- --------------------------------------------------------------------------------
-- 7. CREACIÓN Y PRUEBA DEL ÍNDICE DE ESTADOS (Optimización de consultas):
-- --------------------------------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_rentals_status ON rentals(status);

-- Demostrar el uso del índice con EXPLAIN:
EXPLAIN SELECT * FROM rentals WHERE status = 'ACTIVE';
SELECT * FROM rentals WHERE status = 'ACTIVE';
SELECT * FROM vehicles WHERE is_available = TRUE;

-- --------------------------------------------------------------------------------
-- 8. CREACIÓN DE VISTA: vw_active_rentals (Alquileres RESERVED o ACTIVE)
-- --------------------------------------------------------------------------------
CREATE OR REPLACE VIEW vw_active_rentals AS
SELECT 
    r.id AS rental_id,
    r.customer_name,
    v.plate,
    v.brand,
    r.total,
    r.status,
    r.created_at
FROM rentals r
INNER JOIN vehicles v ON r.vehicle_id = v.id
WHERE r.status IN ('RESERVED', 'ACTIVE');

-- Consultar la vista:
SELECT * FROM vw_active_rentals;

-- --------------------------------------------------------------------------------
-- 9. FUNCIÓN ALMACENADA: fn_total_rentals_por_estado
-- --------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION fn_total_rentals_por_estado(p_status VARCHAR)
RETURNS INTEGER AS $$
DECLARE
    v_total INTEGER;
BEGIN
    SELECT COUNT(*) INTO v_total
    FROM rentals
    WHERE status = UPPER(p_status);
    
    RETURN v_total;
END;
$$ LANGUAGE plpgsql;

-- Probar la función:
SELECT fn_total_rentals_por_estado('ACTIVE') AS total_activos;
SELECT fn_total_rentals_por_estado('RESERVED') AS total_reservados;

-- --------------------------------------------------------------------------------
-- 10. TRIGGER: trg_validar_rental_total (Impide crear alquileres con total <= 0)
-- --------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION fn_validar_rental_total()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.total <= 0 THEN
        RAISE EXCEPTION 'El monto total del alquiler debe ser mayor a 0 (Recibido: %)', NEW.total;
    END IF;
    -- Normalizar estado a mayúsculas
    NEW.status := UPPER(NEW.status);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER trg_validar_rental_total
BEFORE INSERT OR UPDATE ON rentals
FOR EACH ROW
EXECUTE FUNCTION fn_validar_rental_total();

-- TRIGGER ADICIONAL: Normalizar placa de vehículos en mayúsculas
CREATE OR REPLACE FUNCTION fn_validar_plate_upper()
RETURNS TRIGGER AS $$
BEGIN
    NEW.plate := UPPER(TRIM(NEW.plate));
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER trg_validar_plate_upper
BEFORE INSERT OR UPDATE ON vehicles
FOR EACH ROW
EXECUTE FUNCTION fn_validar_plate_upper();



-- ================================================================================
-- SECCIÓN 2: MONGODB (BASE DE DATOS II) - CAPTURAS 9 A 14
-- ================================================================================

-- --------------------------------------------------------------------------------
-- 1. ENTRAR A LA TERMINAL MONGOSH Y SELECCIONAR LA BASE DE DATOS:
-- --------------------------------------------------------------------------------
mongosh

-- Seleccionar la base de datos NoSQL del caso:
use rentals_logs;
-- (o use gestion_vehiculos_db;)

-- --------------------------------------------------------------------------------
-- 2. CREACIÓN DE USUARIO CON ROL readWrite (Sin privilegios globales de admin):
-- --------------------------------------------------------------------------------
db.createUser({
  user: "mongo_backend_user",
  pwd: "exa_2026_ute",
  roles: [
    { role: "readWrite", db: "rentals_logs" }
  ]
});

-- Salir de mongosh:
exit;

-- --------------------------------------------------------------------------------
-- 3. PROBAR AUTENTICACIÓN DEL USUARIO MONGODB:
-- --------------------------------------------------------------------------------
mongosh -u mongo_backend_user -p exa_2026_ute --authenticationDatabase rentals_logs

use rentals_logs;

-- --------------------------------------------------------------------------------
-- 4. CREACIÓN E INSERCIÓN EN LA COLECCIÓN fleet_logs (Bitácora de Flota):
-- --------------------------------------------------------------------------------
db.fleet_logs.insertMany([
  {
    "vehicle_id": NumberLong(1),
    "action": "CREATED",
    "note": "Vehículo ingresado a la flota activa",
    "source": "SYSTEM",
    "created_at": new Date("2026-08-10T09:00:00Z")
  },
  {
    "vehicle_id": NumberLong(2),
    "action": "MAINTENANCE",
    "note": "Cambio de pastillas de freno y balanceo",
    "source": "MOBILE",
    "created_at": new Date("2026-08-12T14:30:00Z")
  },
  {
    "vehicle_id": NumberLong(3),
    "action": "UPDATED",
    "note": "Actualización de tarifa diaria a $50.00",
    "source": "SYSTEM",
    "created_at": new Date("2026-08-14T11:15:00Z")
  }
]);

-- --------------------------------------------------------------------------------
-- 5. CREACIÓN E INSERCIÓN EN LA COLECCIÓN rental_events (Eventos Operativos):
-- --------------------------------------------------------------------------------
db.rental_events.insertMany([
  {
    "rental_id": NumberLong(1),
    "event_type": "CREATED",
    "source": "WEB",
    "note": "Reserva creada para cliente Carlos Mendoza",
    "created_at": new Date("2026-08-13T08:00:00Z")
  },
  {
    "rental_id": NumberLong(1),
    "event_type": "PICKED_UP",
    "source": "MOBILE",
    "note": "Vehículo entregado con tanque lleno y odómetro 45,200 km",
    "created_at": new Date("2026-08-13T09:30:00Z")
  },
  {
    "rental_id": NumberLong(2),
    "event_type": "CREATED",
    "source": "WEB",
    "note": "Reserva confirmada con abono previo",
    "created_at": new Date("2026-08-14T10:00:00Z")
  },
  {
    "rental_id": NumberLong(3),
    "event_type": "RETURNED",
    "source": "MOBILE",
    "note": "Vehículo devuelto en perfecto estado",
    "created_at": new Date("2026-08-15T16:00:00Z")
  },
  {
    "rental_id": NumberLong(3),
    "event_type": "PAID",
    "source": "SYSTEM",
    "note": "Pago liquidado con tarjeta de crédito",
    "created_at": new Date("2026-08-15T16:10:00Z")
  }
]);

-- --------------------------------------------------------------------------------
-- 6. CREACIÓN DE ÍNDICES EN MONGODB:
-- --------------------------------------------------------------------------------
db.rental_events.createIndex({ "rental_id": 1 });
db.fleet_logs.createIndex({ "vehicle_id": 1 });

-- Evidenciar índices creados:
db.rental_events.getIndexes();
db.fleet_logs.getIndexes();

-- --------------------------------------------------------------------------------
-- 7. CONSULTAS DE EVIDENCIA EN MONGODB:
-- --------------------------------------------------------------------------------

-- Consulta 1: Filtrar eventos por el identificador del alquiler relacional (rental_id):
db.rental_events.find({ "rental_id": NumberLong(1) }).pretty();

-- Consulta 2: Filtrar eventos por rango de fechas (created_at):
db.rental_events.find({
  "created_at": {
    $gte: new Date("2026-08-13T00:00:00Z"),
    $lte: new Date("2026-08-15T23:59:59Z")
  }
}).pretty();
