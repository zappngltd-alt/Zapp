import React, { createContext, useContext, useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { SearchableService } from "../data/services-data";

// Types
export interface FavoriteService {
  id: string;
  category: "bank" | "telecom" | "momo" | "general" | "custom";
  serviceName: string;
  code: string;
  provider: string;
  logo?: string;
  addedAt: number;
}

export interface HistoryItem {
  id: string;
  category: "bank" | "telecom" | "momo" | "general" | "custom";
  serviceName: string;
  code: string;
  provider: string;
  logo?: string;
  executedAt: number;
  sim?: number;
}

interface AppContextType {
  preferredSim: "sim1" | "sim2";
  setPreferredSim: (sim: "sim1" | "sim2") => void;
  favorites: FavoriteService[];
  history: HistoryItem[];
  addFavorite: (service: Omit<FavoriteService, "id" | "addedAt">) => void;
  removeFavorite: (id: string) => void;
  isFavorite: (code: string, provider: string) => boolean;
  addToHistory: (item: Omit<HistoryItem, "id" | "executedAt">) => void;
  clearHistory: () => void;
  clearFavorites: () => void;
  removeHistoryItem: (id: string) => void;
  customServices: SearchableService[];
  addCustomService: (service: Omit<SearchableService, "category" | "logo"> & { logo?: string }) => Promise<void>;
  updateCustomService: (updatedService: SearchableService) => Promise<void>;
  deleteCustomService: (id: string) => Promise<void>;
  appLockEnabled: boolean;
  setAppLockEnabled: (enabled: boolean) => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const FAVORITES_KEY = "favorites";
const HISTORY_KEY = "history";

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [preferredSim, setPreferredSimState] = useState<"sim1" | "sim2">("sim1");
  const [favorites, setFavorites] = useState<FavoriteService[]>([]);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [customServices, setCustomServices] = useState<SearchableService[]>([]);
  const [appLockEnabled, setAppLockEnabledState] = useState(false);

  // Load from AsyncStorage on mount
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [savedFavorites, savedHistory, savedSim, savedCustom, savedAppLock] = await Promise.all([
        AsyncStorage.getItem(FAVORITES_KEY),
        AsyncStorage.getItem(HISTORY_KEY),
        AsyncStorage.getItem("preferredSim"),
        AsyncStorage.getItem("@custom_services"),
        AsyncStorage.getItem("@app_lock_enabled"),
      ]);

      if (savedSim) {
        setPreferredSimState(savedSim as "sim1" | "sim2");
      }

      if (savedAppLock) {
        setAppLockEnabledState(savedAppLock === "true");
      }

      if (savedFavorites) {
        try {
          setFavorites(JSON.parse(savedFavorites));
        } catch (e) {
          console.error("Failed to load favorites", e);
        }
      }

      if (savedHistory) {
        try {
          setHistory(JSON.parse(savedHistory));
        } catch (e) {
          console.error("Failed to load history", e);
        }
      }

      if (savedCustom) {
        try {
          setCustomServices(JSON.parse(savedCustom));
        } catch (e) {
          console.error("Failed to load custom services", e);
        }
      }
    } catch (error) {
      console.error("Error loading data from AsyncStorage:", error);
    }
  };

  // Save favorites to AsyncStorage whenever they change
  useEffect(() => {
    const saveFavorites = async () => {
      try {
        await AsyncStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites));
      } catch (error) {
        console.error("Error saving favorites:", error);
      }
    };
    saveFavorites();
  }, [favorites]);

  // Save history to AsyncStorage whenever it changes
  useEffect(() => {
    const saveHistory = async () => {
      try {
        await AsyncStorage.setItem(HISTORY_KEY, JSON.stringify(history));
      } catch (error) {
        console.error("Error saving history:", error);
      }
    };
    saveHistory();
  }, [history]);

  const addFavorite = (service: Omit<FavoriteService, "id" | "addedAt">) => {
    const newFavorite: FavoriteService = {
      ...service,
      id: `fav_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      addedAt: Date.now(),
    };
    setFavorites((prev) => [newFavorite, ...prev]);
  };

  const removeFavorite = (id: string) => {
    setFavorites((prev) => prev.filter((fav) => fav.id !== id));
  };

  const isFavorite = (code: string, provider: string) => {
    return favorites.some(
      (fav) => fav.code === code && fav.provider === provider
    );
  };

  const addToHistory = (item: Omit<HistoryItem, "id" | "executedAt">) => {
    const newHistoryItem: HistoryItem = {
      ...item,
      id: `hist_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      executedAt: Date.now(),
    };
    // Keep only last 50 items (MVP limit)
    setHistory((prev) => [newHistoryItem, ...prev].slice(0, 50));
  };

  const clearHistory = () => {
    setHistory([]);
  };

  const clearFavorites = () => {
    setFavorites([]);
  };

  const setPreferredSim = async (sim: "sim1" | "sim2") => {
    setPreferredSimState(sim);
    try {
      await AsyncStorage.setItem("preferredSim", sim);
    } catch (error) {
      console.error("Error saving preferred SIM:", error);
    }
  };

  const removeHistoryItem = (id: string) => {
    setHistory((prev) => prev.filter((item) => item.id !== id));
  };

  // Custom Services Management
  const addCustomService = async (service: Omit<SearchableService, "category" | "logo"> & { logo?: string }) => {
    const newService: SearchableService = {
      ...service,
      id: `custom_${Date.now()}`,
      category: "custom",
      logo: service.logo || "👤",
    };
    const updated = [newService, ...customServices];
    setCustomServices(updated);
    await AsyncStorage.setItem("@custom_services", JSON.stringify(updated));
  };

  const updateCustomService = async (updatedService: SearchableService) => {
    const updated = customServices.map((s) => (s.id === updatedService.id ? updatedService : s));
    setCustomServices(updated);
    await AsyncStorage.setItem("@custom_services", JSON.stringify(updated));
  };

  const deleteCustomService = async (id: string) => {
    const updated = customServices.filter((s) => s.id !== id);
    setCustomServices(updated);
    await AsyncStorage.setItem("@custom_services", JSON.stringify(updated));
    
    // Also remove from favorites if it was there
    const fav = favorites.find(f => f.category === 'custom' && (f.id === id || f.code === customServices.find(s => s.id === id)?.code));
    if (fav) {
      removeFavorite(fav.id);
    }
  };

  const setAppLockEnabled = async (enabled: boolean) => {
    setAppLockEnabledState(enabled);
    try {
      await AsyncStorage.setItem("@app_lock_enabled", enabled.toString());
    } catch (error) {
      console.error("Error saving app lock status:", error);
    }
  };

  return (
    <AppContext.Provider
      value={{
        preferredSim,
        setPreferredSim,
        favorites,
        history,
        addFavorite,
        removeFavorite,
        isFavorite,
        addToHistory,
        clearHistory,
        clearFavorites,
        removeHistoryItem,
        customServices,
        addCustomService,
        updateCustomService,
        deleteCustomService,
        appLockEnabled,
        setAppLockEnabled,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error("useApp must be used within an AppProvider");
  }
  return context;
}
