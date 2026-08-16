/**
 * ============================================================================
 * ARCHIVO PRINCIPAL DE LA APLICACIÓN (App.tsx) - VEHICULOS RN
 * ============================================================================
 * Configura la navegación raíz usando React Navigation (Native Stack) con tema oscuro.
 * Rutas:
 * 1. Login: Autenticación JWT
 * 2. Home: Panel principal de operaciones
 * 3. FleetLogs: Bitácora de Flota en MongoDB
 * 4. RentalEvents: Eventos Operativos de Alquiler en MongoDB (con 2 Selects)
 */

import React from "react";
import { StatusBar } from "expo-status-bar";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

// Pantallas
import LoginScreen from "./src/screens/LoginScreen";
import HomeScreen from "./src/screens/HomeScreen";
import FleetLogsScreen from "./src/screens/FleetLogsScreen";
import RentalEventsScreen from "./src/screens/RentalEventsScreen";

import type { RootStackParamList } from "./src/types/navigation";

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function App() {
  return (
    <NavigationContainer>
      <StatusBar style="light" />

      <Stack.Navigator
        initialRouteName="Login"
        screenOptions={{
          headerStyle: {
            backgroundColor: "#161b22",
          },
          headerTintColor: "#58a6ff",
          headerTitleStyle: {
            fontWeight: "bold",
          },
          contentStyle: {
            backgroundColor: "#0d1117",
          },
        }}
      >
        {/* Login JWT */}
        <Stack.Screen
          name="Login"
          component={LoginScreen}
          options={{
            title: "Inicio de Sesión",
            headerShown: false,
          }}
        />

        {/* Menú Principal */}
        <Stack.Screen
          name="Home"
          component={HomeScreen}
          options={{
            title: "Panel Operativo",
            headerBackVisible: false,
          }}
        />

        {/* Bitácora de Flota (MongoDB) */}
        <Stack.Screen
          name="FleetLogs"
          component={FleetLogsScreen}
          options={{
            title: "Bitácora de Flota",
          }}
        />

        {/* Eventos de Alquiler (MongoDB) */}
        <Stack.Screen
          name="RentalEvents"
          component={RentalEventsScreen}
          options={{
            title: "Eventos de Alquiler",
          }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
