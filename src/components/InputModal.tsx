import React, { useState, useEffect } from "react";
import {
  Modal,
  View,
  Text,
  TextInput,
  StyleSheet,
  Pressable,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
} from "react-native";
import { MaterialIcons as Icon } from "@expo/vector-icons";
import * as Contacts from "expo-contacts";
import { useTranslation } from "react-i18next";
import { useTheme } from "../contexts/ThemeContext";

interface InputField {
  name: string;
  label: string;
  placeholder: string;
  type?: "number" | "text";
  maxLength?: number;
}

interface InputModalProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (values: Record<string, string>) => void;
  serviceName: string;
  fields: InputField[];
}

export default function InputModal({
  visible,
  onClose,
  onSubmit,
  serviceName,
  fields,
}: InputModalProps) {
  const [values, setValues] = useState<Record<string, string>>({});
  const { t } = useTranslation();
  const { colors, theme } = useTheme();

  // Reset values when modal opens
  useEffect(() => {
    if (visible) {
      setValues({});
    }
  }, [visible]);

  const handleChange = (name: string, text: string) => {
    setValues((prev) => ({ ...prev, [name]: text }));
  };

  const handlePickContact = async (fieldName: string) => {
    try {
      const { status } = await Contacts.requestPermissionsAsync();
      if (status === "granted") {
        const { data } = await Contacts.getContactsAsync({
          fields: [Contacts.Fields.PhoneNumbers],
        });

        if (data.length > 0) {
          setShowContactList(true);
          setContactField(fieldName);
          loadContacts();
        } else {
          Alert.alert(t('inputModal.noContacts'));
        }
      } else {
        Alert.alert(t('inputModal.permissionDenied'));
      }
    } catch (error) {
      console.error("Error picking contact:", error);
      Alert.alert("Error", "Failed to pick contact.");
    }
  };

  // Contact Picker State
  const [showContactList, setShowContactList] = useState(false);
  const [contacts, setContacts] = useState<Contacts.Contact[]>([]);
  const [contactSearchQuery, setContactSearchQuery] = useState("");
  const [contactField, setContactField] = useState<string | null>(null);

  const loadContacts = async () => {
    const { data } = await Contacts.getContactsAsync({
      fields: [Contacts.Fields.PhoneNumbers, Contacts.Fields.Name],
      sort: Contacts.SortTypes.FirstName,
    });
    setContacts(data.filter(c => c.phoneNumbers && c.phoneNumbers.length > 0));
  };

  const selectContact = (contact: Contacts.Contact) => {
    if (contact.phoneNumbers && contact.phoneNumbers.length > 0 && contactField) {
      // Clean the number: remove spaces, dashes, etc.
      let number = contact.phoneNumbers[0].number || "";
      number = number.replace(/\D/g, ""); // Remove non-digits
      
      // Handle country code (e.g., 234 -> 0)
      if (number.startsWith("234")) {
        number = "0" + number.substring(3);
      }
      
      handleChange(contactField, number);
      setShowContactList(false);
      setContactField(null);
      setContactSearchQuery("");
    }
  };

  const handleSubmit = () => {
    // Basic validation: check if all fields have values
    const allFilled = fields.every((field) => values[field.name]?.trim());
    if (allFilled) {
      onSubmit(values);
      onClose();
    }
  };

  const isPhoneField = (name: string) => {
    const lower = name.toLowerCase();
    return lower.includes("phone") || lower.includes("recipient") || lower.includes("contact") || lower.includes("account");
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
        style={styles.container}
      >
        <Pressable style={styles.backdrop} onPress={onClose} />
        <View style={[styles.content, { backgroundColor: colors.surface }]}>
          <View style={styles.header}>
            <Text style={[styles.title, { color: colors.text }]}>{serviceName}</Text>
            <Pressable onPress={onClose} style={[styles.closeButton, { backgroundColor: theme === 'dark' ? colors.border : '#f3f4f6' }]}>
              <Icon name="close" size={24} color={colors.textSecondary} />
            </Pressable>
          </View>

          <ScrollView style={styles.form}>
            <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
              {t('inputModal.subtitle')}
            </Text>

            {fields.map((field) => (
              <View key={field.name} style={styles.fieldContainer}>
                <Text style={[styles.label, { color: colors.text }]}>{field.label}</Text>
                <View style={styles.inputWrapper}>
                  <TextInput
                    style={[
                      styles.input, 
                      { 
                        backgroundColor: theme === 'dark' ? colors.background : '#f9fafb',
                        borderColor: theme === 'dark' ? colors.border : '#e5e7eb',
                        color: colors.text
                      },
                      isPhoneField(field.name) && styles.inputWithIcon
                    ]}
                    placeholder={field.placeholder}
                    placeholderTextColor={colors.textSecondary}
                    keyboardType={
                      field.type === "number" ? "numeric" : "default"
                    }
                    maxLength={field.maxLength}
                    value={values[field.name] || ""}
                    onChangeText={(text) => handleChange(field.name, text)}
                  />
                  {isPhoneField(field.name) && (
                    <Pressable 
                      style={styles.contactIcon} 
                      onPress={() => handlePickContact(field.name)}
                    >
                      <Icon name="contacts" size={24} color="#10b981" />
                    </Pressable>
                  )}
                </View>
              </View>
            ))}
          </ScrollView>

          <View style={styles.footer}>
            <Pressable style={[styles.cancelButton, { backgroundColor: theme === 'dark' ? colors.border : '#f3f4f6' }]} onPress={onClose}>
              <Text style={[styles.cancelButtonText, { color: colors.textSecondary }]}>{t('inputModal.cancel')}</Text>
            </Pressable>
            <Pressable
              style={[
                styles.submitButton,
                !fields.every((f) => values[f.name]?.trim()) &&
                  styles.submitButtonDisabled,
              ]}
              onPress={handleSubmit}
              disabled={!fields.every((f) => values[f.name]?.trim())}
            >
              <Text style={styles.submitButtonText}>{t('inputModal.dial')}</Text>
              <Icon name="call" size={20} color="white" />
            </Pressable>
          </View>
        </View>
      </KeyboardAvoidingView>

      {/* Contact Picker Modal */}
      <Modal
        visible={showContactList}
        animationType="slide"
        onRequestClose={() => setShowContactList(false)}
      >
        <View style={[styles.contactListContainer, { backgroundColor: colors.surface }]}>
          <View style={[styles.contactHeader, { borderBottomColor: theme === 'dark' ? colors.border : '#f3f4f6' }]}>
            <Text style={[styles.contactTitle, { color: colors.text }]}>{t('inputModal.selectContact')}</Text>
            <Pressable onPress={() => { setShowContactList(false); setContactSearchQuery(""); }} style={[styles.closeButton, { backgroundColor: theme === 'dark' ? colors.border : '#f3f4f6' }]}>
              <Icon name="close" size={24} color={colors.textSecondary} />
            </Pressable>
          </View>
          <View style={[styles.contactSearchContainer, { backgroundColor: theme === 'dark' ? colors.background : '#f9fafb', borderColor: theme === 'dark' ? colors.border : '#e5e7eb' }]}>
            <Icon name="search" size={20} color={colors.textSecondary} style={styles.searchIcon} />
            <TextInput
              style={[styles.contactSearchInput, { color: colors.text }]}
              placeholder={t('inputModal.searchContacts')}
              placeholderTextColor={colors.textSecondary}
              value={contactSearchQuery}
              onChangeText={setContactSearchQuery}
              autoCapitalize="none"
              autoCorrect={false}
            />
            {contactSearchQuery.length > 0 && (
              <Pressable onPress={() => setContactSearchQuery("")} style={styles.clearButton}>
                <Icon name="clear" size={20} color={colors.textSecondary} />
              </Pressable>
            )}
          </View>
          <ScrollView style={styles.contactList}>
            {contacts
              .filter(contact => {
                if (!contactSearchQuery) return true;
                const query = contactSearchQuery.toLowerCase();
                const name = contact.name?.toLowerCase() || "";
                const phone = contact.phoneNumbers?.[0]?.number?.replace(/\D/g, "") || "";
                return name.includes(query) || phone.includes(query);
              })
              .map((contact, index) => (
              <Pressable 
                key={contact.id || index} 
                style={[styles.contactItem, { borderBottomColor: theme === 'dark' ? colors.border : '#f9fafb' }]}
                onPress={() => selectContact(contact)}
              >
                <View style={[styles.contactAvatar, { backgroundColor: theme === 'dark' ? colors.border : '#e5e7eb' }]}>
                  <Text style={[styles.contactInitials, { color: colors.textSecondary }]}>
                    {contact.name ? contact.name.charAt(0).toUpperCase() : "?"}
                  </Text>
                </View>
                <View>
                  <Text style={[styles.contactName, { color: colors.text }]}>{contact.name}</Text>
                  <Text style={[styles.contactPhone, { color: colors.textSecondary }]}>
                    {contact.phoneNumbers && contact.phoneNumbers[0]?.number}
                  </Text>
                </View>
              </Pressable>
            ))}
          </ScrollView>
        </View>
      </Modal>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "flex-end",
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0, 0, 0, 0.6)", // Darker backdrop for better focus
  },
  content: {
    backgroundColor: "white",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    maxHeight: "85%",
    elevation: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 24,
  },
  title: {
    fontSize: 22,
    fontWeight: "700",
    color: "#111827",
    letterSpacing: -0.5,
  },
  closeButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: "#f3f4f6",
  },
  subtitle: {
    fontSize: 15,
    color: "#4b5563",
    marginBottom: 20,
    lineHeight: 22,
  },
  form: {
    marginBottom: 24,
  },
  fieldContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: "#374151",
    marginBottom: 8,
  },
  inputWrapper: {
    position: "relative",
    justifyContent: "center",
  },
  input: {
    borderWidth: 1.5, // Slightly thicker border
    borderColor: "#e5e7eb",
    borderRadius: 12,
    padding: 14,
    fontSize: 16,
    color: "#1f2937",
    backgroundColor: "#f9fafb",
  },
  inputWithIcon: {
    paddingRight: 50,
  },
  contactIcon: {
    position: "absolute",
    right: 12,
    padding: 4,
  },
  footer: {
    flexDirection: "row",
    gap: 16,
    paddingBottom: Platform.OS === "ios" ? 20 : 0,
  },
  cancelButton: {
    flex: 1,
    padding: 16,
    borderRadius: 14,
    backgroundColor: "#f3f4f6",
    alignItems: "center",
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#4b5563",
  },
  submitButton: {
    flex: 2,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
    padding: 16,
    borderRadius: 14,
    backgroundColor: "#10b981",
    shadowColor: "#10b981",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  submitButtonDisabled: {
    backgroundColor: "#a7f3d0",
    shadowOpacity: 0,
    elevation: 0,
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: "700",
    color: "white",
  },
  // Contact List Styles
  contactListContainer: {
    flex: 1,
    backgroundColor: "white",
    marginTop: 50,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
  },
  contactHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#f3f4f6",
  },
  contactTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#111827",
  },
  contactList: {
    flex: 1,
  },
  contactSearchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f9fafb",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginHorizontal: 20,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  searchIcon: {
    marginRight: 12,
  },
  contactSearchInput: {
    flex: 1,
    fontSize: 16,
    color: "#1f2937",
  },
  clearButton: {
    padding: 4,
  },
  contactItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#f9fafb",
  },
  contactAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#e5e7eb",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  contactInitials: {
    fontSize: 16,
    fontWeight: "600",
    color: "#6b7280",
  },
  contactName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1f2937",
  },
  contactPhone: {
    fontSize: 14,
    color: "#6b7280",
  },
});
