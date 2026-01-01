import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, Pressable, Alert } from 'react-native';
import { MaterialIcons as Icon } from '@expo/vector-icons';
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useApp } from './AppContext';
import { useUSSD } from '../hooks/useUSSD';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from "../contexts/ThemeContext";
import { useTranslation } from "react-i18next";
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import InputModal from './InputModal';
import { getAllServices, SearchableService } from '../data/services-data';

export default function FavoritesScreen() {
  const { favorites, removeFavorite, addToHistory } = useApp();
  const { dial } = useUSSD();
  const { colors, theme } = useTheme();
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  
  // Input Modal State
  const [inputModalVisible, setInputModalVisible] = useState(false);
  const [selectedServiceForInput, setSelectedServiceForInput] = useState<SearchableService | null>(null);

  const handleRemove = async (id: string, code: string) => {
    Alert.alert(
      t('serviceTabs.menu.deleteTitle'), 
      t('serviceTabs.menu.deleteMessage', { serviceName: code }),
      [
        { text: t('common.cancel'), style: "cancel" },
        {
          text: t('common.delete'),
          style: "destructive",
          onPress: () => {
             removeFavorite(id);
          }
        }
      ]
    );
  };

  const handleDial = async (code: string) => {
    const service = getAllServices().find(s => s.code === code);
    
    // Add to history
    if (service) {
      addToHistory({
        provider: service.provider,
        serviceName: service.serviceName,
        code: service.code,
        category: service.category,
        logo: service.logo
      });
    }

    if (service && service.requiresInput) {
      setSelectedServiceForInput(service);
      setInputModalVisible(true);
    } else {
      try {
        const preferredSim = await AsyncStorage.getItem("preferredSim");
        const simSlot = preferredSim === "sim2" ? 1 : 0;
        dial(code, simSlot);
      } catch (error) {
        console.error("Error reading preferred SIM:", error);
        dial(code, 0);
      }
    }
  };

  const handleInputSubmit = (values: Record<string, string>) => {
    if (!selectedServiceForInput) return;

    let finalCode = selectedServiceForInput.code;
    Object.entries(values).forEach(([key, value]) => {
      finalCode = finalCode.replace(key, value);
    });

    dial(finalCode, 0);
    setSelectedServiceForInput(null);
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header with gradient */}
      <LinearGradient
        colors={['#10b981', '#059669']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[styles.header, { paddingTop: Math.max(insets.top, 20) + 20 }]}
      >
        <View style={styles.headerContent}>
          <View style={styles.headerIconContainer}>
            <Icon name="star" size={28} color="#fff" />
          </View>
          <View style={styles.headerTextContainer}>
            <Text style={styles.title}>{t('tabs.favorites')}</Text>
            <Text style={styles.subtitle}>{favorites.length} saved codes</Text>
          </View>
        </View>
      </LinearGradient>
      
      {favorites.length === 0 ? (
        <View style={styles.emptyState}>
          <View style={[styles.emptyIconContainer, { backgroundColor: theme === 'dark' ? colors.border : '#f9fafb', borderColor: theme === 'dark' ? colors.border : '#e5e7eb' }]}>
            <Icon name="star-border" size={80} color={theme === 'dark' ? colors.textSecondary : "#e5e7eb"} />
          </View>
          <Text style={[styles.emptyText, { color: colors.textSecondary }]}>No favorites yet</Text>
          <Text style={[styles.emptySubtext, { color: colors.textSecondary }]}>
            Tap the ⭐ star icon on any service to add it here for quick access
          </Text>
        </View>
      ) : (
        <FlatList
          data={favorites}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => (
            <Pressable 
              style={({ pressed }) => [
                styles.item,
                { 
                  backgroundColor: colors.surface, 
                  borderColor: theme === 'dark' ? colors.border : '#f3f4f6' 
                },
                pressed && { opacity: 0.7, transform: [{ scale: 0.98 }] },
              ]} 
              onPress={() => handleDial(item.code)}
            >
              <View style={styles.itemContent}>
                <View style={styles.iconContainer}>
                  <LinearGradient
                    colors={['#10b981', '#059669']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.iconGradient}
                  >
                    <Icon name="call" size={22} color="#fff" />
                  </LinearGradient>
                </View>
                <View style={styles.codeInfo}>
                  <Text style={[styles.code, { color: colors.text }]}>{item.code}</Text>
                  <Text style={[styles.codeLabel, { color: colors.textSecondary }]}>
                    {item.serviceName}
                  </Text>
                </View>
              </View>
              <View style={styles.actions}>
                <Pressable 
                  onPress={() => handleRemove(item.id, item.code)} 
                  style={styles.removeButton}
                  hitSlop={8}
                >
                  <Icon name="delete-outline" size={22} color="#ef4444" />
                </Pressable>
                <Icon name="chevron-right" size={20} color={colors.textSecondary} />
              </View>
            </Pressable>
          )}
        />
      )}

      <InputModal
        visible={inputModalVisible}
        onClose={() => setInputModalVisible(false)}
        onSubmit={handleInputSubmit}
        serviceName={selectedServiceForInput?.serviceName || ""}
        fields={selectedServiceForInput?.requiresInput?.fields || []}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    // Top padding set dynamically
    paddingBottom: 24,
    paddingHorizontal: 20,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  headerTextContainer: {
    flex: 1,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: '#fff',
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
    marginTop: 4,
    fontWeight: '500',
  },
  listContent: {
    padding: 20,
    paddingTop: 12,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 1,
  },
  itemContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconContainer: {
    marginRight: 16,
  },
  iconGradient: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
  },
  codeInfo: {
    flex: 1,
  },
  code: {
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: 0.5,
    fontFamily: 'monospace',
  },
  codeLabel: {
    fontSize: 12,
    marginTop: 2,
    fontWeight: '500',
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  removeButton: {
    padding: 8,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyIconContainer: {
    width: 140,
    height: 140,
    borderRadius: 70,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
    borderWidth: 2,
    borderStyle: 'dashed',
  },
  emptyText: {
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 15,
    textAlign: 'center',
    lineHeight: 22,
    maxWidth: 280,
  },
});
