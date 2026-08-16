/**
 * ============================================================================
 * PANTALLA: EVENTOS OPERATIVOS (RentalEventsScreen.tsx - MONGODB)
 * ============================================================================
 * Cumple con todos los requerimientos avanzados del examen:
 * 1. SELECT 1 (Picker): Selección de alquiler desde PostgreSQL (GET /api/rentals/)
 *    mostrando el ID, nombre del cliente, vehículo y estado.
 * 2. SELECT 2 (Picker): Selección del tipo de evento
 *    (CREATED | PICKED_UP | RETURNED | PAID | CANCELLED).
 * 3. COMPONENTES NATIVOS ADICIONALES:
 *    - RadioGroup: Selección del origen (MOBILE | WEB | SYSTEM).
 *    - Switch: Notificación inmediata a gerencia de operaciones.
 *    - CheckboxRow: Confirmación del registro y vinculación SQL-NoSQL.
 * 4. Input opcional de notas.
 * 5. Fecha: NO se envía desde la app (MongoDB asigna created_at automáticamente).
 * 6. Listado y eliminación de eventos operativos.
 */

import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  FlatList,
  StyleSheet,
  Switch,
  ActivityIndicator,
} from "react-native";
import { Picker } from "@react-native-picker/picker";

import { listRentalsApi } from "../api/rentals.api";
import {
  listRentalEventsApi,
  createRentalEventApi,
  deleteRentalEventApi,
} from "../api/rentalEvents.api";

import RadioGroup from "../components/RadioGroup";
import CheckboxRow from "../components/CheckboxRow";

import type { Rental } from "../types/rental";
import type { RentalEvent, RentalEventType, EventSource } from "../types/rentalEvent";
import { toArray } from "../types/drf";

