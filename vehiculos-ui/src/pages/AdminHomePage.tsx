/**
 * ============================================================================
 * PÁGINA: PANEL ADMINISTRATIVO (ADMIN HOME PAGE) - VEHICULOS UI
 * ============================================================================
 */

import { Container, Paper, Typography, Stack, Button } from "@mui/material";
import { Link } from "react-router-dom";

export default function AdminHomePage() {
  return (
    <Container sx={{ mt: 3 }}>
      <Paper sx={{ p: 3 }}>
        <Typography variant="h5" sx={{ mb: 2, fontWeight: "bold" }}>
          Panel de Control Administrativo
        </Typography>
        <Typography variant="body1" sx={{ mb: 3 }}>
          Seleccione el módulo relacional de PostgreSQL que desea gestionar:
        </Typography>

        <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
          <Button variant="contained" component={Link} to="/admin/vehiculos">
            CRUD Vehículos (Flota)
          </Button>
          <Button variant="contained" component={Link} to="/admin/alquilados">
            CRUD Alquileres (Rentals)
          </Button>
        </Stack>
      </Paper>
    </Container>
  );
}