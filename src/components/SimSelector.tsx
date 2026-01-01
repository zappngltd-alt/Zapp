import React from "react";
import { View, Text, StyleSheet, Pressable } from "react-native";
import { MaterialIcons as Icon } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
import { useTheme } from "../contexts/ThemeContext";

interface SimSelectorProps {
  selectedSim: "sim1" | "sim2";
  onSelectSim: (sim: "sim1" | "sim2") => void;
  compact?: boolean;
}

export default function SimSelector({
  selectedSim,
  onSelectSim,
  compact = false,
}: SimSelectorProps) {
  const { t } = useTranslation();
  const { colors, theme } = useTheme();

  if (compact) {
    return (
      <View style={[styles.compactContainer, { backgroundColor: theme === 'dark' ? colors.border : '#f3f4f6' }]}>
        <Pressable
          style={[
            styles.compactButton,
            selectedSim === "sim1" && { backgroundColor: colors.background, shadowColor: theme === 'dark' ? 'transparent' : '#000' },
          ]}
          onPress={() => onSelectSim("sim1")}
        >
          <Text
            style={[
              styles.compactText,
              { color: selectedSim === "sim1" ? "#10b981" : colors.textSecondary },
            ]}
          >
            {t('simSelector.sim1')}
          </Text>
        </Pressable>
        <Pressable
          style={[
            styles.compactButton,
            selectedSim === "sim2" && { backgroundColor: colors.background, shadowColor: theme === 'dark' ? 'transparent' : '#000' },
          ]}
          onPress={() => onSelectSim("sim2")}
        >
          <Text
            style={[
              styles.compactText,
              { color: selectedSim === "sim2" ? "#10b981" : colors.textSecondary },
            ]}
          >
            {t('simSelector.sim2')}
          </Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={[styles.label, { color: colors.text }]}>{t('simSelector.label')}</Text>
      <View style={styles.simContainer}>
        <Pressable
          style={[
            styles.simButton,
            { backgroundColor: colors.surface, borderColor: theme === 'dark' ? colors.border : '#d1d5db' },
            selectedSim === "sim1" && styles.simButtonActive,
          ]}
          onPress={() => onSelectSim("sim1")}
        >
          <Icon
            name="sim-card"
            size={20}
            color={selectedSim === "sim1" ? "white" : colors.textSecondary}
          />
          <Text
            style={[
              styles.simText,
              { color: selectedSim === "sim1" ? "white" : colors.textSecondary },
            ]}
          >
            {t('simSelector.sim1')}
          </Text>
        </Pressable>

        <Pressable
          style={[
            styles.simButton,
            { backgroundColor: colors.surface, borderColor: theme === 'dark' ? colors.border : '#d1d5db' },
            selectedSim === "sim2" && styles.simButtonActive,
          ]}
          onPress={() => onSelectSim("sim2")}
        >
          <Icon
            name="sim-card"
            size={20}
            color={selectedSim === "sim2" ? "white" : colors.textSecondary}
          />
          <Text
            style={[
              styles.simText,
              { color: selectedSim === "sim2" ? "white" : colors.textSecondary },
            ]}
          >
            {t('simSelector.sim2')}
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1f2937",
    marginBottom: 12,
  },
  simContainer: {
    flexDirection: "row",
    gap: 12,
  },
  simButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#d1d5db",
    backgroundColor: "white",
  },
  simButtonActive: {
    backgroundColor: "#10b981",
    borderColor: "#10b981",
  },
  simText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#6b7280",
    marginLeft: 8,
  },
  // Compact Styles
  compactContainer: {
    flexDirection: "row",
    backgroundColor: "#f3f4f6",
    borderRadius: 20,
    padding: 2,
    height: 36,
  },
  compactButton: {
    paddingHorizontal: 12,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 18,
  },
  compactText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#6b7280",
  },
});
