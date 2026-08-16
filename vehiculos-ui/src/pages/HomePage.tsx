/**
 * ============================================================================
 * PÁGINA PRINCIPAL (HOME PAGE) - VEHICULOS UI
 * ============================================================================
 */

import { Container, Paper, Typography, Stack } from "@mui/material";
import DirectionsCarIcon from "@mui/icons-material/DirectionsCar";

export default function HomePage() {
  return (
    <Container sx={{ mt: 3 }}>
      <Paper sx={{ p: 3 }}>
        <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
          <DirectionsCarIcon color="primary" />
          <Typography variant="h5">Sistema de Gestión de Alquileres de Vehículos</Typography>
        </Stack>

        <Typography variant="body1" sx={{ mb: 2 }}>
          SPA desarrollada en React + TypeScript + Material UI (MUI) + React Router.
          Consume la API de Django REST Framework (PostgreSQL & MongoDB).
        </Typography>

        <Typography variant="body2" color="text.secondary">
          Flujo de navegación:
          <br />
          1. <strong>Lista Pública:</strong> Catálogo de vehículos disponibles y alquileres en curso.
          <br />
          2. <strong>Login:</strong> Autenticación mediante tokens JWT.
          <br />
          3. <strong>Panel Admin:</strong> Gestión CRUD completa de Vehículos (flota) y Alquileres (rentals).
        </Typography>
      </Paper>
    </Container>
  );
}