import React, { useState, useEffect } from "react";
import {
  Modal,
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { MaterialIcons as Icon } from "@expo/vector-icons";
import { SearchableService } from "../data/services-data";
import { useTranslation } from "react-i18next";
import { useTheme } from "../contexts/ThemeContext";

interface AddServiceModalProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (service: Omit<SearchableService, 'category' | 'logo'>) => void;
  initialValues?: SearchableService | null;
}

export default function AddServiceModal({
  visible,
  onClose,
  onSubmit,
  initialValues,
}: AddServiceModalProps) {
  const [provider, setProvider] = useState("");
  const [serviceName, setServiceName] = useState("");
  const [code, setCode] = useState("");
  const { t } = useTranslation();
  const { colors, theme } = useTheme();

  useEffect(() => {
    if (initialValues) {
      setProvider(initialValues.provider);
      setServiceName(initialValues.serviceName);
      setCode(initialValues.code);
    } else {
      setProvider("");
      setServiceName("");
      setCode("");
    }
  }, [initialValues, visible]);

  const handleSubmit = () => {
    if (!provider || !serviceName || !code) return;
    onSubmit({
      provider,
      serviceName,
      code,
      id: initialValues?.id
    });
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.overlay}
      >
        <Pressable style={styles.backdrop} onPress={onClose} />
        <View style={[styles.container, { backgroundColor: colors.surface }]}>
          <View style={styles.header}>
            <Text style={[styles.title, { color: colors.text }]}>
              {initialValues ? t('addService.editTitle') : t('addService.addTitle')}
            </Text>
            <Pressable onPress={onClose}>
              <Icon name="close" size={24} color={colors.textSecondary} />
            </Pressable>
          </View>

          <View style={styles.form}>
            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: colors.text }]}>{t('addService.providerLabel')}</Text>
              <TextInput
                style={[
                  styles.input,
                  { 
                    backgroundColor: theme === 'dark' ? colors.background : 'transparent',
                    borderColor: theme === 'dark' ? colors.border : '#d1d5db',
                    color: colors.text,
                  }
                ]}
                placeholder={t('addService.providerPlaceholder')}
                placeholderTextColor={colors.textSecondary}
                value={provider}
                onChangeText={setProvider}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: colors.text }]}>{t('addService.serviceLabel')}</Text>
              <TextInput
                style={[
                  styles.input,
                  { 
                    backgroundColor: theme === 'dark' ? colors.background : 'transparent',
                    borderColor: theme === 'dark' ? colors.border : '#d1d5db',
                    color: colors.text,
                  }
                ]}
                placeholder={t('addService.servicePlaceholder')}
                placeholderTextColor={colors.textSecondary}
                value={serviceName}
                onChangeText={setServiceName}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: colors.text }]}>{t('addService.codeLabel')}</Text>
              <TextInput
                style={[
                  styles.input,
                  { 
                    backgroundColor: theme === 'dark' ? colors.background : 'transparent',
                    borderColor: theme === 'dark' ? colors.border : '#d1d5db',
                    color: colors.text,
                  }
                ]}
                placeholder={t('addService.codePlaceholder')}
                placeholderTextColor={colors.textSecondary}
                value={code}
                onChangeText={setCode}
                keyboardType="phone-pad"
              />
            </View>

            <Pressable style={styles.submitButton} onPress={handleSubmit}>
              <Text style={styles.submitButtonText}>
                {initialValues ? t('addService.updateButton') : t('addService.addButton')}
              </Text>
            </Pressable>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: "flex-end",
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  container: {
    backgroundColor: "white",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    minHeight: 400,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 24,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#1f2937",
  },
  form: {
    gap: 16,
  },
  inputGroup: {
    gap: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: "500",
    color: "#4b5563",
  },
  input: {
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: "#1f2937",
  },
  submitButton: {
    backgroundColor: "#10b981",
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 8,
  },
  submitButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
});
