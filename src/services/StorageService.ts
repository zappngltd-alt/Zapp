import AsyncStorage from '@react-native-async-storage/async-storage';

const FAVORITES_KEY = 'favorites';
const HISTORY_KEY = 'history';
const MAX_HISTORY_ITEMS = 50;

export interface HistoryItem {
  code: string;
  timestamp: number;
}

export const StorageService = {
  getFavorites: async (): Promise<string[]> => {
    try {
      const favorites = await AsyncStorage.getItem(FAVORITES_KEY);
      return favorites ? JSON.parse(favorites) : [];
    } catch (error) {
      console.error('Error getting favorites:', error);
      return [];
    }
  },

  toggleFavorite: async (code: string): Promise<boolean> => {
    try {
      const favorites = await StorageService.getFavorites();
      let newFavorites;
      let isFavorite;

      if (favorites.includes(code)) {
        newFavorites = favorites.filter((fav) => fav !== code);
        isFavorite = false;
      } else {
        newFavorites = [...favorites, code];
        isFavorite = true;
      }

      await AsyncStorage.setItem(FAVORITES_KEY, JSON.stringify(newFavorites));
      return isFavorite;
    } catch (error) {
      console.error('Error toggling favorite:', error);
      return false;
    }
  },

  isFavorite: async (code: string): Promise<boolean> => {
    try {
      const favorites = await StorageService.getFavorites();
      return favorites.includes(code);
    } catch (error) {
      return false;
    }
  },

  getHistory: async (): Promise<HistoryItem[]> => {
    try {
      const history = await AsyncStorage.getItem(HISTORY_KEY);
      return history ? JSON.parse(history) : [];
    } catch (error) {
      console.error('Error getting history:', error);
      return [];
    }
  },

  addToHistory: async (item: HistoryItem) => {
    try {
      const history = await StorageService.getHistory();
      // Remove duplicates of the same code to keep only the latest
      const filteredHistory = history.filter((h) => h.code !== item.code);
      
      const newHistory = [item, ...filteredHistory].slice(0, MAX_HISTORY_ITEMS);
      await AsyncStorage.setItem(HISTORY_KEY, JSON.stringify(newHistory));
    } catch (error) {
      console.error('Error adding to history:', error);
    }
  },
  
  clearHistory: async () => {
      try {
          await AsyncStorage.removeItem(HISTORY_KEY);
      } catch (error) {
          console.error('Error clearing history:', error);
      }
  }
};
