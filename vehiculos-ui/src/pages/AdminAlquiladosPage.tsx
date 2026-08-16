/**
 * ============================================================================
 * PÁGINA: ADMINISTRACIÓN DE ALQUILERES (ADMIN ALQUILADOS PAGE) - PRIVADO
 * ============================================================================
 * CRUD completo para la tabla 'rentals' en PostgreSQL:
 * - Listar alquileres con datos del vehículo (GET /api/rentals/)
 * - Crear alquiler (POST /api/rentals/) -> Genera evento automático en MongoDB
 * - Actualizar alquiler (PATCH /api/rentals/:id/)
 * - Eliminar alquiler (DELETE /api/rentals/:id/)
 */

import { useEffect, useState } from "react";
import {
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  Stack,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  IconButton,
  Alert,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";

import { type Vehiculo, listVehiculosAdminApi } from "../api/vehiculos.api";
import {
  type Rental,
  type RentalStatus,
  listRentalsApi,
  createRentalApi,
  updateRentalApi,
  deleteRentalApi,
} from "../api/rentals.api";
import { getErrorMessage } from "../api/http";

export default function AdminAlquiladosPage() {
  const [rentals, setRentals] = useState<Rental[]>([]);
  const [vehicles, setVehicles] = useState<Vehiculo[]>([]);

  // Estados del formulario
  const [editId, setEditId] = useState<number | null>(null);
  const [vehicleId, setVehicleId] = useState<number | "">("");
  const [customerName, setCustomerName] = useState("");
  const [total, setTotal] = useState<number | "">(120.0);
  const [status, setStatus] = useState<RentalStatus>("RESERVED");

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const reset = () => {
    setEditId(null);
    setCustomerName("");
    setTotal(120.0);
    setStatus("RESERVED");
  };

  const load = async () => {
    try {
      setError("");
      const [rentalsRes, vehiclesRes] = await Promise.all([
        listRentalsApi(),
        listVehiculosAdminApi(),
      ]);
      setRentals(rentalsRes.results || []);
      setVehicles(vehiclesRes.results || []);
      if (vehiclesRes.results?.length > 0 && vehicleId === "") {
        setVehicleId(vehiclesRes.results[0].id);
      }
    } catch (err: unknown) {
      setError(getErrorMessage(err, "No se pudieron cargar alquileres. ¿Token admin activo?"));
    }
  };

  useEffect(() => {
    load();
  }, []);

  const save = async () => {
    try {
      setError("");
      setSuccess("");

      if (!vehicleId) return setError("Debe seleccionar un vehículo de la lista.");
      if (!customerName.trim()) return setError("El nombre del cliente es obligatorio.");
      if (total === "" || Number(total) <= 0) return setError("El total del alquiler debe ser mayor a 0.");

      const payload = {
        vehicle: Number(vehicleId),
        customer_name: customerName.trim(),
        total: Number(total),
        status,
      };

      if (editId) {
        await updateRentalApi(editId, payload);
        setSuccess("Alquiler actualizado correctamente en PostgreSQL.");
      } else {
        await createRentalApi(payload);
        setSuccess("Alquiler creado en PostgreSQL y registrado evento en MongoDB.");
      }
      reset();
      await load();
    } catch (err: unknown) {
      setError(getErrorMessage(err, "No se pudo guardar el alquiler. Verifique los datos."));
    }
  };

  const startEdit = (r: Rental) => {
    setEditId(r.id);
    setVehicleId(r.vehicle);
    setCustomerName(r.customer_name);
    setTotal(Number(r.total));
    setStatus(r.status);
    setError("");
    setSuccess("");
  };

  const remove = async (id: number) => {
    try {
      setError("");
      setSuccess("");
      await deleteRentalApi(id);
      setSuccess("Alquiler eliminado correctamente.");
      await load();
    } catch (err: unknown) {
      setError(getErrorMessage(err, "No se pudo eliminar el alquiler."));
    }
  };

  return (
    <Container sx={{ mt: 3, mb: 4 }}>
      <Paper sx={{ p: 3 }}>
        <Typography variant="h5" sx={{ mb: 2 }}>
          Admin Alquileres (Rentals - PostgreSQL)
        </Typography>

        {/* Mensajes de feedback */}
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}

        {/* Formulario */}
        <Stack spacing={2} sx={{ mb: 3 }}>
          <Stack direction={{ xs: "column", md: "row" }} spacing={2}>
            {/* Select de Vehículo */}
            <FormControl sx={{ minWidth: 260 }}>
              <InputLabel id="veh-label">Vehículo</InputLabel>
              <Select
                labelId="veh-label"
                label="Vehículo"
                value={vehicleId}
                onChange={(e) => setVehicleId(Number(e.target.value))}
              >
                {vehicles.map((v) => (
                  <MenuItem key={v.id} value={v.id}>
                    {v.plate} - {v.brand} (${v.daily_rate}/d)
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            {/* Nombre del Cliente */}
            <TextField
              label="Nombre del Cliente"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              fullWidth
            />
          </Stack>

          <Stack direction={{ xs: "column", md: "row" }} spacing={2} alignItems="center">
            {/* Monto Total */}
            <TextField
              label="Total Facturado ($)"
              type="number"
              value={total}
              onChange={(e) => setTotal(e.target.value === "" ? "" : Number(e.target.value))}
              sx={{ minWidth: 200 }}
            />

            {/* Estado del Alquiler */}
            <FormControl sx={{ minWidth: 200 }}>
              <InputLabel id="st-label">Estado</InputLabel>
              <Select
                labelId="st-label"
                label="Estado"
                value={status}
                onChange={(e) => setStatus(e.target.value as RentalStatus)}
              >
                <MenuItem value="RESERVED">RESERVED (Reservado)</MenuItem>
                <MenuItem value="ACTIVE">ACTIVE (En curso / Entregado)</MenuItem>
                <MenuItem value="CLOSED">CLOSED (Cerrado / Liquidado)</MenuItem>
                <MenuItem value="CANCELLED">CANCELLED (Cancelado)</MenuItem>
              </Select>
            </FormControl>

            {/* Botones */}
            <Button variant="contained" onClick={save} sx={{ minWidth: 120 }}>
              {editId ? "Actualizar" : "Crear"}
            </Button>
            <Button variant="outlined" onClick={() => { reset(); setError(""); setSuccess(""); }} sx={{ minWidth: 100 }}>
              Limpiar
            </Button>
            <Button variant="outlined" onClick={load} sx={{ minWidth: 100 }}>
              Refrescar
            </Button>
          </Stack>
        </Stack>

        {/* Tabla */}
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell><strong>ID</strong></TableCell>
              <TableCell><strong>Vehículo</strong></TableCell>
              <TableCell><strong>Cliente</strong></TableCell>
              <TableCell><strong>Total</strong></TableCell>
              <TableCell><strong>Estado</strong></TableCell>
              <TableCell><strong>Fecha de Registro</strong></TableCell>
              <TableCell align="right"><strong>Acciones</strong></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {rentals.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} align="center">
                  No hay alquileres registrados.
                </TableCell>
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
                  <TableCell>
                    <Chip
                      label={r.status}
                      size="small"
                      color={
                        r.status === "ACTIVE"
                          ? "warning"
                          : r.status === "CLOSED"
                          ? "success"
                          : r.status === "RESERVED"
                          ? "primary"
                          : "default"
                      }
                    />
                  </TableCell>
                  <TableCell>{r.created_at ? new Date(r.created_at).toLocaleString() : "-"}</TableCell>
                  <TableCell align="right">
                    <IconButton color="primary" onClick={() => startEdit(r)} title="Editar">
                      <EditIcon />
                    </IconButton>
                    <IconButton color="error" onClick={() => remove(r.id)} title="Eliminar">
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Paper>
    </Container>
  );
}
