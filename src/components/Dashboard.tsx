import React, { useState, useEffect, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Alert,
  Dimensions,
  NativeModules,
  Platform,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { MaterialIcons as Icon } from "@expo/vector-icons";
import Toast from "react-native-toast-message";
import Communications from "react-native-communications";
import { useNavigation } from "@react-navigation/native";
import { useTranslation } from "react-i18next";
import { useTheme } from "../contexts/ThemeContext";

// Import components
import QuickActions from "./QuickActions";
import ServiceTabs from "./ServiceTabs";
import SimSelector from "./SimSelector";
import SearchBar from "./SearchBar";
import AdBanner from "./AdBanner";
import InputModal from "./InputModal";
import { useApp } from "./AppContext";
import { useUSSD } from "../hooks/useUSSD";

// Import data
import { getAllServices } from "../data/services-data";

const { width } = Dimensions.get("window");

interface DashboardProps {
  navigation?: any; // React Navigation prop
}

export default function Dashboard({ navigation }: DashboardProps) {
  const [inputModalVisible, setInputModalVisible] = useState(false);
  const [pendingCode, setPendingCode] = useState<string | null>(null);
  const [pendingServiceName, setPendingServiceName] = useState<string>("");
  const [inputFields, setInputFields] = useState<any[]>([]);

  const { t } = useTranslation();
  const { colors, theme } = useTheme();
  const insets = useSafeAreaInsets();

  const { favorites, addToHistory, preferredSim, setPreferredSim, customServices } = useApp();
  const selectedSim = preferredSim;
  const setSelectedSim = setPreferredSim;
  const simNumber = selectedSim === "sim1" ? 1 : 2;
  const { dial } = useUSSD();

  const allServices = useMemo(() => {
    return [...getAllServices(), ...customServices];
  }, [customServices]);

  // Handle USSD dialing
  const handleDial = async (
    code: string,
    serviceName?: string,
    provider?: string,
    category?: string,
    logo?: string
  ) => {
    const needsInput = code.includes("AMOUNT") || code.includes("ACCOUNT") || code.includes("PIN") || code.includes("PHONE");

    if (needsInput) {
      const fields = [];
      if (code.includes("AMOUNT")) fields.push({ name: "AMOUNT", label: "Amount", placeholder: "Enter amount", type: "number" });
      if (code.includes("ACCOUNT")) fields.push({ name: "ACCOUNT", label: "Account Number", placeholder: "Enter account number", type: "number", maxLength: 10 });
      if (code.includes("PIN")) fields.push({ name: "PIN", label: "PIN", placeholder: "Enter PIN", type: "number", maxLength: 4 });
      if (code.includes("PHONE")) fields.push({ name: "PHONE", label: "Phone Number", placeholder: "Enter phone number", type: "number", maxLength: 11 });

      setPendingCode(code);
      setPendingServiceName(serviceName || "Service");
      // Store other info in pending state or pass to modal
      // For now we'll just use the serviceName
      setInputFields(fields);
      setInputModalVisible(true);
      return;
    }

    performDial(code, serviceName, provider, category, logo);
  };

  const performDial = async (
    code: string, 
    serviceName?: string,
    provider?: string,
    category?: string,
    logo?: string
  ) => {
    try {
      // Add to history
      addToHistory({
        provider: provider || "Service",
        serviceName: serviceName || "USSD Code",
        code: code,
        category: (category as any) || "general",
        logo: logo
      });

      Toast.show({
        type: "info",
        text1: "Opening dialer...",
        text2: `${code} on SIM ${simNumber}`,
        visibilityTime: 2000,
      });
      
      await dial(code, simNumber - 1);
    } catch (error) {
      console.error("Error dialing:", error);
      Toast.show({
        type: "error",
        text1: "Dialing Failed",
        text2: "Unable to open dialer. Please try again.",
        visibilityTime: 3000,
      });
    }
  };

  const handleInputSubmit = (values: Record<string, string>) => {
    if (!pendingCode) return;

    let finalCode = pendingCode;
    Object.entries(values).forEach(([key, value]) => {
      finalCode = finalCode.replace(key, value);
    });

    performDial(finalCode, pendingServiceName);
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[
        styles.header, 
        { 
          backgroundColor: colors.surface, 
          borderBottomColor: colors.border,
          paddingTop: Math.max(insets.top, 20) + 10, // Dynamic safe area adding
        }
      ]}>
        <View style={styles.headerContent}>
          <View style={styles.logoSection}>
            <View style={styles.logoContainer}>
              <Icon name="smartphone" size={24} color="white" />
            </View>
            <View style={styles.headerText}>
              <Text style={[styles.appName, { color: colors.text }]}>{t('dashboard.greeting', 'Zapp')}</Text>
              <Text style={[styles.tagline, { color: colors.textSecondary }]}>{t('dashboard.tagline', 'Ultra-Fast Utilities & Payments')}</Text>
            </View>
          </View>
        </View>

        <View style={styles.headerActions}>
          {/* Compact Balance Display */}
          <View style={[styles.compactBalance, { backgroundColor: theme === 'dark' ? colors.border : '#f3f4f6' }]}>
            <Text style={styles.compactBalanceLabel}>{t('dashboard.balance')}</Text>
            <Text style={styles.compactBalanceAmount}>₦0.00</Text>
          </View>
          
          <SimSelector selectedSim={selectedSim} onSelectSim={setSelectedSim} compact={true} />
          <Pressable
            style={[styles.settingsButton, { backgroundColor: theme === 'dark' ? colors.border : '#f3f4f6' }]}
            onPress={() => navigation?.navigate("Settings")}
          >
            <Icon name="settings" size={20} color={colors.textSecondary} />
          </Pressable>
        </View>
      </View>

      <View style={styles.content}>
        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <SearchBar
            onDial={(code) => handleDial(code)}
            selectedSim={simNumber}
            servicesData={allServices}
          />
        </View>

        <ServiceTabs 
          selectedSim={selectedSim} 
          onDial={handleDial}
          headerComponent={
            <View>
              {/* Quick Actions */}
              <View style={styles.quickActionsContainer}>
                <QuickActions selectedSim={selectedSim} onDial={handleDial} />
              </View>
            </View>
          }
          footerComponent={
            <AdBanner position="bottom" />
          }
        />
      </View>

      <InputModal
        visible={inputModalVisible}
        onClose={() => setInputModalVisible(false)}
        onSubmit={handleInputSubmit}
        serviceName={pendingServiceName}
        fields={inputFields}
      />
      
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f9fafb",
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  headerContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  logoSection: {
    flexDirection: "row",
    alignItems: "center",
  },
  logoContainer: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: "#10b981",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  headerText: {
    justifyContent: "center",
    flex: 1,
  },
  appName: {
    fontSize: 20,
    fontWeight: "800",
    letterSpacing: -0.5,
  },
  tagline: {
    fontSize: 13,
    fontWeight: "500",
  },
  headerActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 12,
  },
  compactBalance: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 4,
  },
  compactBalanceLabel: {
    fontSize: 12,
    color: '#6b7280',
    marginRight: 4,
    fontWeight: '500',
  },
  compactBalanceAmount: {
    fontSize: 14,
    fontWeight: '700',
    color: '#6366f1',
  },
  settingsButton: {
    padding: 8,
    borderRadius: 20,
  },
  content: {
    flex: 1,
  },
  searchContainer: {
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  quickActionsContainer: {
    paddingBottom: 8,
  },
  // Saved styles for potential future use or components
  balanceCard: {
    marginHorizontal: 20,
    marginBottom: 24,
    padding: 20,
    borderRadius: 24,
    backgroundColor: "#1f2937",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 8,
  },
  balanceHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 24,
  },
  balanceLabel: {
    fontSize: 14,
    color: "#9ca3af",
    marginBottom: 4,
    fontWeight: "500",
  },
  balanceAmount: {
    fontSize: 32,
    fontWeight: "800",
    color: "white",
    letterSpacing: -1,
  },
  simBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.1)",
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 12,
    gap: 4,
  },
  simBadgeText: {
    color: "white",
    fontSize: 12,
    fontWeight: "600",
  },
  balanceActions: {
    flexDirection: "row",
    gap: 12,
  },
  balanceActionButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#10b981",
    paddingVertical: 12,
    borderRadius: 16,
    gap: 8,
  },
  balanceActionText: {
    color: "white",
    fontWeight: "600",
    fontSize: 14,
  },
});
