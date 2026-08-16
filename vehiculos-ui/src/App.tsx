/**
 * ============================================================================
 * ARCHIVO PRINCIPAL DE ENRUTAMIENTO (App.tsx) - VEHICULOS UI
 * ============================================================================
 */

import { BrowserRouter, Routes, Route, Link, Navigate } from "react-router-dom";
import { AppBar, Toolbar, Typography, Button, Stack } from "@mui/material";

import HomePage from "./pages/HomePage";
import AboutPage from "./pages/AboutPage";
import PublicVehiclesPage from "./pages/PublicVehiclesPage";
import LoginPage from "./pages/LoginPage";

import AdminHomePage from "./pages/AdminHomePage";
import AdminAlquiladosPage from "./pages/AdminAlquiladosPage";
import AdminVehiculosPage from "./pages/AdminVehiculosPage";

import RequireAuth from "./components/RequireAuth";

export default function App() {
  return (
    <BrowserRouter>
      {/* Barra de navegación superior */}
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" sx={{ flexGrow: 1, fontWeight: "bold" }}>
            Agencia Vehículos UI (MUI)
          </Typography>

          <Stack direction={{ xs: "column", sm: "row" }} spacing={1} sx={{ flexWrap: "wrap" }}>
            <Button color="inherit" component={Link} to="/">Home</Button>
            <Button color="inherit" component={Link} to="/acerca">Acerca</Button>
            <Button color="inherit" component={Link} to="/lista">Lista</Button>
            <Button color="inherit" component={Link} to="/login">Login</Button>
            <Button color="inherit" component={Link} to="/admin">Admin</Button>
          </Stack>
        </Toolbar>
      </AppBar>

      {/* Definición de rutas */}
      <Routes>
        {/* Rutas Públicas */}
        <Route path="/" element={<HomePage />} />
        <Route path="/acerca" element={<AboutPage />} />
        <Route path="/lista" element={<PublicVehiclesPage />} />
        <Route path="/login" element={<LoginPage />} />

        {/* Rutas Protegidas */}
        <Route
          path="/admin"
          element={
            <RequireAuth>
              <AdminHomePage />
            </RequireAuth>
          }
        />

        <Route
          path="/admin/alquilados"
          element={
            <RequireAuth>
              <AdminAlquiladosPage />
            </RequireAuth>
          }
        />

        <Route
          path="/admin/vehiculos"
          element={
            <RequireAuth>
              <AdminVehiculosPage />
            </RequireAuth>
          }
        />

        {/* Redirección por defecto */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}