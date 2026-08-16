/**
 * ============================================================================
 * COMPONENTE: GRUPO DE OPCIONES RADIALES (RadioGroup.tsx)
 * ============================================================================
 * Implementación nativa usando Pressable y StyleSheet con diseño oscuro.
 */

import React from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";

export type RadioOption<T extends string> = {
  label: string;
  value: T;
};

type RadioGroupProps<T extends string> = {
  label?: string;
  value: T;
  options: RadioOption<T>[];
  onChange: (value: T) => void;
};

export default function RadioGroup<T extends string>({
  label,
  value,
  options,
  onChange,
}: RadioGroupProps<T>) {
  return (
    <View style={styles.container}>
      {!!label && <Text style={styles.groupLabel}>{label}</Text>}

      <View style={styles.optionsWrapper}>
        {options.map((opt) => {
          const isSelected = opt.value === value;
          return (
            <Pressable
              key={opt.value}
              onPress={() => onChange(opt.value)}
              style={({ pressed }) => [
                styles.optionRow,
                isSelected && styles.optionRowSelected,
                pressed && styles.optionRowPressed,
              ]}
            >
              <View style={[styles.outerCircle, isSelected && styles.outerCircleSelected]}>
                {isSelected && <View style={styles.innerDot} />}
              </View>
              <Text style={[styles.optionText, isSelected && styles.optionTextSelected]}>
                {opt.label}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 8,
  },
  groupLabel: {
    color: "#8b949e",
    fontSize: 13,
    fontWeight: "700",
    marginBottom: 6,
  },
  optionsWrapper: {
    gap: 8,
  },
  optionRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#161b22",
    borderWidth: 1,
    borderColor: "#30363d",
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  optionRowSelected: {
    borderColor: "#58a6ff",
    backgroundColor: "#1f242c",
  },
  optionRowPressed: {
    opacity: 0.8,
  },
  outerCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: "#8b949e",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
  },
  outerCircleSelected: {
    borderColor: "#58a6ff",
  },
  innerDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#58a6ff",
  },
  optionText: {
    color: "#8b949e",
    fontSize: 14,
    fontWeight: "500",
  },
  optionTextSelected: {
    color: "#58a6ff",
    fontWeight: "700",
  },
});
