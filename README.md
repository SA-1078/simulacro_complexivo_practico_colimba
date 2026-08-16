# Sistema Básico de Gestión de Alquileres y Operaciones para una Agencia de Alquiler de Vehículos

Proyecto integral para el Examen Complexivo Práctico que integra todo el stack tecnológico:
- **Base de Datos Relacional:** PostgreSQL (`rentals_db` / `gestion_vehiculos_db`)
- **Base de Datos No Relacional:** MongoDB (`rentals_logs` / `gestion_vehiculos_db`)
- **Backend:** Django REST Framework + Simple JWT (`vehiculos_api`)
- **Frontend Web:** React 18 + TypeScript + Material UI + Vite (`vehiculos-ui`)
- **Aplicación Móvil:** React Native + Expo + React Navigation (`vehiculos-rn`)
- **Sistemas Operativos:** Ubuntu 24.04 (`a.txt`)

---

## 1. Estructura del Repositorio

```text
simulacro_complexivo_practico_colimba/
├── scripts.sql             # Scripts DDL/DML de PostgreSQL y consultas NoSQL de MongoDB (Capturas 1 a 14)
├── a.txt                   # Guía de comandos de Linux para Sistemas Operativos (Capturas 26 a 30)
├── vehiculos_api/          # Backend Django REST Framework (PostgreSQL + MongoDB + JWT)
├── vehiculos-ui/           # Frontend Web React + TypeScript + Material UI
└── vehiculos-rn/           # Frontend Móvil React Native + Expo (2 Selects, Pickers, NoSQL)
```

---

## 2. Puesta en Marcha Rápida

### 2.1 Backend (Django REST Framework)
```bash
cd vehiculos_api
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt # o django djangorestframework djangorestframework-simplejwt psycopg2-binary pymongo django-cors-headers django-filter python-dotenv
python manage.py makemigrations
python manage.py migrate
python manage.py createsuperuser
python manage.py runserver 0.0.0.0:8000
```

### 2.2 Frontend Web (React + MUI)
```bash
cd vehiculos-ui
npm install
npm run dev
# Acceder a http://localhost:5173
```

### 2.3 Frontend Móvil (React Native + Expo)
```bash
cd vehiculos-rn
npm install
# Si se conecta por cable USB con depuración: adb reverse tcp:8000 tcp:8000
npx expo start -c
```
