/**
 * ============================================================================
 * PÁGINA: ADMINISTRACIÓN DE VEHÍCULOS (ADMIN VEHÍCULOS PAGE) - PRIVADO
 * ============================================================================
 * CRUD completo para la tabla 'vehicles' en PostgreSQL:
 * - Listar vehículos (GET /api/vehicles/)
 * - Crear vehículo (POST /api/vehicles/)
 * - Actualizar vehículo (PATCH /api/vehicles/:id/)
 * - Eliminar vehículo (DELETE /api/vehicles/:id/)
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
  FormControlLabel,
  Checkbox,
  Chip,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";

import {
  type Vehiculo,
  listVehiculosAdminApi,
  createVehiculoApi,
  updateVehiculoApi,
  deleteVehiculoApi,
} from "../api/vehiculos.api";
import { getErrorMessage } from "../api/http";

export default function AdminVehiculosPage() {
  const [items, setItems] = useState<Vehiculo[]>([]);
  const [plate, setPlate] = useState("");
  const [brand, setBrand] = useState("");
  const [dailyRate, setDailyRate] = useState<number | "">(45.0);
  const [isAvailable, setIsAvailable] = useState(true);

  const [editId, setEditId] = useState<number | null>(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const reset = () => {
    setEditId(null);
    setPlate("");
    setBrand("");
    setDailyRate(45.0);
    setIsAvailable(true);
  };

  const load = async () => {
    try {
      setError("");
      const data = await listVehiculosAdminApi();
      setItems(data.results || []);
    } catch (err: unknown) {
      setError(getErrorMessage(err, "No se pudieron cargar los vehículos. ¿Token admin activo?"));
    }
  };

  useEffect(() => {
    load();
  }, []);

  const save = async () => {
    try {
      setError("");
      setSuccess("");

      if (!plate.trim()) return setError("La placa es obligatoria (ej: PBA-1020).");
      if (!brand.trim()) return setError("La marca/modelo es obligatoria (ej: Toyota RAV4).");
      if (dailyRate === "" || Number(dailyRate) <= 0) return setError("La tarifa diaria debe ser mayor a 0.");

      const payload = {
        plate: plate.trim().toUpperCase(),
        brand: brand.trim(),
        daily_rate: Number(dailyRate),
        is_available: isAvailable,
      };

      if (editId) {
        await updateVehiculoApi(editId, payload);
        setSuccess("Vehículo actualizado correctamente en PostgreSQL.");
      } else {
        await createVehiculoApi(payload);
        setSuccess("Vehículo creado correctamente en PostgreSQL.");
      }
      reset();
      await load();
    } catch (err: unknown) {
      setError(getErrorMessage(err, "No se pudo guardar el vehículo. Verifique si la placa ya existe."));
    }
  };

  const startEdit = (v: Vehiculo) => {
    setEditId(v.id);
    setPlate(v.plate);
    setBrand(v.brand);
    setDailyRate(Number(v.daily_rate));
    setIsAvailable(v.is_available);
    setError("");
    setSuccess("");
  };

  const remove = async (id: number) => {
    try {
      setError("");
      setSuccess("");
      await deleteVehiculoApi(id);
      setSuccess("Vehículo eliminado correctamente.");
      await load();
    } catch (err: unknown) {
      setError(getErrorMessage(err, "No se pudo eliminar el vehículo. ¿Tiene alquileres asociados?"));
    }
  };

  return (
    <Container sx={{ mt: 3, mb: 4 }}>
      <Paper sx={{ p: 3 }}>
        <Typography variant="h5" sx={{ mb: 2 }}>
          Admin Vehículos (Flota PostgreSQL)
        </Typography>

        {/* Mensajes de feedback */}
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}

        {/* Formulario */}
        <Stack direction={{ xs: "column", sm: "row" }} spacing={2} alignItems="center" sx={{ mb: 3 }}>
          <TextField
            label="Placa (ej: PBA-1020)"
            value={plate}
            onChange={(e) => setPlate(e.target.value)}
            fullWidth
          />
          <TextField
            label="Marca / Modelo"
            value={brand}
            onChange={(e) => setBrand(e.target.value)}
            fullWidth
          />
          <TextField
            label="Tarifa Diaria ($)"
            type="number"
            value={dailyRate}
            onChange={(e) => setDailyRate(e.target.value === "" ? "" : Number(e.target.value))}
            sx={{ minWidth: 150 }}
          />
          <FormControlLabel
            control={
              <Checkbox
                checked={isAvailable}
                onChange={(e) => setIsAvailable(e.target.checked)}
              />
            }
            label="Disponible"
            sx={{ minWidth: 140 }}
          />
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

        {/* Tabla */}
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell><strong>ID</strong></TableCell>
              <TableCell><strong>Placa</strong></TableCell>
              <TableCell><strong>Marca / Modelo</strong></TableCell>
              <TableCell><strong>Tarifa Diaria</strong></TableCell>
              <TableCell><strong>Disponibilidad</strong></TableCell>
              <TableCell align="right"><strong>Acciones</strong></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {items.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} align="center">
                  No hay vehículos registrados.
                </TableCell>
              </TableRow>
            ) : (
              items.map((v) => (
                <TableRow key={v.id} hover>
                  <TableCell>{v.id}</TableCell>
                  <TableCell><strong>{v.plate}</strong></TableCell>
                  <TableCell>{v.brand}</TableCell>
                  <TableCell>${Number(v.daily_rate).toFixed(2)}</TableCell>
                  <TableCell>
                    <Chip
                      label={v.is_available ? "DISPONIBLE" : "OCUPADO / MANTENIMIENTO"}
                      color={v.is_available ? "success" : "default"}
                      size="small"
                    />
                  </TableCell>
                  <TableCell align="right">
                    <IconButton color="primary" onClick={() => startEdit(v)} title="Editar">
                      <EditIcon />
                    </IconButton>
                    <IconButton color="error" onClick={() => remove(v.id)} title="Eliminar">
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