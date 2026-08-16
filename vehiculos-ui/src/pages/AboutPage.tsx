/**
 * ============================================================================
 * PÁGINA ACERCA DE (ABOUT PAGE) - VEHICULOS UI
 * ============================================================================
 */

import { Container, Paper, Typography, List, ListItem, ListItemText } from "@mui/material";

export default function AboutPage() {
  return (
    <Container sx={{ mt: 3 }}>
      <Paper sx={{ p: 3 }}>
        <Typography variant="h5" sx={{ mb: 2 }}>Acerca de la Solución Técnica</Typography>

        <Typography variant="body1" sx={{ mb: 2 }}>
          Endpoints consumidos desde el Backend Django REST Framework:
        </Typography>

        <List dense>
          <ListItem>
            <ListItemText
              primary="GET /api/vehicles/"
              secondary="Consulta pública de la flota de vehículos (PostgreSQL)."
            />
          </ListItem>
          <ListItem>
            <ListItemText
              primary="GET /api/rentals/"
              secondary="Consulta de alquileres con estados y vehículos asociados (PostgreSQL)."
            />
          </ListItem>
          <ListItem>
            <ListItemText
              primary="POST /api/auth/login/"
              secondary="Autenticación y generación de tokens JWT (Simple JWT)."
            />
          </ListItem>
          <ListItem>
            <ListItemText
              primary="CRUD /api/vehicles/ & CRUD /api/rentals/"
              secondary="Gestión protegida para usuarios con rol administrador."
            />
          </ListItem>
          <ListItem>
            <ListItemText
              primary="CRUD /api/fleet_logs/ & /api/rental_events/"
              secondary="Endpoints NoSQL (MongoDB) consumidos por la app móvil."
            />
          </ListItem>
        </List>

        <Typography variant="body2" color="text.secondary">
          Base URL: Configurable mediante la variable de entorno <code>VITE_API_BASE_URL</code>.
        </Typography>
      </Paper>
    </Container>
  );
}