/**
 * ============================================================================
 * PÁGINA DE LOGIN (LOGIN PAGE) - VEHICULOS UI
 * ============================================================================
 */

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Container, Paper, Typography, TextField, Button, Stack, Alert } from "@mui/material";
import { loginApi } from "../api/auth.api";
import { getErrorMessage } from "../api/http";

export default function LoginPage() {
  const navigate = useNavigate();

  const [username, setUsername] = useState("admin");
  const [password, setPassword] = useState("admin");
  const [msg, setMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const doLogin = async () => {
    try {
      const data = await loginApi(username, password);
      localStorage.setItem("accessToken", data.access);
      localStorage.setItem("refreshToken", data.refresh);
      setMsg({ type: "success", text: "Login exitoso. Redirigiendo al panel administrativo..." });
      setTimeout(() => {
        navigate("/admin");
      }, 500);
    } catch (err: unknown) {
      setMsg({
        type: "error",
        text: getErrorMessage(err, "Login falló. Verifique credenciales y conexión al backend."),
      });
    }
  };

  const clear = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    setMsg({ type: "success", text: "Tokens eliminados (logout local realizado)." });
  };

  return (
    <Container sx={{ mt: 4 }}>
      <Paper sx={{ p: 4, maxWidth: 480, mx: "auto" }}>
        <Typography variant="h5" sx={{ mb: 2, fontWeight: "bold" }}>
          Inicio de Sesión (JWT)
        </Typography>

        <Stack spacing={2}>
          {msg && <Alert severity={msg.type}>{msg.text}</Alert>}

          <TextField
            label="Usuario"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            fullWidth
          />
          <TextField
            label="Contraseña"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            fullWidth
          />

          <Button variant="contained" size="large" onClick={doLogin}>
            Ingresar
          </Button>
          <Button variant="outlined" color="secondary" onClick={clear}>
            Cerrar Sesión / Limpiar Tokens
          </Button>
        </Stack>
      </Paper>
    </Container>
  );
}