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

export default function HistoryScreen() {
  const { history, clearHistory, addToHistory } = useApp();
  const { dial } = useUSSD();
  const { colors, theme } = useTheme();
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();

  const handleClearHistory = () => {
    Alert.alert(
      t('settings.alerts.clearHistoryTitle'), 
      t('settings.alerts.clearHistoryMessage'), 
      [
        { text: t('common.cancel'), style: "cancel" },
        {
          text: "Clear",
          style: "destructive",
          onPress: () => {
            clearHistory();
          }
        }
      ]
    );
  };

  const handleDial = async (item: any) => {
    // Add to history via AppContext
    addToHistory({
      provider: item.provider,
      serviceName: item.serviceName,
      code: item.code,
      category: item.category,
      logo: item.logo
    });

    try {
      const preferredSim = await AsyncStorage.getItem("preferredSim");
      const simSlot = preferredSim === "sim2" ? 1 : 0;
      dial(item.code, simSlot);
    } catch (error) {
      console.error("Error reading preferred SIM:", error);
      dial(item.code, 0);
    }
  };

  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header with gradient */}
      <LinearGradient
        colors={['#6366f1', '#4f46e5']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[styles.header, { paddingTop: Math.max(insets.top, 20) + 20 }]}
      >
        <View style={styles.headerContent}>
          <View style={styles.headerLeft}>
            <View style={styles.headerIconContainer}>
              <Icon name="history" size={28} color="#fff" />
            </View>
            <View style={styles.headerTextContainer}>
              <Text style={styles.title}>{t('tabs.history')}</Text>
              <Text style={styles.subtitle}>{history.length} recent calls</Text>
            </View>
          </View>
          {history.length > 0 && (
            <Pressable onPress={handleClearHistory} style={styles.clearButton}>
              <Icon name="delete-sweep" size={20} color="#fff" />
              <Text style={styles.clearText}>Clear</Text>
            </Pressable>
          )}
        </View>
      </LinearGradient>
      
      {history.length === 0 ? (
        <View style={styles.emptyState}>
          <View style={[styles.emptyIconContainer, { backgroundColor: theme === 'dark' ? colors.border : '#f9fafb', borderColor: theme === 'dark' ? colors.border : '#e5e7eb' }]}>
            <Icon name="history" size={80} color={theme === 'dark' ? colors.textSecondary : "#e5e7eb"} />
          </View>
          <Text style={[styles.emptyText, { color: colors.textSecondary }]}>No history yet</Text>
          <Text style={[styles.emptySubtext, { color: colors.textSecondary }]}>
            Your dialed USSD codes will appear here
          </Text>
        </View>
      ) : (
        <FlatList
          data={history}
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
              onPress={() => handleDial(item)}
            >
              <View style={styles.itemContent}>
                <View style={styles.iconContainer}>
                  <LinearGradient
                    colors={['#6366f1', '#4f46e5']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.iconGradient}
                  >
                    <Icon name="restore" size={22} color="#fff" />
                  </LinearGradient>
                </View>
                <View style={styles.codeInfo}>
                  <Text style={[styles.code, { color: colors.text }]}>{item.code}</Text>
                   <Text style={{ color: colors.textSecondary, fontSize: 12 }}>{item.serviceName}</Text>
                  <View style={styles.timeContainer}>
                    <Icon name="access-time" size={12} color={colors.textSecondary} />
                    <Text style={[styles.timestamp, { color: colors.textSecondary }]}>{formatTime(item.executedAt)}</Text>
                  </View>
                </View>
              </View>
              <Icon name="chevron-right" size={20} color={colors.textSecondary} />
            </Pressable>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    // Top padding dynamic
    paddingBottom: 24,
    paddingHorizontal: 20,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
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
  clearButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 6,
  },
  clearText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
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
    marginBottom: 4,
  },
  timeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  timestamp: {
    fontSize: 12,
    fontWeight: '500',
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
  },
});
