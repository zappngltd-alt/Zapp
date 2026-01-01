import React from "react";
import { View, Text, StyleSheet, Pressable, ScrollView } from "react-native";
import { MaterialIcons as Icon } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
import { useTheme } from "../contexts/ThemeContext";
import * as Haptics from "expo-haptics";

interface QuickActionsProps {
  selectedSim: "sim1" | "sim2";
  onDial: (
    code: string,
    serviceName?: string,
    provider?: string,
    category?: string,
    logo?: string
  ) => void;
}

export default function QuickActions({
  selectedSim,
  onDial,
}: QuickActionsProps) {
  const { t } = useTranslation();
  const { colors, theme } = useTheme();

  const quickActions = [
    {
      id: "balance",
      name: t('quickActions.checkBalance'),
      code: "*310#",
      icon: "account-balance-wallet" as keyof typeof Icon.glyphMap,
      color: "#10b981",
    },
    {
      id: "airtime",
      name: t('quickActions.buyAirtime'),
      code: "*311*PIN#",
      icon: "phone-android" as keyof typeof Icon.glyphMap,
      color: "#3b82f6",
    },
    {
      id: "data",
      name: t('quickActions.buyData'),
      code: "*312#",
      icon: "wifi" as keyof typeof Icon.glyphMap,
      color: "#8b5cf6",
    },
    {
      id: "transfer",
      name: t('quickActions.transfer'),
      code: "*321#",
      icon: "swap-horiz" as keyof typeof Icon.glyphMap,
      color: "#f59e0b",
    },
  ];

  return (
    <View style={styles.container}>
      <Text style={[styles.title, { color: colors.text }]}>{t('quickActions.title')}</Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.actionsContainer}
      >
        {quickActions.map((action) => (
          <Pressable
            key={action.id}
            style={[styles.actionButton, { backgroundColor: action.color }]}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
              onDial(action.code, action.name, "Quick Action", "utility");
            }}
          >
            <Icon name={action.icon} size={24} color="white" />
            <Text style={styles.actionText}>{action.name}</Text>
            <Text style={styles.actionCode}>{action.code}</Text>
          </Pressable>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 24,
  },
  title: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1f2937",
    marginBottom: 16,
    paddingHorizontal: 20,
  },
  actionsContainer: {
    paddingHorizontal: 12, // Add padding to start/end of list
    paddingBottom: 4,
  },
  actionButton: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    paddingHorizontal: 12,
    borderRadius: 12,
    marginHorizontal: 8, // Spacing between items
    minWidth: 100,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  actionText: {
    color: "white",
    fontSize: 12,
    fontWeight: "500",
    textAlign: "center",
    marginTop: 8,
    marginBottom: 4,
  },
  actionCode: {
    color: "rgba(255, 255, 255, 0.8)",
    fontSize: 10,
    fontWeight: "400",
  },
});
