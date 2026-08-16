/**
 * ============================================================================
 * PÁGINA: LISTADO PÚBLICO DE VEHÍCULOS Y ALQUILERES (PUBLIC VEHICLES PAGE)
 * ============================================================================
 * Consume en paralelo GET /api/vehicles/ y GET /api/rentals/ (PostgreSQL).
 * Muestra el estado operativo, disponibilidad y manejo de estados de carga y error.
 */

import { useEffect, useState } from "react";
import {
  Container,
  Paper,
  Typography,
  Button,
  Stack,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  CircularProgress,
  Alert,
  Chip,
  Box,
} from "@mui/material";
import RefreshIcon from "@mui/icons-material/Refresh";
import DirectionsCarIcon from "@mui/icons-material/DirectionsCar";
import ReceiptLongIcon from "@mui/icons-material/ReceiptLong";

import { type Vehiculo, listVehiculosPublicApi } from "../api/vehiculos.api";
import { type Rental, listRentalsApi } from "../api/rentals.api";

export default function PublicVehiclesPage() {
  const [vehicles, setVehicles] = useState<Vehiculo[]>([]);
  const [rentals, setRentals] = useState<Rental[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");

  const loadData = async () => {
    try {
      setLoading(true);
      setError("");
      const [vehiclesRes, rentalsRes] = await Promise.all([
        listVehiculosPublicApi(),
        listRentalsApi(),
      ]);
      setVehicles(vehiclesRes.results || []);
      setRentals(rentalsRes.results || []);
    } catch {
      setError("No se pudo cargar la información. Verifique que el backend Django esté corriendo.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const renderRentalStatus = (st: string) => {
    switch (st) {
      case "RESERVED":
        return <Chip label="RESERVADO" color="primary" size="small" />;
      case "ACTIVE":
        return <Chip label="ACTIVO / EN CURSO" color="warning" size="small" />;
      case "CLOSED":
        return <Chip label="CERRADO / PAGADO" color="success" size="small" />;
      case "CANCELLED":
        return <Chip label="CANCELADO" color="error" size="small" />;
      default:
        return <Chip label={st} size="small" />;
    }
  };

  return (
    <Container sx={{ mt: 3, mb: 4 }}>
      {/* Encabezado */}
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
        <Typography variant="h4" fontWeight="bold">
          Catálogo Público de Flota y Alquileres
        </Typography>
        <Button variant="contained" startIcon={<RefreshIcon />} onClick={loadData} disabled={loading}>
          Refrescar
        </Button>
      </Stack>

      {/* Manejo de Error */}
      {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

      {/* Manejo de Carga */}
      {loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
          <CircularProgress size={50} />
        </Box>
      ) : (
        <Stack spacing={4}>
          {/* TABLA DE VEHÍCULOS */}
          <Paper sx={{ p: 3 }}>
            <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 2 }}>
              <DirectionsCarIcon color="primary" />
              <Typography variant="h6">Vehículos de la Flota (PostgreSQL)</Typography>
            </Stack>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell><strong>ID</strong></TableCell>
                  <TableCell><strong>Placa</strong></TableCell>
                  <TableCell><strong>Marca / Modelo</strong></TableCell>
                  <TableCell><strong>Tarifa Diaria</strong></TableCell>
                  <TableCell><strong>Disponibilidad</strong></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {vehicles.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} align="center">No hay vehículos registrados.</TableCell>
                  </TableRow>
                ) : (
                  vehicles.map((v) => (
                    <TableRow key={v.id} hover>
                      <TableCell>{v.id}</TableCell>
                      <TableCell><strong>{v.plate}</strong></TableCell>
                      <TableCell>{v.brand}</TableCell>
                      <TableCell>${Number(v.daily_rate).toFixed(2)}</TableCell>
                      <TableCell>
                        <Chip
                          label={v.is_available ? "DISPONIBLE" : "ALQUILADO / NO DISP."}
                          color={v.is_available ? "success" : "default"}
                          size="small"
                        />
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </Paper>

          {/* TABLA DE ALQUILERES */}
          <Paper sx={{ p: 3 }}>
            <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 2 }}>
              <ReceiptLongIcon color="primary" />
              <Typography variant="h6">Alquileres y Reservas Registradas (PostgreSQL)</Typography>
            </Stack>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell><strong>ID</strong></TableCell>
                  <TableCell><strong>Vehículo</strong></TableCell>
                  <TableCell><strong>Cliente</strong></TableCell>
                  <TableCell><strong>Total Facturado</strong></TableCell>
                  <TableCell><strong>Estado</strong></TableCell>
                  <TableCell><strong>Fecha Registro</strong></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {rentals.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} align="center">No hay alquileres registrados.</TableCell>
                  </TableRow>
                ) : (
                  rentals.map((r) => (
                    <TableRow key={r.id} hover>
                      <TableCell>{r.id}</TableCell>
                      <TableCell>
                        {r.vehicle_plate ? `${r.vehicle_plate} (${r.vehicle_brand})` : `Vehículo #${r.vehicle}`}
                      </TableCell>
                      <TableCell><strong>{r.customer_name}</strong></TableCell>
                      <TableCell>${Number(r.total).toFixed(2)}</TableCell>
                      <TableCell>{renderRentalStatus(r.status)}</TableCell>
                      <TableCell>{r.created_at ? new Date(r.created_at).toLocaleString() : "-"}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </Paper>
        </Stack>
      )}
    </Container>
  );
}