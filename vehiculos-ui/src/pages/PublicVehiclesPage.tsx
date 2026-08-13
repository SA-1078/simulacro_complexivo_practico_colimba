import { useEffect, useState } from "react";
import { Container, Paper, Typography, Button, Stack, Table, TableHead, TableRow, TableCell, TableBody } from "@mui/material";
import { type Vehiculo, listVehiculosPublicApi } from "../api/vehiculos.api";

export default function PublicVehiclesPage() {
    const [items, setItems] = useState<Vehiculo[]>([]);
    const [error, setError] = useState("");

    const load = async () => {
        try {
            setError("");
            const data = await listVehiculosPublicApi();
            setItems(data.results); // DRF paginado
        } catch {
            setError("No se pudo cargar la lista pública. ¿Backend encendido?");
        }
    };

    useEffect(() => { load(); }, []);

    return (
        <Container sx={{ mt: 3 }}>
            <Paper sx={{ p: 3 }}>
                <Stack direction="row" sx={{ mb: 2 }}>
                    <Typography variant="h5">Lista de Vehículos (Público)</Typography>
                    <Button variant="outlined" onClick={load}>Refrescar</Button>
                </Stack>

                {error && <Typography color="error" sx={{ mb: 2 }}>{error}</Typography>}

                <Table size="small">
                    <TableHead>
                        <TableRow>
                            <TableCell>ID</TableCell>
                            <TableCell>plate</TableCell>
                            <TableCell>brand</TableCell>
                            <TableCell>daily_rate</TableCell>
                            <TableCell>is_available</TableCell>
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
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </Paper>
        </Container>
    );
}