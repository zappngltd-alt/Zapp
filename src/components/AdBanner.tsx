import React, { useState } from "react";
import { View, Text, StyleSheet, Pressable } from "react-native";
import { MaterialIcons as Icon } from "@expo/vector-icons";

interface AdBannerProps {
  position?: "top" | "bottom";
}

export default function AdBanner({ position = "bottom" }: AdBannerProps) {
  const [isVisible, setIsVisible] = useState(true);

  if (!isVisible) return null;

  return (
    <View style={[styles.container, position === "top" ? styles.top : styles.bottom]}>
      <View style={styles.content}>
        <View style={styles.textContainer}>
          <Text style={styles.label}>Advertisement</Text>
          <Text style={styles.adText}>🎯 Your ad could be here - Powered by AdMob</Text>
        </View>
        <Pressable onPress={() => setIsVisible(false)} style={styles.closeButton}>
          <Icon name="close" size={20} color="#6b7280" />
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: "#f9fafb",
    borderTopWidth: 1,
    borderTopColor: "#e5e5e5",
  },
  top: {
    borderBottomWidth: 1,
    borderBottomColor: "#e5e5e5",
    borderTopWidth: 0,
  },
  bottom: {
    borderTopWidth: 1,
    borderTopColor: "#e5e5e5",
  },
  content: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#eff6ff",
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: "#dbeafe",
  },
  textContainer: {
    flex: 1,
  },
  label: {
    fontSize: 10,
    color: "#6b7280",
    marginBottom: 4,
    textTransform: "uppercase",
  },
  adText: {
    fontSize: 14,
    color: "#1f2937",
    fontWeight: "500",
  },
  closeButton: {
    padding: 4,
  },
});
