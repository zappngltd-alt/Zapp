import React, { useState, useEffect } from "react";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { StatusBar } from "expo-status-bar";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Toast from "react-native-toast-message";
import { View, Text, Pressable } from "react-native";
import { useTranslation } from "react-i18next";

// Import components
import Onboarding from "./components/Onboarding";
import Dashboard from "./components/Dashboard";
import Favorites from "./components/Favorites";
import History from "./components/History";
import BillsScreen from "./components/BillsScreen";
import Settings from "./components/Settings";

// Import Auth Screens
import LoginScreen from "./screens/LoginScreen";
import RegisterScreen from "./screens/RegisterScreen";

// Import context & config
import { AppProvider } from "./components/AppContext";
import { ThemeProvider, useTheme } from "./contexts/ThemeContext";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import "./i18n/i18n";

// Import icons (using @expo/vector-icons)
import { MaterialIcons as Icon } from "@expo/vector-icons";
import * as LocalAuthentication from "expo-local-authentication";
import { useApp } from "./components/AppContext";

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

// Bottom Tab Navigator for main app
function MainTabNavigator() {
  const { colors, theme } = useTheme();
  const { t } = useTranslation();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: keyof typeof Icon.glyphMap;

          if (route.name === "Home") {
            iconName = "home";
          } else if (route.name === "Favorites") {
            iconName = "favorite";
          } else if (route.name === "Payments") {
            iconName = "payment";
          } else if (route.name === "History") {
            iconName = "history";
          } else if (route.name === "Settings") {
            iconName = "settings";
          } else {
            iconName = "help";
          }

          return <Icon name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textSecondary,
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopColor: colors.border,
          borderTopWidth: 1,
          paddingBottom: 5,
          paddingTop: 5,
          height: 60,
        },
        headerStyle: {
            backgroundColor: colors.surface,
        },
        headerTintColor: colors.text,
        headerShown: false,
      })}
    >
      <Tab.Screen 
        name="Home" 
        component={Dashboard} 
        options={{ tabBarLabel: t('tabs.home') }}
      />
      <Tab.Screen 
        name="Favorites" 
        component={Favorites} 
        options={{ tabBarLabel: t('tabs.favorites') }}
      />
      <Tab.Screen 
        name="Payments" 
        component={BillsScreen} 
        options={{ 
          tabBarLabel: t('tabs.payments'),
          tabBarIcon: ({ color, size }) => (
            <View style={{ 
              width: 50, 
              height: 50, 
              backgroundColor: colors.primary, 
              borderRadius: 25, 
              justifyContent: 'center', 
              alignItems: 'center',
              marginBottom: 5,
              shadowColor: colors.primary,
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.3,
              shadowRadius: 5,
              elevation: 5
            }}>
              <Icon name="payment" size={24} color="white" />
            </View>
          ),
          tabBarLabelStyle: { display: 'none' } 
        }}
      />
      <Tab.Screen 
        name="History" 
        component={History} 
        options={{ tabBarLabel: t('tabs.history') }}
      />
      <Tab.Screen 
        name="Settings" 
        component={Settings} 
        options={{ tabBarLabel: t('tabs.settings') }}
      />
    </Tab.Navigator>
  );
}

// Lock screen component
function AppLockGate({ children }: { children: React.ReactNode }) {
  const { appLockEnabled } = useApp();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const { colors } = useTheme();
  const { t } = useTranslation();

  const authenticate = async () => {
    if (isAuthenticating) return;
    setIsAuthenticating(true);
    try {
      const hasHardware = await LocalAuthentication.hasHardwareAsync();
      const isEnrolled = await LocalAuthentication.isEnrolledAsync();
      
      if (!hasHardware || !isEnrolled) {
        setIsAuthenticated(true);
        setIsAuthenticating(false);
        return;
      }

      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: t('common.authenticate'),
        fallbackLabel: "Use Passcode",
      });

      if (result.success) {
        setIsAuthenticated(true);
      }
    } catch (e) {
      console.error("Auth error:", e);
    } finally {
      setIsAuthenticating(false);
    }
  };

  useEffect(() => {
    if (appLockEnabled && !isAuthenticated) {
      authenticate();
    }
  }, [appLockEnabled]);

  if (appLockEnabled && !isAuthenticated) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background }}>
        <Icon name="lock" size={64} color={colors.primary} />
        <Text style={{ color: colors.text, fontSize: 18, marginTop: 24, paddingHorizontal: 40, textAlign: 'center' }}>
          {t('common.authenticate')}
        </Text>
        <Pressable 
          onPress={authenticate}
          style={{ 
            marginTop: 32, 
            paddingHorizontal: 32, 
            paddingVertical: 12, 
            backgroundColor: colors.primary,
            borderRadius: 8
          }}
        >
          <Text style={{ color: '#fff', fontWeight: 'bold' }}>{t('common.retry')}</Text>
        </Pressable>
      </View>
    );
  }

  return <>{children}</>;
}

// Inner App Component to use Theme
function AppContent() {
  const [hasSeenOnboarding, setHasSeenOnboarding] = useState<boolean | null>(null);
  const { colors, theme } = useTheme();
  const { t } = useTranslation();
  const { user, isSessionExpired } = useAuth(); // Auth Hook

  useEffect(() => {
    checkOnboardingStatus();
  }, []);

  const checkOnboardingStatus = async () => {
    try {
      const value = await AsyncStorage.getItem("hasSeenOnboarding");
      setHasSeenOnboarding(value === "true");
    } catch (error) {
      console.error("Error checking onboarding status:", error);
      setHasSeenOnboarding(false);
    }
  };

  const handleOnboardingComplete = async () => {
    try {
      await AsyncStorage.setItem("hasSeenOnboarding", "true");
      setHasSeenOnboarding(true);
    } catch (error) {
      console.error("Error saving onboarding status:", error);
    }
  };

  // Show loading while checking onboarding status
  if (hasSeenOnboarding === null) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.primary }}>
        <Icon name="smartphone" size={64} color="#fff" />
        <Text style={{ color: '#fff', fontSize: 24, fontWeight: 'bold', marginTop: 16 }}>Zapp</Text>
        <Text style={{ color: 'rgba(255,255,255,0.8)', fontSize: 14, marginTop: 8 }}>{t('common.loading')}</Text>
      </View>
    );
  }

  // NAVIGATION GUARD LOGIC
  return (
    <SafeAreaProvider>
      <AppLockGate>
        <NavigationContainer>
          <StatusBar style={theme === 'dark' ? 'light' : 'dark'} backgroundColor={colors.background} />
          <Stack.Navigator screenOptions={{ headerShown: false }}>
            {hasSeenOnboarding ? (
                // If user is logged in and session valid -> Main App
                user && !isSessionExpired ? (
                  <Stack.Screen name="MainApp" component={MainTabNavigator} />
                ) : (
                  // Else -> Auth Flow
                  <>
                    <Stack.Screen name="Login" component={LoginScreen} />
                    <Stack.Screen name="Register" component={RegisterScreen} />
                  </>
                )
            ) : (
              <Stack.Screen name="Onboarding">
                {() => <Onboarding onComplete={handleOnboardingComplete} />}
              </Stack.Screen>
            )}
          </Stack.Navigator>
          <Toast />
        </NavigationContainer>
      </AppLockGate>
    </SafeAreaProvider>
  );
}

// Main App Component
export default function App() {
  return (
    <AppProvider>
      <AuthProvider>
        <ThemeProvider>
          <AppContent />
        </ThemeProvider>
      </AuthProvider>
    </AppProvider>
  );
}
