import { useEffect, useState } from "react";
import {
  Container, Paper, Typography, TextField, Button, Stack,
  Table, TableHead, TableRow, TableCell, TableBody, IconButton, Alert
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";

import { type Rental, listRentalsApi, createRentalApi, updateRentalApi, deleteRentalApi } from "../api/rentals.api";


export default function AdminAlquiladosPage() {
  const [items, setItems] = useState<Rental[]>([]);
  const [vehicle, setVehicle] = useState(0);
  const [customerName, setCustomerName] = useState("");
  const [total, setTotal] = useState(0);
  const [status, setStatus] = useState("");
  const [createdAt, setCreatedAt] = useState("");
  const [editId, setEditId] = useState<number | null>(null);
  const [error, setError] = useState("");

  const load = async () => {
    try {
      setError("");
      const data = await listRentalsApi();
      setItems(data.results); // DRF paginado
    } catch {
      setError("No se pudo cargar alquilados. ¿Login? ¿Token admin?");
    }
  };

  useEffect(() => { load(); }, []);

  const save = async () => {
    try {
      setError("");
      if (!customerName.trim()) return setError("Nombre requerido");

      const payload = {
        vehicle,
        customer_name: customerName.trim(),
        total,
        status,
        created_at: createdAt,
      };

      const body = JSON.stringify(payload);

      if (editId !== null) await updateRentalApi(editId, body);
      else await createRentalApi(body);

      setVehicle(0);
      setCustomerName("");
      setTotal(0);
      setStatus("");
      setCreatedAt("");
      setEditId(null);
      await load();
    } catch {
      setError("No se pudo guardar alquilado. ¿Token admin?");
    }
  };

  const startEdit = (r: Rental) => {
    setEditId(r.id);
    setVehicle(r.vehicle);
    setCustomerName(r.customer_name);
    setTotal(r.total);
    setStatus(r.status);
    setCreatedAt(r.created_at);
  };

  const remove = async (id: number) => {
    try {
      setError("");
      await deleteRentalApi(id);
      await load();
    } catch {
      setError("No se pudo eliminar alquilado. ¿Vehículos asociados? ¿Token admin?");
    }
  };

  return (
    <Container sx={{ mt: 3 }}>
      <Paper sx={{ p: 3 }}>
        <Typography variant="h5" sx={{ mb: 2 }}>Admin Alquilados (Privado)</Typography>

        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

        <Stack direction={{ xs: "column", sm: "row" }} spacing={2} sx={{ mb: 2 }}>
          <TextField label="Vehículo" type="number" value={vehicle} onChange={(e) => setVehicle(Number(e.target.value))} fullWidth />
          <TextField label="Cliente" value={customerName} onChange={(e) => setCustomerName(e.target.value)} fullWidth />
          <TextField label="Total" type="number" value={total} onChange={(e) => setTotal(Number(e.target.value))} fullWidth />
          <TextField label="Estado" value={status} onChange={(e) => setStatus(e.target.value)} fullWidth />
          <TextField label="Creado en" value={createdAt} onChange={(e) => setCreatedAt(e.target.value)} fullWidth />
          <Button variant="contained" onClick={save}>{editId ? "Actualizar" : "Crear"}</Button>
          <Button variant="outlined" onClick={() => { setVehicle(0); setCustomerName(""); setTotal(0); setStatus(""); setCreatedAt(""); setEditId(null); }}>Limpiar</Button>
          <Button variant="outlined" onClick={load}>Refrescar</Button>
        </Stack>

        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>Nombre</TableCell>
              <TableCell align="right">Acciones</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {items.map((m) => (
              <TableRow key={m.id}>
                <TableCell>{m.id}</TableCell>
                <TableCell>{m.customer_name}</TableCell>
                <TableCell align="right">
                  <IconButton onClick={() => startEdit(m)}><EditIcon /></IconButton>
                  <IconButton onClick={() => remove(m.id)}><DeleteIcon /></IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Paper>
    </Container>
  );
}
