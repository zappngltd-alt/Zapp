import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Pressable,
  FlatList,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { MaterialIcons as Icon } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { SearchableService } from "../data/services-data";
import { useTranslation } from "react-i18next";
import { useTheme } from "../contexts/ThemeContext";

interface SearchBarProps {
  onDial: (
    code: string,
    serviceName?: string,
    provider?: string,
    category?: string,
    logo?: string
  ) => void;
  selectedSim: number;
  servicesData: SearchableService[];
}

export default function SearchBar({
  onDial,
  selectedSim,
  servicesData,
}: SearchBarProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredServices, setFilteredServices] = useState<SearchableService[]>(
    []
  );
  const [recentSearches, setRecentSearches] = useState<SearchableService[]>([]);
  const [isFocused, setIsFocused] = useState(false);
  
  const { t } = useTranslation();
  const { colors, theme } = useTheme();

  // Load recent searches
  React.useEffect(() => {
    const loadRecent = async () => {
      try {
        const saved = await AsyncStorage.getItem("@recent_searches");
        if (saved) setRecentSearches(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to load recent searches", e);
      }
    };
    loadRecent();
  }, []);

  const saveRecent = async (service: SearchableService) => {
    try {
      const filtered = recentSearches.filter(s => s.code !== service.code || s.provider !== service.provider);
      const newRecent = [service, ...filtered].slice(0, 5);
      setRecentSearches(newRecent);
      await AsyncStorage.setItem("@recent_searches", JSON.stringify(newRecent));
    } catch (e) {
      console.error("Failed to save recent search", e);
    }
  };

  const clearRecent = async () => {
    setRecentSearches([]);
    await AsyncStorage.removeItem("@recent_searches");
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    if (query.length >= 2) {
      const filtered = servicesData.filter(
        (service) =>
          service.serviceName.toLowerCase().includes(query.toLowerCase()) ||
          service.provider.toLowerCase().includes(query.toLowerCase()) ||
          service.code.includes(query)
      );
      setFilteredServices(filtered.slice(0, 10)); // Limit to 10 results
    } else {
      setFilteredServices([]);
    }
  };

  const handleServiceSelect = (service: SearchableService) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onDial(
      service.code,
      service.serviceName,
      service.provider,
      service.category,
      service.logo
    );
    saveRecent(service);
    setSearchQuery("");
    setFilteredServices([]);
  };

  const renderServiceItem = ({ item }: { item: SearchableService }) => (
    <Pressable
      style={[styles.serviceItem, { borderBottomColor: theme === 'dark' ? colors.border : '#f3f4f6' }]}
      onPress={() => handleServiceSelect(item)}
    >
      <View style={styles.serviceInfo}>
        <Text style={[styles.serviceName, { color: colors.text }]}>{item.serviceName}</Text>
        <Text style={[styles.serviceProvider, { color: colors.textSecondary }]}>{item.provider}</Text>
        <Text style={styles.serviceCode}>{item.code}</Text>
      </View>
      <Icon name="chevron-right" size={20} color={colors.textSecondary} />
    </Pressable>
  );

  return (
    <View style={styles.container}>
      <View style={[
        styles.searchContainer, 
        { backgroundColor: colors.surface, shadowColor: theme === 'dark' ? 'transparent' : '#000' }
      ]}>
        <Icon
          name="search"
          size={20}
          color={colors.textSecondary}
          style={styles.searchIcon}
        />
        <TextInput
          style={[styles.searchInput, { color: colors.text }]}
          placeholder={t('search.placeholder')}
          placeholderTextColor={colors.textSecondary}
          value={searchQuery}
          onChangeText={handleSearch}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setTimeout(() => setIsFocused(false), 200)}
          autoCapitalize="none"
          autoCorrect={false}
        />
        {searchQuery.length > 0 && (
          <Pressable
            style={styles.clearButton}
            onPress={() => {
              setSearchQuery("");
              setFilteredServices([]);
            }}
          >
            <Icon name="clear" size={20} color={colors.textSecondary} />
          </Pressable>
        )}
      </View>

      {/* Inline Search Results Dropdown */}
      {(filteredServices.length > 0 && searchQuery.length >= 2) || (isFocused && searchQuery.length === 0 && recentSearches.length > 0) ? (
        <View style={[styles.resultsDropdown, { backgroundColor: colors.surface }]}>
          {isFocused && searchQuery.length === 0 && recentSearches.length > 0 && (
            <View style={styles.recentHeader}>
              <Text style={[styles.recentTitle, { color: colors.textSecondary }]}>Recent Searches</Text>
              <Pressable onPress={clearRecent}>
                <Text style={{ color: "#10b981", fontSize: 12 }}>Clear All</Text>
              </Pressable>
            </View>
          )}
          <FlatList
            data={searchQuery.length >= 2 ? filteredServices : recentSearches}
            keyExtractor={(item) => `${item.provider}-${item.code}-${item.id || ''}`}
            renderItem={renderServiceItem}
            showsVerticalScrollIndicator={false}
            style={styles.resultsList}
            keyboardShouldPersistTaps="handled"
          />
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "white",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  searchIcon: {
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: "#1f2937",
  },
  clearButton: {
    padding: 4,
  },
  resultsDropdown: {
    position: "absolute",
    top: 60,
    left: 0,
    right: 0,
    backgroundColor: "white",
    borderRadius: 12,
    maxHeight: 300,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 8,
    zIndex: 1000,
  },
  resultsList: {
    borderRadius: 12,
  },
  recentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
  },
  recentTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6b7280',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  serviceItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#f3f4f6",
  },
  serviceInfo: {
    flex: 1,
  },
  serviceName: {
    fontSize: 16,
    fontWeight: "500",
    color: "#1f2937",
    marginBottom: 4,
  },
  serviceProvider: {
    fontSize: 14,
    color: "#6b7280",
    marginBottom: 2,
  },
  serviceCode: {
    fontSize: 14,
    color: "#10b981",
    fontWeight: "500",
  },
  noResults: {
    alignItems: "center",
    padding: 32,
  },
  noResultsText: {
    fontSize: 16,
    color: "#6b7280",
    marginTop: 16,
  },
});