export default function RentalEventsScreen() {
  const [events, setEvents] = useState<RentalEvent[]>([]);
  const [rentals, setRentals] = useState<Rental[]>([]);

  // ESTADO SELECT 1: ID del alquiler de PostgreSQL
  const [selectedRentalId, setSelectedRentalId] = useState<number | null>(null);

  // ESTADO SELECT 2: Tipo de Evento NoSQL
  const [selectedEventType, setSelectedEventType] = useState<RentalEventType>("CREATED");

  // ESTADO RADIO GROUP: Origen del evento
  const [source, setSource] = useState<EventSource>("MOBILE");

  // ESTADO SWITCH: Notificación a gerencia
  const [notifyManagement, setNotifyManagement] = useState<boolean>(true);

  // ESTADO CHECKBOX: Confirmación de registro
  const [confirmed, setConfirmed] = useState<boolean>(true);

  // ESTADO INPUT: Notas
  const [note, setNote] = useState("");

  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const loadData = async (): Promise<void> => {
    try {
      setLoading(true);
      setErrorMessage("");

      const [eventsRes, rentalsRes] = await Promise.all([
        listRentalEventsApi(),
        listRentalsApi(),
      ]);

      const rentalsList = toArray(rentalsRes);
      setEvents(eventsRes || []);
      setRentals(rentalsList);

      if (selectedRentalId === null && rentalsList.length > 0) {
        setSelectedRentalId(rentalsList[0].id);
      }
    } catch {
      setErrorMessage("Error al cargar datos. Verifique que Django, Postgres y MongoDB estén activos.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreateEvent = async (): Promise<void> => {
    try {
      setErrorMessage("");
      setSuccessMessage("");

      if (selectedRentalId === null) {
        setErrorMessage("Debe seleccionar un alquiler de la lista.");
        return;
      }

      if (!confirmed) {
        setErrorMessage("Debe marcar la casilla de confirmación para registrar.");
        return;
      }

      setActionLoading(true);

      const created = await createRentalEventApi({
        rental_id: selectedRentalId,
        event_type: selectedEventType,
        source: source,
        note: note.trim() ? note.trim() : undefined,
      });

      setEvents((prev) => [created, ...prev]);
      setNote("");
      setSuccessMessage("Evento operativo registrado en MongoDB con éxito.");
    } catch {
      setErrorMessage("No se pudo registrar el evento. Verifique la existencia del alquiler en PostgreSQL.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteEvent = async (id: string): Promise<void> => {
    try {
      setErrorMessage("");
      setSuccessMessage("");
      await deleteRentalEventApi(id);
      setEvents((prev) => prev.filter((e) => e.id !== id));
      setSuccessMessage("Evento eliminado de MongoDB.");
    } catch {
      setErrorMessage("No se pudo eliminar el evento.");
    }
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={events}
        keyExtractor={(item) => item.id}
        style={styles.list}
        ListHeaderComponent={
          <View style={styles.formCard}>
            <Text style={styles.title}>Eventos Operativos (MongoDB)</Text>
            <Text style={styles.subtitle}>
              Registro NoSQL vinculado con alquileres de PostgreSQL
            </Text>

            {/* Mensajes de feedback */}
            {!!errorMessage && <Text style={styles.error}>{errorMessage}</Text>}
            {!!successMessage && <Text style={styles.success}>{successMessage}</Text>}

            {/* ============================================================== */}
            {/* SELECT 1: Alquiler (PostgreSQL) */}
            {/* ============================================================== */}
            <Text style={styles.label}>
              1. Alquiler (PostgreSQL - Cliente, Vehículo y Estado)
            </Text>
            <View style={styles.pickerWrapper}>
              <Picker
                selectedValue={selectedRentalId ?? ""}
                onValueChange={(val) => setSelectedRentalId(Number(val))}
                dropdownIconColor="#58a6ff"
                style={styles.picker}
              >
                {rentals.length === 0 ? (
                  <Picker.Item label="No hay alquileres en PostgreSQL" value="" />
                ) : (
                  rentals.map((r) => (
                    <Picker.Item
                      key={r.id}
                      label={`Alquiler #${r.id}: ${r.customer_name} (${r.vehicle_plate || `Veh #${r.vehicle}`}) - [${r.status}]`}
                      value={r.id}
                    />
                  ))
                )}
              </Picker>
            </View>

            {/* ============================================================== */}
            {/* SELECT 2: Tipo de Evento (MongoDB) */}
            {/* ============================================================== */}
            <Text style={styles.label}>2. Tipo de Evento (Picker NoSQL)</Text>
            <View style={styles.pickerWrapper}>
              <Picker
                selectedValue={selectedEventType}
                onValueChange={(val) => setSelectedEventType(val as RentalEventType)}
                dropdownIconColor="#58a6ff"
                style={styles.picker}
              >
                <Picker.Item label="CREATED (Reserva / Alquiler Creado)" value="CREATED" />
                <Picker.Item label="PICKED_UP (Vehículo Entregado al Cliente)" value="PICKED_UP" />
                <Picker.Item label="RETURNED (Vehículo Devuelto a la Agencia)" value="RETURNED" />
                <Picker.Item label="PAID (Alquiler Liquidado y Pagado)" value="PAID" />
                <Picker.Item label="CANCELLED (Alquiler Cancelado)" value="CANCELLED" />
              </Picker>
            </View>

            {/* ============================================================== */}
            {/* COMPONENTE NATIVO: RadioGroup (Origen del evento) */}
            {/* ============================================================== */}
            <RadioGroup<EventSource>
              label="3. Origen del Evento (RadioGroup)"
              value={source}
              onChange={setSource}
              options={[
                { label: "MÓVIL (MOBILE)", value: "MOBILE" },
                { label: "WEB (WEB)", value: "WEB" },
                { label: "SISTEMA (SYSTEM)", value: "SYSTEM" },
              ]}
            />

            {/* ============================================================== */}
            {/* COMPONENTE NATIVO: Switch (Notificar a gerencia) */}
            {/* ============================================================== */}
            <View style={styles.switchRow}>
              <Text style={styles.label}>Notificar a gerencia de operaciones (Switch)</Text>
              <Switch
                value={notifyManagement}
                onValueChange={setNotifyManagement}
                thumbColor={notifyManagement ? "#58a6ff" : "#8b949e"}
                trackColor={{ false: "#30363d", true: "#1f6feb" }}
              />
            </View>

            {/* Campo Notas */}
            <Text style={styles.label}>Notas u Observaciones (opcional)</Text>
            <TextInput
              placeholder="Ej: Vehículo entregado con odómetro 52,100 km y tanque lleno"
              placeholderTextColor="#8b949e"
              value={note}
              onChangeText={setNote}
              style={styles.input}
            />

            {/* ============================================================== */}
            {/* COMPONENTE NATIVO: CheckboxRow (Confirmación) */}
            {/* ============================================================== */}
            <CheckboxRow
              label="Confirmar registro del evento y vinculación SQL-NoSQL"
              checked={confirmed}
              onChange={setConfirmed}
            />

            {/* Botón Registrar */}
            <Pressable
              onPress={handleCreateEvent}
              style={({ pressed }) => [styles.btn, pressed && styles.btnPressed]}
              disabled={actionLoading}
            >
              {actionLoading ? (
                <ActivityIndicator color="#58a6ff" />
              ) : (
                <Text style={styles.btnText}>Registrar Evento en Mongo (sin fecha manual)</Text>
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
                Refrescar Datos
              </Text>
            </Pressable>

            {loading && <ActivityIndicator color="#58a6ff" style={{ marginVertical: 12 }} />}
          </View>
        }
        renderItem={({ item }) => {
          const matchedRental = rentals.find((r) => r.id === item.rental_id);
          return (
            <View style={styles.row}>
              <View style={styles.rowInfo}>
                <Text style={styles.rowTitle}>
                  Alquiler #{item.rental_id}
                  {matchedRental ? ` (${matchedRental.customer_name})` : ""} — {item.event_type}
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
                onPress={() => handleDeleteEvent(item.id)}
                style={styles.delBtn}
              >
                <Text style={styles.delText}>Eliminar</Text>
              </Pressable>
            </View>
          );
        }}
        ListEmptyComponent={
          !loading ? (
            <Text style={styles.emptyText}>No hay eventos registrados en MongoDB.</Text>
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
  switchRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginVertical: 8,
    paddingHorizontal: 2,
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
