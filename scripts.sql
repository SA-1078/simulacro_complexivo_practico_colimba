sudo -u postgres psql

Sistema Básico de Gestión de Alquileres y Operaciones para una Agencia de Alquiler de Vehículos

CREATE USER gestion_user WITH PASSWORD 'admin123';
CREATE DATABASE gestion_vehiculos_db OWNER gestion_user;

\c gestion_vehiculos_db

ALTER SCHEMA public OWNER TO gestion_user;
GRANT ALL ON SCHEMA public TO gestion_user;
GRANT CREATE ON SCHEMA public TO gestion_user;

ALTER DEFAULT PRIVILEGES FOR USER gestion_user IN SCHEMA public
GRANT ALL ON TABLES TO gestion_user;

ALTER DEFAULT PRIVILEGES FOR USER gestion_user IN SCHEMA public
GRANT ALL ON SEQUENCES TO gestion_user;

ALTER DEFAULT PRIVILEGES FOR USER gestion_user IN SCHEMA public
GRANT ALL ON FUNCTIONS TO gestion_user;


Tabla vehicles (vehículos):
id BIGSERIAL PRIMARY KEY
plate VARCHAR(10) NOT NULL UNIQUE
brand VARCHAR(40) NOT NULL
daily_rate NUMERIC(10,2) NOT NULL
is_available BOOLEAN NOT NULL DEFAULT TRUE


Tabla rentals (alquileres):

id BIGSERIAL PRIMARY KEY
vehicle_id BIGINT NOT NULL REFERENCES vehicles(id)
customer_name VARCHAR(120) NOT NULL
total NUMERIC(10,2) NOT NULL
status VARCHAR(20) NOT NULL (RESERVED, ACTIVE, CLOSED, CANCELLED)
created_at TIMESTAMP NOT NULL DEFAULT NOW()



Colecciones MongoDB (2):

Colección fleet_logs (bitácora/cambios de flota):

_id ObjectId
vehicle_id long
action string (CREATED, UPDATED, MAINTENANCE, DISABLED)
note string
source string (SYSTEM, MOBILE)
created_at date

Colección rental_events (eventos operativos):

_id ObjectId
rental_id long
event_type string (CREATED, PICKED_UP, RETURNED, PAID, CANCELLED)
source string (WEB, MOBILE, SYSTEM)
note string
created_at date

-- Creando usuario en MongoDB:
db.createUser({
  user: "gestion_user",
  pwd: "admin123",
  roles: [
    { role: "readWrite", db: "gestion_vehiculos_db" }
  ]
})

--INSERTANDO REGISTRO EN MONGO:
db.fleet_logs.insertOne({
     "vehicle_id": 1,
     "note": "Vehículo creado",
     "action": "creado",
     "source": "sistema",
     "created_at": "2024-06-01T12:00:00Z"
| )}

--CREANDO INDEX EN MONGO:
db.fleet_logs.createIndex({ "vehicle_id": 1 })

--consulta filtrando por el identificador relacionado con la tabla relacional:
db.fleet_logs.find({ "vehicle_id": 1 })

-- una consulta usando el campo fecha:
db.fleet_logs.find({ "vehicle_id": 1, "created_at": { $gte: "2024-06-01T00:00:00Z" } })
