/**
 * ============================================================================
 * PANTALLA: INICIO DE SESIÓN JWT (LoginScreen.tsx)
 * ============================================================================
 * Autentica contra POST /api/auth/login/ y almacena los tokens en memoria global.
 */

import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";

import { loginApi } from "../api/auth.api";
import type { RootStackParamList } from "../types/navigation";

type NavProp = NativeStackNavigationProp<RootStackParamList, "Login">;

type GlobalAuthStore = {
  accessToken?: string;
  refreshToken?: string;
};

export default function LoginScreen() {
  const navigation = useNavigation<NavProp>();

  // Credenciales por defecto
  const [username, setUsername] = useState("admin");
  const [password, setPassword] = useState("admin");

  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const handleLogin = async (): Promise<void> => {
    try {
      setErrorMessage("");
      setSuccessMessage("");

      if (!username.trim() || !password.trim()) {
        setErrorMessage("Ingrese usuario y contraseña.");
        return;
      }

      setLoading(true);
      const data = await loginApi(username.trim(), password.trim());

      // Guardar tokens en el store global en memoria
      const store = globalThis as unknown as GlobalAuthStore;
      store.accessToken = data.access;
      store.refreshToken = data.refresh;

      setSuccessMessage("Autenticación exitosa. Redirigiendo...");

      setTimeout(() => {
        navigation.replace("Home");
      }, 400);
    } catch {
      setErrorMessage("Credenciales inválidas o servidor desconectado.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.title}>Agencia de Alquiler</Text>
        <Text style={styles.subtitle}>Gestión Operativa Móvil (NoSQL)</Text>

        {/* Mensajes de feedback */}
        {!!errorMessage && <Text style={styles.error}>{errorMessage}</Text>}
        {!!successMessage && <Text style={styles.success}>{successMessage}</Text>}

        {/* Input Usuario */}
        <Text style={styles.label}>Usuario</Text>
        <TextInput
          value={username}
          onChangeText={setUsername}
          placeholder="admin"
          placeholderTextColor="#8b949e"
          autoCapitalize="none"
          style={styles.input}
        />

        {/* Input Contraseña */}
        <Text style={styles.label}>Contraseña</Text>
        <TextInput
          value={password}
          onChangeText={setPassword}
          placeholder="••••••"
          placeholderTextColor="#8b949e"
          secureTextEntry
          style={styles.input}
        />

        {/* Botón Ingresar */}
        <Pressable
          onPress={handleLogin}
          style={({ pressed }) => [styles.btn, pressed && styles.btnPressed]}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#58a6ff" />
          ) : (
            <Text style={styles.btnText}>Iniciar Sesión (JWT)</Text>
          )}
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0d1117",
    justifyContent: "center",
    padding: 20,
  },
  card: {
    backgroundColor: "#161b22",
    borderColor: "#30363d",
    borderWidth: 1,
    borderRadius: 12,
    padding: 20,
  },
  title: {
    color: "#58a6ff",
    fontSize: 22,
    fontWeight: "800",
    textAlign: "center",
  },
  subtitle: {
    color: "#8b949e",
    fontSize: 13,
    textAlign: "center",
    marginBottom: 16,
    marginTop: 4,
  },
  label: {
    color: "#8b949e",
    marginBottom: 6,
    fontWeight: "600",
  },
  input: {
    backgroundColor: "#0d1117",
    color: "#c9d1d9",
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#30363d",
    marginBottom: 12,
  },
  btn: {
    backgroundColor: "#21262d",
    borderColor: "#58a6ff",
    borderWidth: 1,
    padding: 14,
    borderRadius: 8,
    marginTop: 8,
  },
  btnPressed: {
    backgroundColor: "#30363d",
  },
  btnText: {
    color: "#58a6ff",
    textAlign: "center",
    fontWeight: "700",
    fontSize: 16,
  },
  error: {
    color: "#ff7b72",
    backgroundColor: "rgba(255, 123, 114, 0.1)",
    padding: 10,
    borderRadius: 6,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "rgba(255, 123, 114, 0.3)",
  },
  success: {
    color: "#3fb950",
    backgroundColor: "rgba(63, 185, 80, 0.1)",
    padding: 10,
    borderRadius: 6,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "rgba(63, 185, 80, 0.3)",
  },
});
