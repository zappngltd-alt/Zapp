import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  Dimensions,
  Pressable,
} from "react-native";
import { MaterialIcons as Icon } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
import { LinearGradient } from "expo-linear-gradient";

const { width, height } = Dimensions.get("window");

interface OnboardingProps {
  onComplete: () => void;
}

export default function Onboarding({ onComplete }: OnboardingProps) {
  const { t } = useTranslation();
  const [currentSlide, setCurrentSlide] = useState(0);

  const slides = [
    {
      icon: "smartphone" as keyof typeof Icon.glyphMap,
      title: t('onboarding.slides.welcome.title'),
      description: t('onboarding.slides.welcome.description'),
      color: "#10b981",
      gradient: ["#10b981", "#059669"],
    },
    {
      icon: "bolt" as keyof typeof Icon.glyphMap,
      title: t('onboarding.slides.quick.title'),
      description: t('onboarding.slides.quick.description'),
      color: "#3b82f6",
      gradient: ["#3b82f6", "#2563eb"],
    },
    {
      icon: "search" as keyof typeof Icon.glyphMap,
      title: t('onboarding.slides.custom.title'),
      description: t('onboarding.slides.custom.description'),
      color: "#f59e0b",
      gradient: ["#f59e0b", "#d97706"],
    },
    {
      icon: "security" as keyof typeof Icon.glyphMap,
      title: t('onboarding.slides.secure.title'),
      description: t('onboarding.slides.secure.description'),
      color: "#8b5cf6",
      gradient: ["#8b5cf6", "#7c3aed"],
    },
  ];

  const handleNext = () => {
    if (currentSlide < slides.length - 1) {
      setCurrentSlide(currentSlide + 1);
    } else {
      onComplete();
    }
  };

  const slide = slides[currentSlide];

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        {/* Icon */}
        <LinearGradient
          colors={slide.gradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.iconContainer}
        >
          <Icon name={slide.icon} size={48} color="white" />
        </LinearGradient>

        {/* Content */}
        <View style={styles.textContainer}>
          <Text style={styles.title}>{slide.title}</Text>
          <Text style={styles.description}>{slide.description}</Text>
        </View>

        {/* Dots Indicator */}
        <View style={styles.dotsContainer}>
          {slides.map((_, index) => (
            <View
              key={index}
              style={[
                styles.dot,
                index === currentSlide ? styles.activeDot : styles.inactiveDot,
              ]}
            />
          ))}
        </View>

        {/* Button */}
        <View style={styles.buttonContainer}>
          <Pressable
            style={[styles.button, { backgroundColor: slide.color }]}
            onPress={handleNext}
          >
            <Text style={styles.buttonText}>
              {currentSlide < slides.length - 1 ? t('onboarding.next') : t('onboarding.getStarted')}
            </Text>
            {currentSlide < slides.length - 1 && (
              <Icon
                name="chevron-right"
                size={20}
                color="white"
                style={styles.buttonIcon}
              />
            )}
            {currentSlide === slides.length - 1 && (
              <Icon
                name="check-circle"
                size={20}
                color="white"
                style={styles.buttonIcon}
              />
            )}
          </Pressable>
        </View>

        {/* Skip */}
        {currentSlide < slides.length - 1 && (
          <Pressable style={styles.skipButton} onPress={onComplete}>
            <Text style={styles.skipText}>{t('onboarding.skip')}</Text>
          </Pressable>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f0fdf4",
  },
  content: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 24,
  },
  iconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 48,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  textContainer: {
    alignItems: "center",
    marginBottom: 48,
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    color: "#1f2937",
    textAlign: "center",
    marginBottom: 16,
  },
  description: {
    fontSize: 16,
    color: "#6b7280",
    textAlign: "center",
    lineHeight: 24,
    maxWidth: 300,
  },
  dotsContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 48,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginHorizontal: 4,
  },
  activeDot: {
    width: 24,
    backgroundColor: "#10b981",
  },
  inactiveDot: {
    backgroundColor: "#d1d5db",
  },
  buttonContainer: {
    width: "100%",
    marginBottom: 24,
  },
  button: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  buttonText: {
    color: "white",
    fontSize: 18,
    fontWeight: "600",
  },
  buttonIcon: {
    marginLeft: 8,
  },
  skipButton: {
    padding: 8,
  },
  skipText: {
    color: "#6b7280",
    fontSize: 16,
  },
});
