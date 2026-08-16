/**
 * ============================================================================
 * PANTALLA: BITÁCORA DE FLOTA (FleetLogsScreen.tsx - MONGODB)
 * ============================================================================
 * Gestiona la colección NoSQL 'fleet_logs' vinculada con vehículos PostgreSQL:
 * - Select de Vehículo (PostgreSQL)
 * - Select de Acción (CREATED | UPDATED | MAINTENANCE | DISABLED)
 * - RadioGroup de Origen (MOBILE | SYSTEM)
 * - Input de notas descriptivas
 * - Lista y eliminación de logs
 */

import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  FlatList,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import { Picker } from "@react-native-picker/picker";

import { listVehiclesApi } from "../api/vehicles.api";
import {
  listFleetLogsApi,
  createFleetLogApi,
  deleteFleetLogApi,
} from "../api/fleetLogs.api";

import RadioGroup from "../components/RadioGroup";
import type { Vehicle } from "../types/vehicle";
import type { FleetLog, FleetAction, EventSource } from "../types/fleetLog";
import { toArray } from "../types/drf";

export default function FleetLogsScreen() {
  const [logs, setLogs] = useState<FleetLog[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);

  // Estados del formulario
  const [selectedVehicleId, setSelectedVehicleId] = useState<number | null>(null);
  const [action, setAction] = useState<FleetAction>("MAINTENANCE");
  const [source, setSource] = useState<EventSource>("MOBILE");
  const [note, setNote] = useState("");

  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const loadData = async (): Promise<void> => {
    try {
      setLoading(true);
      setErrorMessage("");
      const [logsRes, vehiclesRes] = await Promise.all([
        listFleetLogsApi(),
        listVehiclesApi(),
      ]);

      const vList = toArray(vehiclesRes);
      setLogs(logsRes || []);
      setVehicles(vList);

      if (selectedVehicleId === null && vList.length > 0) {
        setSelectedVehicleId(vList[0].id);
      }
    } catch {
      setErrorMessage("Error al cargar bitácora. Verifique que Django y MongoDB estén activos.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreateLog = async (): Promise<void> => {
    try {
      setErrorMessage("");
      setSuccessMessage("");

      if (selectedVehicleId === null) {
        setErrorMessage("Seleccione un vehículo.");
        return;
      }

      setActionLoading(true);

      const created = await createFleetLogApi({
        vehicle_id: selectedVehicleId,
        action,
        source,
        note: note.trim() ? note.trim() : undefined,
      });

      setLogs((prev) => [created, ...prev]);
      setNote("");
      setSuccessMessage("Bitácora registrada en MongoDB con éxito.");
    } catch {
      setErrorMessage("No se pudo registrar la bitácora en MongoDB.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteLog = async (id: string): Promise<void> => {
    try {
      setErrorMessage("");
      setSuccessMessage("");
      await deleteFleetLogApi(id);
      setLogs((prev) => prev.filter((l) => l.id !== id));
      setSuccessMessage("Registro eliminado de MongoDB.");
    } catch {
      setErrorMessage("No se pudo eliminar el registro.");
    }
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={logs}
        keyExtractor={(item) => item.id}
        style={styles.list}
        ListHeaderComponent={
          <View style={styles.formCard}>
            <Text style={styles.title}>Bitácora de Flota (MongoDB)</Text>
            <Text style={styles.subtitle}>
              Historial de mantenimiento y cambios de vehículos
            </Text>

            {/* Mensajes de feedback */}
            {!!errorMessage && <Text style={styles.error}>{errorMessage}</Text>}
            {!!successMessage && <Text style={styles.success}>{successMessage}</Text>}

            {/* Selector de Vehículo (PostgreSQL) */}
            <Text style={styles.label}>1. Vehículo (PostgreSQL)</Text>
            <View style={styles.pickerWrapper}>
              <Picker
                selectedValue={selectedVehicleId ?? ""}
                onValueChange={(val) => setSelectedVehicleId(Number(val))}
                dropdownIconColor="#58a6ff"
                style={styles.picker}
              >
                {vehicles.length === 0 ? (
                  <Picker.Item label="No hay vehículos en PostgreSQL" value="" />
                ) : (
                  vehicles.map((v) => (
                    <Picker.Item
                      key={v.id}
                      label={`#${v.id} - ${v.plate} (${v.brand})`}
                      value={v.id}
                    />
                  ))
                )}
              </Picker>
            </View>

            {/* Selector de Acción */}
            <Text style={styles.label}>2. Acción Realizada</Text>
            <View style={styles.pickerWrapper}>
              <Picker
                selectedValue={action}
                onValueChange={(val) => setAction(val as FleetAction)}
                dropdownIconColor="#58a6ff"
                style={styles.picker}
              >
                <Picker.Item label="MAINTENANCE (Mantenimiento / Taller)" value="MAINTENANCE" />
                <Picker.Item label="UPDATED (Actualización de datos/tarifa)" value="UPDATED" />
                <Picker.Item label="CREATED (Ingreso a la flota)" value="CREATED" />
                <Picker.Item label="DISABLED (Fuera de servicio)" value="DISABLED" />
              </Picker>
            </View>

            {/* RadioGroup de Origen */}
            <RadioGroup<EventSource>
              label="3. Origen del Registro"
              value={source}
              onChange={setSource}
              options={[
                { label: "MÓVIL (MOBILE)", value: "MOBILE" },
                { label: "SISTEMA (SYSTEM)", value: "SYSTEM" },
              ]}
            />

            {/* Notas */}
            <Text style={styles.label}>Notas u Observaciones (opcional)</Text>
            <TextInput
              placeholder="Ej: Cambio de aceite y filtros realizado a los 50,000 km"
              placeholderTextColor="#8b949e"
              value={note}
              onChangeText={setNote}
              style={styles.input}
            />

            {/* Botón Registrar */}
            <Pressable
              onPress={handleCreateLog}
              style={({ pressed }) => [styles.btn, pressed && styles.btnPressed]}
              disabled={actionLoading}
            >
              {actionLoading ? (
                <ActivityIndicator color="#58a6ff" />
              ) : (
                <Text style={styles.btnText}>Registrar en Mongo (sin fecha manual)</Text>
              )}
            </Pressable>

            {/* Botón Refrescar */}
            <Pressable
              onPress={loadData}
              style={({ pressed }) => [
                styles.btn,
                styles.btnOutline,
                pressed && styles.btnPressed,
              ]}
            >
              <Text style={[styles.btnText, styles.btnOutlineText]}>
                Refrescar Bitácora
              </Text>
            </Pressable>

            {loading && <ActivityIndicator color="#58a6ff" style={{ marginVertical: 12 }} />}
          </View>
        }
        renderItem={({ item }) => {
          const matchedVeh = vehicles.find((v) => v.id === item.vehicle_id);
          return (
            <View style={styles.row}>
              <View style={styles.rowInfo}>
                <Text style={styles.rowTitle}>
                  Vehículo #{item.vehicle_id}
                  {matchedVeh ? ` (${matchedVeh.plate})` : ""} — {item.action}
                </Text>
                <Text style={styles.rowSub}>Origen: {item.source}</Text>
                {!!item.note && <Text style={styles.rowSub}>Nota: {item.note}</Text>}
                {!!item.created_at && (
                  <Text style={styles.rowDate}>
                    Fecha: {new Date(item.created_at).toLocaleString()}
                  </Text>
                )}
              </View>

              <Pressable
                onPress={() => handleDeleteLog(item.id)}
                style={styles.delBtn}
              >
                <Text style={styles.delText}>Eliminar</Text>
              </Pressable>
            </View>
          );
        }}
        ListEmptyComponent={
          !loading ? (
            <Text style={styles.emptyText}>No hay registros en la bitácora de MongoDB.</Text>
          ) : null
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0d1117",
    padding: 16,
  },
  list: {
    flex: 1,
  },
  formCard: {
    marginBottom: 16,
  },
  title: {
    color: "#58a6ff",
    fontSize: 22,
    fontWeight: "800",
    marginTop: 4,
  },
  subtitle: {
    color: "#8b949e",
    fontSize: 13,
    marginBottom: 12,
  },
  error: {
    color: "#ff7b72",
    backgroundColor: "rgba(255, 123, 114, 0.1)",
    padding: 10,
    borderRadius: 6,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "rgba(255, 123, 114, 0.3)",
  },
  success: {
    color: "#3fb950",
    backgroundColor: "rgba(63, 185, 80, 0.1)",
    padding: 10,
    borderRadius: 6,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "rgba(63, 185, 80, 0.3)",
  },
  label: {
    color: "#8b949e",
    marginBottom: 6,
    marginTop: 8,
    fontWeight: "600",
  },
  pickerWrapper: {
    backgroundColor: "#161b22",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#30363d",
    marginBottom: 8,
    overflow: "hidden",
  },
  picker: {
    color: "#c9d1d9",
  },
  input: {
    backgroundColor: "#161b22",
    color: "#c9d1d9",
    padding: 12,
    borderRadius: 8,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#30363d",
  },
  btn: {
    backgroundColor: "#21262d",
    borderColor: "#58a6ff",
    borderWidth: 1,
    padding: 13,
    borderRadius: 8,
    marginTop: 6,
  },
  btnOutline: {
    borderColor: "#30363d",
    backgroundColor: "transparent",
    marginBottom: 8,
  },
  btnPressed: {
    backgroundColor: "#30363d",
  },
  btnText: {
    color: "#58a6ff",
    textAlign: "center",
    fontWeight: "700",
    fontSize: 15,
  },
  btnOutlineText: {
    color: "#8b949e",
  },
  row: {
    backgroundColor: "#161b22",
    padding: 14,
    borderRadius: 8,
    marginBottom: 10,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#30363d",
  },
  rowInfo: {
    flex: 1,
    marginRight: 10,
  },
  rowTitle: {
    color: "#c9d1d9",
    fontWeight: "800",
    fontSize: 15,
  },
  rowSub: {
    color: "#8b949e",
    marginTop: 2,
    fontSize: 13,
  },
  rowDate: {
    color: "#6e7681",
    marginTop: 2,
    fontSize: 11,
  },
  delBtn: {
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 6,
    backgroundColor: "rgba(255, 123, 114, 0.1)",
    borderWidth: 1,
    borderColor: "rgba(255, 123, 114, 0.3)",
  },
  delText: {
    color: "#ff7b72",
    fontWeight: "700",
    fontSize: 12,
  },
  emptyText: {
    color: "#8b949e",
    textAlign: "center",
    marginTop: 20,
    fontStyle: "italic",
  },
});
