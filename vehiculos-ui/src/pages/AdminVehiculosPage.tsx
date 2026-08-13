import { useEffect, useState } from "react";
import {
  Container, Paper, Typography, TextField, Button, Stack,
  Table, TableHead, TableRow, TableCell, TableBody, IconButton, Alert,
  FormControl, InputLabel, Select, MenuItem
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";

import { type Rental, listRentalsApi } from "../api/rentals.api";
import { type Vehiculo, listVehiculosAdminApi, createVehiculoApi, updateVehiculoApi, deleteVehiculoApi } from "../api/vehiculos.api";



export default function AdminVehiculosPage() {
  const [items, setItems] = useState<Vehiculo[]>([]);
  const [rentals, setRentals] = useState<Rental[]>([]);
  const [error, setError] = useState("");

  const [editId, setEditId] = useState<number | null>(null);

  const [plate, setPlate] = useState("");
  const [brand, setBrand] = useState("");
  const [daily_rate, setDailyRate] = useState(0);
  const [is_available, setIsAvailable] = useState(true);
  const brandOptions = Array.from(new Set(items.map((v) => v.brand)));
  

  const load = async () => {
      try {
      setError("");
      const data = await listVehiculosAdminApi();
      setItems(data.results); // DRF paginado
    } catch {
      setError("No se pudo cargar vehículos. ¿Login? ¿Token admin?");
    }
  };

  const loadRentals = async () => {
    try {
      const data = await listRentalsApi();
      setRentals(data.results); // DRF paginado
    } catch {
      // si falla, no bloquea la pantalla
    }
  };

  useEffect(() => { load(); loadRentals(); }, []);

  const save = async () => {
    try {
        setError("");
        if (!brand) return setError("Seleccione una marca");
        if (!is_available) return setError("Seleccione si el vehículo está disponible");
        
        const payload = {
            plate: String(plate),
            brand: String(brand),
            daily_rate: Number(daily_rate),
            is_available: Boolean(is_available),
        };
        
        if (editId) await updateVehiculoApi(editId, payload);
        else await createVehiculoApi(payload as any);
        
        setEditId(null);
        setPlate("");
        setBrand("");
        setDailyRate(0);
        setIsAvailable(true);
        await load();
    } catch {
      setError("No se pudo guardar vehículo. ¿Token admin?");
    }
  };

  const startEdit = (v: Vehiculo) => {
    setEditId(v.id);
    setPlate(v.plate);
    setBrand(v.brand);
    setDailyRate(v.daily_rate);
    setIsAvailable(v.is_available);
  };

  const remove = async (id: number) => {
    try {
      setError("");
      await deleteVehiculoApi(id);
      await load();
    } catch {
        setError("No se pudo eliminar vehículo. ¿Token admin?");
    }
  };

  return (
    <Container sx={{ mt: 3 }}>
      <Paper sx={{ p: 3 }}>
        <Typography variant="h5" sx={{ mb: 2 }}>Admin Vehículos (Privado)</Typography>

        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

        <Stack spacing={2} sx={{ mb: 2 }}>
          <Stack direction={{ xs: "column", md: "row" }} spacing={2}>

            <FormControl sx={{ width: 260 }}>
              <InputLabel id="marca-label">Marca</InputLabel>
              <Select
                labelId="marca-label"
                label="Marca"
                value={brand}
                onChange={(e) => setBrand(String(e.target.value))}
              >
                {brandOptions.map((m) => (
                  <MenuItem key={m} value={m}>
                    {m}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <TextField label="Placa" value={plate} onChange={(e) => setPlate(e.target.value)} fullWidth />
            <TextField label="Marca" value={brand} onChange={(e) => setBrand(e.target.value)} sx={{ width: 160 }} />
            <TextField label="Tarifa diaria" type="number" value={daily_rate} onChange={(e) => setDailyRate(Number(e.target.value))} sx={{ width: 160 }} />
            <FormControl sx={{ width: 160 }}>
              <InputLabel id="disponible-label">Disponible</InputLabel>
              <Select
                labelId="disponible-label"
                label="Disponible"
                value={is_available ? "true" : "false"}
                onChange={(e) => setIsAvailable(e.target.value === "true")}
              >
                <MenuItem value="true">Sí</MenuItem>
                <MenuItem value="false">No</MenuItem>
              </Select>
            </FormControl>  
          </Stack>

          <Stack direction={{ xs: "column", md: "row" }} spacing={2}>

            <Button variant="contained" onClick={save}>{editId ? "Actualizar" : "Crear"}</Button>
            <Button variant="outlined" onClick={() => { setEditId(null); setPlate(""); setBrand(""); setDailyRate(0); setIsAvailable(true); }}>Limpiar</Button>
            <Button variant="outlined" onClick={() => { load(); loadRentals(); }}>Refrescar</Button>
          </Stack>
        </Stack>

        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>Placa</TableCell>
              <TableCell>Marca</TableCell>
              <TableCell>Tarifa diaria</TableCell>
              <TableCell>Disponible</TableCell>
              <TableCell align="right">Acciones</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {items.map((v) => (
              <TableRow key={v.id}>
                <TableCell>{v.id}</TableCell>
                <TableCell>{v.plate}</TableCell>
                <TableCell>{v.brand}</TableCell>
                <TableCell>{v.daily_rate}</TableCell>
                <TableCell>{v.is_available ? "Sí" : "No"}</TableCell>
                <TableCell align="right">
                  <IconButton onClick={() => startEdit(v)}><EditIcon /></IconButton>
                  <IconButton onClick={() => remove(v.id)}><DeleteIcon /></IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Paper>
    </Container>
  );
}