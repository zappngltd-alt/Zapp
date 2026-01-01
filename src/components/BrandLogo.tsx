import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { LinearGradient } from "expo-linear-gradient";

interface BrandLogoProps {
  name: string;
  abbr: string;
  colors: string[];
  size?: "sm" | "md" | "lg" | "xl";
}

export default function BrandLogo({
  name,
  abbr,
  colors,
  size = "md",
}: BrandLogoProps) {
  const sizeMap = {
    sm: { container: 32, text: 12 },
    md: { container: 40, text: 14 },
    lg: { container: 48, text: 16 },
    xl: { container: 64, text: 20 },
  };

  const { container, text } = sizeMap[size];

  return (
    <View
      style={[
        styles.container,
        { width: container, height: container, borderRadius: container * 0.25 },
      ]}
    >
      <LinearGradient
        colors={colors}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[
          StyleSheet.absoluteFill,
          { borderRadius: container * 0.25 },
        ]}
      />
      
      {/* Subtle shine effect */}
      <LinearGradient
        colors={["rgba(255,255,255,0.2)", "transparent"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[
          StyleSheet.absoluteFill,
          { borderRadius: container * 0.25, opacity: 0.5 },
        ]}
      />

      <View style={styles.textContainer}>
        <Text style={[styles.text, { fontSize: text }]}>{abbr}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "relative",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  textContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 10,
  },
  text: {
    fontWeight: "700",
    color: "#ffffff",
  },
});
