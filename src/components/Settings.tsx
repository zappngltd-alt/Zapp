import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Pressable,
  Alert,
  Switch,
  Modal,
} from "react-native";
import { MaterialIcons as Icon } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useApp } from "./AppContext";
import { useTheme } from "../contexts/ThemeContext";
import { useAuth } from "../contexts/AuthContext";
import { useTranslation } from "react-i18next";
import Toast from "react-native-toast-message";

export default function Settings() {
  const { favorites, history, clearHistory, clearFavorites, preferredSim, setPreferredSim, appLockEnabled, setAppLockEnabled } = useApp();
  const { colors, theme, toggleTheme } = useTheme();
  const { t, i18n } = useTranslation();
  const { sessionDurationDays, setSessionDurationDays, signOut } = useAuth();
  
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [autoSaveFavorites, setAutoSaveFavorites] = useState(true);
  const [showLanguageModal, setShowLanguageModal] = useState(false);

  const languages = [
    { code: 'en', label: 'English' },
    { code: 'yo', label: 'Yorùbá' },
    { code: 'ha', label: 'Hausa' },
    { code: 'ig', label: 'Igbo' },
  ];

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const savedNotifications = await AsyncStorage.getItem(
        "notificationsEnabled"
      );
      const savedAutoSave = await AsyncStorage.getItem("autoSaveFavorites");

      if (savedNotifications !== null)
        setNotificationsEnabled(savedNotifications === "true");
      if (savedAutoSave !== null)
        setAutoSaveFavorites(savedAutoSave === "true");
    } catch (error) {
      console.error("Error loading settings:", error);
    }
  };

  const saveSetting = async (key: string, value: string) => {
    try {
      await AsyncStorage.setItem(key, value);
    } catch (error) {
      console.error(`Error saving ${key}:`, error);
    }
  };

  const handleSimChange = (sim: "sim1" | "sim2") => {
    setPreferredSim(sim);
    Toast.show({
      type: "success",
      text1: "Preferred SIM updated",
    });
  };

  const handleNotificationsToggle = (value: boolean) => {
    setNotificationsEnabled(value);
    saveSetting("notificationsEnabled", value.toString());
  };

  const handleAutoSaveToggle = (value: boolean) => {
    setAutoSaveFavorites(value);
    saveSetting("autoSaveFavorites", value.toString());
  };

  const handleLanguageChange = async (langCode: string) => {
    try {
        await i18n.changeLanguage(langCode);
        await AsyncStorage.setItem('user_language', langCode);
        setShowLanguageModal(false);
    } catch (error) {
        console.error('Error changing language', error);
    }
  };

  const currentLanguageLabel = languages.find(l => l.code === i18n.language)?.label || 'English';

  const handleClearHistory = () => {
    Alert.alert(
      t('settings.alerts.clearHistoryTitle'),
      t('settings.alerts.clearHistoryMessage'),
      [
        {
          text: t('settings.alerts.cancel'),
          style: "cancel",
        },
        {
          text: t('settings.alerts.clearAll'),
          style: "destructive",
          onPress: () => {
            clearHistory();
            Toast.show({
              type: "success",
              text1: t('settings.alerts.clearedSuccess', { item: 'History' }),
            });
          },
        },
      ]
    );
  };

  const handleClearFavorites = () => {
    Alert.alert(
      t('settings.alerts.clearFavoritesTitle'),
      t('settings.alerts.clearFavoritesMessage'),
      [
        {
          text: t('settings.alerts.cancel'),
          style: "cancel",
        },
        {
          text: t('settings.alerts.clearAll'),
          style: "destructive",
          onPress: () => {
            clearFavorites();
            Toast.show({
              type: "success",
              text1: t('settings.alerts.clearedSuccess', { item: 'Favorites' }),
            });
          },
        },
      ]
    );
  };

  const settingsSections = [
    {
      title: t('settings.sections.sim'),
      items: [
        {
          type: "sim_selector",
          label: t('settings.items.preferredSim'),
          value: preferredSim,
        },
      ],
    },
    {
      title: t('settings.sections.app'),
      items: [
        {
            type: "action",
            label: t('settings.language'),
            value: currentLanguageLabel,
            action: () => setShowLanguageModal(true),
        },
        {
            type: "toggle",
            label: t('settings.theme.darkMode'),
            value: theme === 'dark',
            onValueChange: toggleTheme,
        },
        {
          type: "toggle",
          label: t('settings.items.notifications'),
          value: notificationsEnabled,
          onValueChange: handleNotificationsToggle,
        },
        {
          type: "toggle",
          label: t('settings.items.autoSave'),
          value: autoSaveFavorites,
          onValueChange: handleAutoSaveToggle,
        },
        {
          type: "toggle",
          label: t('settings.items.appLock'),
          value: appLockEnabled,
          onValueChange: setAppLockEnabled,
          description: t('settings.items.appLockDesc'),
        },
      ],
    },
    {
      title: t('settings.sections.data'),
      items: [
        {
          type: "info",
          label: "Favorites",
          value: t('settings.items.favoritesSaved', { count: favorites.length }),
        },
        {
          type: "info",
          label: "History Items",
          value: t('settings.items.historyRecords', { count: history.length }),
        },
        {
          type: "action",
          label: t('settings.items.clearHistory'),
          action: handleClearHistory,
          destructive: true,
        },
        {
          type: "action",
          label: t('settings.items.clearFavorites'),
          action: handleClearFavorites,
          destructive: true,
        },
      ],
    },
    {
      title: t('settings.sections.about'),
      items: [
        {
          type: "info",
          label: t('settings.items.version'),
          value: "1.0.0",
        },
        {
          type: "info",
          label: t('settings.items.developer'),
          value: "Zapp Technologies LTD",
        },
      ],
    },
  ];

  const renderSettingItem = (
    item: any,
    sectionIndex: number,
    itemIndex: number
  ) => {
    const itemStyle = {
        borderBottomColor: colors.border,
        backgroundColor: colors.surface
    };
    const textStyle = { color: colors.text };

    switch (item.type) {
      case "sim_selector":
        return (
          <View key={`${sectionIndex}-${itemIndex}`} style={[styles.settingItem, itemStyle]}>
            <Text style={[styles.settingLabel, textStyle]}>{item.label}</Text>
            <View style={styles.simSelector}>
              <Pressable
                style={[
                  styles.simOption,
                  { borderColor: colors.border, backgroundColor: colors.surface },
                  item.value === "sim1" && { backgroundColor: colors.primary, borderColor: colors.primary },
                ]}
                onPress={() => handleSimChange("sim1")}
              >
                <Icon
                  name="sim-card"
                  size={16}
                  color={item.value === "sim1" ? "white" : colors.textSecondary}
                />
                <Text
                  style={[
                    styles.simOptionText,
                    { color: colors.textSecondary },
                    item.value === "sim1" && styles.simOptionTextActive,
                  ]}
                >
                  {t('settings.sim.sim1')}
                </Text>
              </Pressable>
              <Pressable
                style={[
                  styles.simOption,
                  { borderColor: colors.border, backgroundColor: colors.surface },
                  item.value === "sim2" && { backgroundColor: colors.primary, borderColor: colors.primary },
                ]}
                onPress={() => handleSimChange("sim2")}
              >
                <Icon
                  name="sim-card"
                  size={16}
                  color={item.value === "sim2" ? "white" : colors.textSecondary}
                />
                <Text
                  style={[
                    styles.simOptionText,
                    { color: colors.textSecondary },
                    item.value === "sim2" && styles.simOptionTextActive,
                  ]}
                >
                  {t('settings.sim.sim2')}
                </Text>
              </Pressable>
            </View>
          </View>
        );

      case "toggle":
        return (
          <View key={`${sectionIndex}-${itemIndex}`} style={[styles.settingItemContainer, itemStyle]}>
            <View style={styles.settingItem}>
              <View style={styles.labelContainer}>
                <Text style={[styles.settingLabel, textStyle]}>{item.label}</Text>
                {item.description && (
                  <Text style={[styles.settingDescription, { color: colors.textSecondary }]}>{item.description}</Text>
                )}
              </View>
              <Switch
                value={item.value}
                onValueChange={item.onValueChange}
                trackColor={{ false: colors.border, true: colors.primary }}
                thumbColor={item.value ? "#ffffff" : "#f4f3f4"}
              />
            </View>
          </View>
        );

      case "info":
        return (
          <View key={`${sectionIndex}-${itemIndex}`} style={[styles.settingItem, itemStyle]}>
            <Text style={[styles.settingLabel, textStyle]}>{item.label}</Text>
            <Text style={[styles.settingValue, { color: colors.textSecondary }]}>{item.value}</Text>
          </View>
        );

      case "action":
        return (
          <Pressable
            key={`${sectionIndex}-${itemIndex}`}
            style={[styles.settingItem, itemStyle]}
            onPress={item.action}
          >
            <Text
              style={[
                styles.settingLabel,
                textStyle,
                item.destructive && styles.settingLabelDestructive,
              ]}
            >
              {item.label}
            </Text>
            <View style={{flexDirection: 'row', alignItems: 'center'}}>
                {item.value && (
                    <Text style={{color: colors.textSecondary, marginRight: 8, fontSize: 16}}>{item.value}</Text>
                )}
                <Icon
                name="chevron-right"
                size={20}
                color={item.destructive ? colors.error : colors.textSecondary}
                />
            </View>
          </Pressable>
        );

      default:
        return null;
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
            <View style={[styles.header, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
            <Text style={[styles.title, { color: colors.text }]}>{t('settings.title')}</Text>
            <Text style={[styles.subtitle, { color: colors.textSecondary }]}>{t('settings.subtitle')}</Text>
            </View>

            {settingsSections.map((section, sectionIndex) => (
            <View key={sectionIndex} style={styles.section}>
                <Text style={[styles.sectionTitle, { color: colors.text }]}>{section.title}</Text>
                <View style={[styles.sectionContent, { backgroundColor: colors.surface, shadowColor: theme === 'dark' ? '#000' : '#000' }]}>
                {section.items.map((item, itemIndex) =>
                    renderSettingItem(item, sectionIndex, itemIndex)
                )}
                </View>
            </View>
            ))}

            {/* Session Timeout Control */}
            <View style={styles.section}>
                 <Text style={[styles.sectionTitle, { color: colors.text }]}>Security</Text>
                 <View style={[styles.sectionContent, { backgroundColor: colors.surface, padding: 16 }]}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <Icon name="timer" size={24} color={colors.text} style={{ marginRight: 16 }} />
                        <View>
                            <Text style={{ color: colors.text, fontSize: 16 }}>Session Timeout</Text>
                            <Text style={{ color: colors.textSecondary, fontSize: 12 }}>Force password login every {sessionDurationDays} days</Text>
                        </View>
                        </View>
                        <View style={{ flexDirection: 'row' }}>
                            {[7, 14, 30].map(days => (
                                <Pressable 
                                    key={days} 
                                    onPress={() => setSessionDurationDays(days)}
                                    style={{ 
                                        padding: 8, 
                                        backgroundColor: sessionDurationDays === days ? colors.primary : colors.surface,
                                        borderRadius: 8,
                                        marginLeft: 4,
                                        borderWidth: 1,
                                        borderColor: colors.border
                                    }}
                                >
                                    <Text style={{ color: sessionDurationDays === days ? '#fff' : colors.text, fontSize: 12 }}>{days}d</Text>
                                </Pressable>
                            ))}
                        </View>
                    </View>
                
                    <Pressable 
                        onPress={signOut}
                        style={{ 
                        marginTop: 24, 
                        padding: 16, 
                        backgroundColor: colors.surface, 
                        borderRadius: 12,
                        flexDirection: 'row',
                        alignItems: 'center',
                        justifyContent: 'center',
                        borderWidth: 1,
                        borderColor: colors.error
                        }}
                    >
                        <Icon name="logout" size={24} color={colors.error} style={{ marginRight: 8 }} />
                        <Text style={{ color: colors.error, fontWeight: 'bold' }}>Sign Out</Text>
                    </Pressable>
                 </View>
            </View>

            <View style={{ height: 40 }} /> 
      </ScrollView>

      <Modal
        animationType="slide"
        transparent={true}
        visible={showLanguageModal}
        onRequestClose={() => setShowLanguageModal(false)}
      >
        <View style={styles.modalOverlay}>
            <View style={[styles.modalContent, { backgroundColor: colors.surface }]}>
                <View style={[styles.modalHeader, { borderBottomColor: colors.border }]}>
                    <Text style={[styles.modalTitle, { color: colors.text }]}>{t('settings.language')}</Text>
                    <Pressable onPress={() => setShowLanguageModal(false)}>
                         <Icon name="close" size={24} color={colors.text} />
                    </Pressable>
                </View>
                {languages.map((lang) => (
                    <Pressable
                        key={lang.code}
                        style={[
                            styles.languageOption, 
                            { borderBottomColor: colors.border },
                            i18n.language === lang.code && { backgroundColor: theme === 'dark' ? '#374151' : '#f0fdf4' }
                        ]}
                        onPress={() => handleLanguageChange(lang.code)}
                    >
                        <Text style={[
                            styles.languageOptionText, 
                            { color: colors.text },
                            i18n.language === lang.code && { color: colors.primary, fontWeight: 'bold' }
                        ]}>
                            {lang.label}
                        </Text>
                         {i18n.language === lang.code && (
                            <Icon name="check" size={20} color={colors.primary} />
                        )}
                    </Pressable>
                ))}
            </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
  header: {
    padding: 16,
    borderBottomWidth: 1,
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
  },
  subtitle: {
    fontSize: 14,
    marginTop: 4,
  },
  section: {
    marginTop: 24,
    paddingHorizontal: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 12,
  },
  sectionContent: {
    borderRadius: 12,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
    overflow: 'hidden'
  },
  settingItemContainer: {
    borderBottomWidth: 1,
  },
  settingItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
  },
  labelContainer: {
    flex: 1,
    marginRight: 16,
  },
  settingLabel: {
    fontSize: 16,
  },
  settingDescription: {
    fontSize: 12,
    marginTop: 2,
  },
  settingLabelDestructive: {
    color: "#ef4444",
  },
  settingValue: {
    fontSize: 16,
  },
  simSelector: {
    flexDirection: "row",
    gap: 8,
  },
  simOption: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
  },
  simOptionText: {
    fontSize: 14,
    marginLeft: 6,
  },
  simOptionTextActive: {
    color: "white",
  },
  modalOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0,0,0,0.5)',
      justifyContent: 'flex-end',
  },
  modalContent: {
      borderTopLeftRadius: 20,
      borderTopRightRadius: 20,
      paddingBottom: 40,
      maxHeight: '50%',
  },
  modalHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: 16,
      borderBottomWidth: 1,
  },
  modalTitle: {
      fontSize: 18,
      fontWeight: 'bold',
  },
  languageOption: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: 16,
      borderBottomWidth: 1,
  },
  languageOptionText: {
      fontSize: 16,
  }
});
