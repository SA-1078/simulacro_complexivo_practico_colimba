/**
 * ============================================================================
 * COMPONENTE: CASILLA DE VERIFICACIÓN (CheckboxRow.tsx)
 * ============================================================================
 */

import React from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";

type CheckboxRowProps = {
  label: string;
  checked: boolean;
  onChange: (value: boolean) => void;
};

export default function CheckboxRow({
  label,
  checked,
  onChange,
}: CheckboxRowProps) {
  return (
    <Pressable
      onPress={() => onChange(!checked)}
      style={({ pressed }) => [
        styles.row,
        checked && styles.rowChecked,
        pressed && styles.rowPressed,
      ]}
    >
      <View style={[styles.box, checked && styles.boxChecked]}>
        {checked && <Text style={styles.checkMark}>✓</Text>}
      </View>
      <Text style={[styles.label, checked && styles.labelChecked]}>
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#161b22",
    borderWidth: 1,
    borderColor: "#30363d",
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
    marginVertical: 8,
  },
  rowChecked: {
    borderColor: "#58a6ff",
    backgroundColor: "#1f242c",
  },
  rowPressed: {
    opacity: 0.8,
  },
  box: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: "#8b949e",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
  },
  boxChecked: {
    backgroundColor: "#58a6ff",
    borderColor: "#58a6ff",
  },
  checkMark: {
    color: "#0d1117",
    fontWeight: "900",
    fontSize: 14,
  },
  label: {
    color: "#8b949e",
    fontSize: 14,
    fontWeight: "500",
    flex: 1,
  },
  labelChecked: {
    color: "#c9d1d9",
    fontWeight: "600",
  },
});
