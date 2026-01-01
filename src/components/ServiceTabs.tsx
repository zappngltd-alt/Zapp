import React, { useState, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  FlatList,
  ScrollView,
  Alert,
  Share,
  Modal,
} from "react-native";
import { MaterialIcons as Icon } from "@expo/vector-icons";
import Toast from "react-native-toast-message";
import { useTranslation } from "react-i18next";
import { useTheme } from "../contexts/ThemeContext";
import * as Haptics from "expo-haptics";
import {
  getServicesByCategory,
  SearchableService,
} from "../data/services-data";
import { getLogo } from "../data/logos";
import BrandLogo from "./BrandLogo";
import InputModal from "./InputModal";
import AddServiceModal from "./AddServiceModal";
import { useApp } from "./AppContext";

interface ServiceTabsProps {
  selectedSim: "sim1" | "sim2";
  onDial: (
    code: string,
    serviceName?: string,
    provider?: string,
    category?: string,
    logo?: string
  ) => void;
  headerComponent?: React.ReactNode;
  footerComponent?: React.ReactNode;
}

export default function ServiceTabs({ selectedSim, onDial, headerComponent, footerComponent }: ServiceTabsProps) {
  const { t } = useTranslation();
  const { colors, theme } = useTheme();
  const { 
    favorites, addFavorite, removeFavorite, isFavorite,
    customServices, addCustomService, updateCustomService, deleteCustomService 
  } = useApp();

  const [activeCategory, setActiveCategory] = useState("bank");
  const [activeSubCategory, setActiveSubCategory] = useState("transfers");
  const [selectedProvider, setSelectedProvider] = useState<string | null>(null);
  const [inputModalVisible, setInputModalVisible] = useState(false);
  const [selectedServiceForInput, setSelectedServiceForInput] =
    useState<SearchableService | null>(null);
  
  // State for adding/editing services
  const [addModalVisible, setAddModalVisible] = useState(false);
  const [editingService, setEditingService] = useState<SearchableService | null>(null);
  
  // State for the "More" menu
  const [menuVisible, setMenuVisible] = useState(false);
  const [selectedServiceForMenu, setSelectedServiceForMenu] = useState<SearchableService | null>(null);

  // Memoized categories and subcategories for i18n
  const categories = useMemo(() => [
    {
      key: "bank",
      label: t('serviceTabs.categories.bank'),
      icon: "account-balance" as keyof typeof Icon.glyphMap,
    },
    {
      key: "telecom",
      label: t('serviceTabs.categories.telecom'),
      icon: "phone" as keyof typeof Icon.glyphMap,
    },
    {
      key: "momo",
      label: t('serviceTabs.categories.momo'),
      icon: "account-balance-wallet" as keyof typeof Icon.glyphMap,
    },
    {
      key: "general",
      label: t('serviceTabs.categories.general'),
      icon: "dashboard" as keyof typeof Icon.glyphMap,
    },
    {
      key: "custom",
      label: t('serviceTabs.categories.custom'),
      icon: "code" as keyof typeof Icon.glyphMap,
    },
  ], [t]);

  const bankSubCategories = useMemo(() => [
    {
      key: "transfers",
      label: t('serviceTabs.subCategories.transfers'),
      icon: "swap-horiz" as keyof typeof Icon.glyphMap,
    },
    {
      key: "airtime",
      label: t('serviceTabs.subCategories.airtime'),
      icon: "phone-android" as keyof typeof Icon.glyphMap,
    },
    {
      key: "utilities",
      label: t('serviceTabs.subCategories.utilities'),
      icon: "receipt" as keyof typeof Icon.glyphMap,
    },
    {
      key: "other",
      label: t('serviceTabs.subCategories.other'),
      icon: "more-horiz" as keyof typeof Icon.glyphMap,
    },
  ], [t]);

  const telecomSubCategories = useMemo(() => [
    {
      key: "recharge",
      label: t('serviceTabs.subCategories.recharge'),
      icon: "flash-on" as keyof typeof Icon.glyphMap,
    },
    {
      key: "data",
      label: t('serviceTabs.subCategories.data'),
      icon: "wifi" as keyof typeof Icon.glyphMap,
    },
    {
      key: "balance",
      label: t('serviceTabs.subCategories.balance'),
      icon: "account-balance-wallet" as keyof typeof Icon.glyphMap,
    },
    {
      key: "borrow",
      label: t('serviceTabs.subCategories.borrow'),
      icon: "credit-card" as keyof typeof Icon.glyphMap,
    },
    {
      key: "transfer",
      label: t('serviceTabs.subCategories.transfer'),
      icon: "send" as keyof typeof Icon.glyphMap,
    },
    {
      key: "support",
      label: t('serviceTabs.subCategories.support'),
      icon: "headset-mic" as keyof typeof Icon.glyphMap,
    },
  ], [t]);

  const momoSubCategories = useMemo(() => [
    {
      key: "transfer",
      label: t('serviceTabs.subCategories.transfer'),
      icon: "send" as keyof typeof Icon.glyphMap,
    },
    {
      key: "withdraw",
      label: t('serviceTabs.subCategories.withdraw'),
      icon: "atm" as keyof typeof Icon.glyphMap,
    },
    {
      key: "bills",
      label: t('serviceTabs.subCategories.bills'),
      icon: "receipt" as keyof typeof Icon.glyphMap,
    },
    {
      key: "airtime",
      label: t('serviceTabs.subCategories.airtime'),
      icon: "phone-android" as keyof typeof Icon.glyphMap,
    },
    {
      key: "balance",
      label: t('serviceTabs.subCategories.balance'),
      icon: "account-balance-wallet" as keyof typeof Icon.glyphMap,
    },
  ], [t]);

  const generalSubCategories = useMemo(() => [
    {
      key: "emergency",
      label: t('serviceTabs.subCategories.emergency'),
      icon: "warning" as keyof typeof Icon.glyphMap,
    },
    {
      key: "power",
      label: t('serviceTabs.subCategories.power'),
      icon: "lightbulb" as keyof typeof Icon.glyphMap,
    },
    {
      key: "education",
      label: t('serviceTabs.subCategories.education'),
      icon: "school" as keyof typeof Icon.glyphMap,
    },
    {
      key: "nin",
      label: t('serviceTabs.subCategories.nin'),
      icon: "fingerprint" as keyof typeof Icon.glyphMap,
    },
  ], [t]);

  const handleToggleFavorite = async (item: SearchableService) => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    const favorite = isFavorite(item.code, item.provider);
    
    if (favorite) {
      // Find the favorite id
      const favObj = favorites.find(f => f.code === item.code && f.provider === item.provider);
      if (favObj) removeFavorite(favObj.id);
    } else {
      addFavorite({
        provider: item.provider,
        serviceName: item.serviceName,
        code: item.code,
        category: item.category,
        logo: item.logo
      });
    }
    
    // Show feedback toast
    Toast.show({
      type: "success",
      text1: favorite ? t('serviceTabs.menu.favoriteRemove') : t('serviceTabs.menu.favoriteAdd'),
      text2: item.code,
      visibilityTime: 2000,
      position: "bottom",
    });
  };

  const handleShareCode = async (item: SearchableService) => {
    try {
      await Share.share({
        message: t('serviceTabs.shareMessage', {
          serviceName: item.serviceName,
          code: item.code,
          provider: item.provider ? `Provider: ${item.provider}` : ''
        }),
        title: item.serviceName,
      });
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  // Scroll preservation
  const flatListRef = React.useRef<FlatList>(null);
  const scrollOffset = React.useRef(0);

  const handleScroll = (event: any) => {
    scrollOffset.current = event.nativeEvent.contentOffset.y;
  };

  const restoreScrollPosition = () => {
    if (scrollOffset.current > 0) {
      setTimeout(() => {
        flatListRef.current?.scrollToOffset({
          offset: scrollOffset.current,
          animated: false,
        });
      }, 50);
    }
  };

  React.useEffect(() => {
    restoreScrollPosition();
  }, [activeCategory, activeSubCategory]);


  // Get current sub-categories based on active category
  const currentSubCategories = useMemo(() => {
    switch (activeCategory) {
      case "bank": return bankSubCategories;
      case "telecom": return telecomSubCategories;
      case "momo": return momoSubCategories;
      case "general": return generalSubCategories;
      default: return [];
    }
  }, [activeCategory, bankSubCategories, telecomSubCategories, momoSubCategories, generalSubCategories]);

  // Get all services for the active category
  const services = activeCategory === 'custom' 
    ? customServices 
    : getServicesByCategory(activeCategory as any);

  // Extract unique providers
  const uniqueProviders = Array.from(
    new Set(services.map((s) => s.provider))
  ).map((providerName) => {
    const service = services.find((s) => s.provider === providerName);
    return {
      name: providerName,
      category: service?.category || "bank",
      icon: service?.icon,
    };
  });

  // Filter services for the selected provider
  const providerServices = selectedProvider
    ? services.filter((s) => s.provider === selectedProvider)
    : [];

  // Reset selected provider and sub-category when category changes
  const handleCategoryChange = (category: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setActiveCategory(category);
    setSelectedProvider(null);
    
    // Set default sub-category for the new category
    if (category === "bank") setActiveSubCategory("transfers");
    else if (category === "telecom") setActiveSubCategory("recharge");
    else if (category === "momo") setActiveSubCategory("transfer");
    else setActiveSubCategory("");
  };

  const handleServicePress = (item: SearchableService) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    if (item.requiresInput) {
      setSelectedServiceForInput(item);
      setInputModalVisible(true);
    } else {
      onDial(
        item.code,
        item.serviceName,
        item.provider,
        item.category,
        item.logo
      );
    }
  };

  const handleInputSubmit = (values: Record<string, string>) => {
    if (!selectedServiceForInput) return;

    let finalCode = selectedServiceForInput.code;
    Object.entries(values).forEach(([key, value]) => {
      finalCode = finalCode.replace(key, value);
    });

    onDial(
      finalCode,
      selectedServiceForInput.serviceName,
      selectedServiceForInput.provider,
      selectedServiceForInput.category,
      selectedServiceForInput.logo
    );
    setSelectedServiceForInput(null);
  };

  const handleEditService = (service: SearchableService) => {
    setEditingService(service);
    setAddModalVisible(true);
  };

  const handleDeleteService = (service: SearchableService) => {
    Alert.alert(
      t('serviceTabs.menu.deleteTitle'),
      t('serviceTabs.menu.deleteMessage', { serviceName: service.serviceName }),
      [
        { text: t('serviceTabs.menu.cancel'), style: "cancel" },
        {
          text: t('serviceTabs.menu.deleteConfirm'),
          style: "destructive",
          onPress: () => service.id && deleteCustomService(service.id),
        },
      ]
    );
  };

  const handleAddEditSubmit = async (service: Omit<SearchableService, 'category' | 'logo'>) => {
    if (editingService && editingService.id) {
      await updateCustomService({ ...service, category: 'custom', logo: '👤', id: editingService.id });
    } else {
      await addCustomService(service);
    }
    setEditingService(null);
  };

  const openMenu = (service: SearchableService) => {
    setSelectedServiceForMenu(service);
    setMenuVisible(true);
  };

  const closeMenu = () => {
    setMenuVisible(false);
    setSelectedServiceForMenu(null);
  };

  const handleMenuAction = (action: 'share' | 'favorite' | 'edit' | 'delete') => {
    if (!selectedServiceForMenu) return;

    switch (action) {
      case 'share':
        handleShareCode(selectedServiceForMenu);
        break;
      case 'favorite':
        handleToggleFavorite(selectedServiceForMenu);
        break;
      case 'edit':
        handleEditService(selectedServiceForMenu);
        break;
      case 'delete':
        handleDeleteService(selectedServiceForMenu);
        break;
    }
    closeMenu();
  };

  const renderServiceItem = ({ item }: { item: SearchableService }) => {
    const favorite = isFavorite(item.code, item.provider);
    
    return (
      <Pressable
        style={({ pressed }) => [
          styles.serviceCard,
          { backgroundColor: colors.surface, borderColor: theme === 'dark' ? colors.border : '#f3f4f6' },
          pressed && { backgroundColor: theme === 'dark' ? colors.border : '#f9fafb' },
        ]}
        onPress={() => handleServicePress(item)}
      >
        <View style={styles.serviceInfo}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            {item.icon && (
               <Icon name={item.icon as any} size={20} color={colors.textSecondary} />
            )}
            <View>
              <Text style={[styles.serviceName, { color: colors.text }]}>{item.serviceName}</Text>
              <Text style={[styles.serviceCode, { color: colors.textSecondary, backgroundColor: theme === 'dark' ? colors.border : '#f3f4f6' }]}>{item.code}</Text>
            </View>
          </View>
        </View>
        <View style={styles.serviceActions}>
          {favorite && (
            <Icon name="star" size={16} color="#f59e0b" style={{ marginRight: 4 }} />
          )}

          <Pressable
            style={[styles.actionButton, { backgroundColor: theme === 'dark' ? colors.border : '#f3f4f6' }]}
            onPress={() => openMenu(item)}
          >
            <Icon name="more-vert" size={20} color={colors.textSecondary} />
          </Pressable>

          <View style={[styles.serviceIconContainer, { backgroundColor: theme === 'dark' ? 'rgba(16, 185, 129, 0.2)' : '#ecfdf5' }]}>
            <Icon name="call" size={20} color="#10b981" />
          </View>
        </View>
      </Pressable>
    );
  };

  const renderProviderItem = ({
    item,
    index,
  }: {
    item: { name: string; category: string; icon?: string };
    index: number;
  }) => {
    const logo = getLogo(item.name, item.category as any);
    return (
      <Pressable
        style={({ pressed }) => [
          styles.providerCard,
          { backgroundColor: colors.surface, borderColor: theme === 'dark' ? colors.border : '#f3f4f6' },
          pressed && { backgroundColor: theme === 'dark' ? colors.border : '#f9fafb' },
        ]}
        onPress={() => {
          setSelectedProvider(item.name);
          if (activeCategory === "bank") setActiveSubCategory("transfers");
          else if (activeCategory === "telecom") setActiveSubCategory("recharge");
          else if (activeCategory === "momo") setActiveSubCategory("transfer");
        }}
      >
        {item.icon ? (
          <View style={{ 
            width: 48, 
            height: 48, 
            borderRadius: 24, 
            backgroundColor: theme === 'dark' ? colors.border : '#f3f4f6', 
            alignItems: 'center', 
            justifyContent: 'center',
            marginBottom: 8
          }}>
            <Icon name={item.icon as any} size={28} color={colors.textSecondary} />
          </View>
        ) : (
          <BrandLogo
            name={item.name}
            abbr={logo.fallbackAbbr}
            colors={logo.colors}
            size="lg"
          />
        )}
        <Text style={[styles.providerCardName, { color: colors.text }]} numberOfLines={2}>
          {item.name}
        </Text>
        <View style={[styles.providerCardArrow, { backgroundColor: theme === 'dark' ? colors.border : '#f3f4f6' }]}>
          <Icon name="chevron-right" size={16} color={colors.textSecondary} />
        </View>
      </Pressable>
    );
  };

  const renderMainHeader = () => (
    <View>
      {headerComponent}
      <Text style={[styles.title, { color: colors.text }]}>{t('serviceTabs.title')}</Text>

      <View style={styles.tabsContainer}>
        {categories.map((category) => (
          <Pressable
            key={category.key}
            style={[
              styles.tabButton,
              { backgroundColor: theme === 'dark' ? colors.border : '#f3f4f6' },
              activeCategory === category.key && styles.tabButtonActive,
            ]}
            onPress={() => handleCategoryChange(category.key)}
          >
            <Icon
              name={category.icon}
              size={24}
              color={activeCategory === category.key ? "#10b981" : colors.textSecondary}
            />
            <Text
              style={[
                styles.tabText,
                { color: colors.textSecondary },
                activeCategory === category.key && styles.tabTextActive,
              ]}
            >
              {category.label}
            </Text>
          </Pressable>
        ))}
      </View>
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.contentArea}>
        {!selectedProvider ? (
          <FlatList
            ref={flatListRef}
            onScroll={handleScroll}
            scrollEventThrottle={16}
            data={uniqueProviders}
            keyExtractor={(item) => item.name}
            renderItem={renderProviderItem}
            numColumns={2}
            columnWrapperStyle={styles.gridRow}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.gridContent}
            ListHeaderComponent={renderMainHeader}
            ListFooterComponent={footerComponent ? <View>{footerComponent}</View> : null}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Icon name="info" size={48} color={theme === 'dark' ? colors.border : "#d1d5db"} />
                <Text style={[styles.emptyText, { color: colors.textSecondary }]}>{t('serviceTabs.noProviders')}</Text>
              </View>
            }
          />
        ) : (
          <View style={[styles.servicesContainer, { backgroundColor: theme === 'dark' ?  colors.background : '#f9fafb' }]}>
            <FlatList
              ref={flatListRef}
              onScroll={handleScroll}
              scrollEventThrottle={16}
              data={currentSubCategories.length > 0 && activeCategory !== 'general'
                ? providerServices.filter(s => (s.subCategory || "other") === activeSubCategory)
                : providerServices
              }
              keyExtractor={(item) => `${item.provider}-${item.code}`}
              renderItem={renderServiceItem}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.serviceListContent}
              ListHeaderComponent={
                <View>
                  {renderMainHeader()}
                  <View style={[styles.providerHeader, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
                    <Pressable
                      style={styles.backButton}
                      onPress={() => {
                        setSelectedProvider(null);
                      }}
                    >
                      <View style={[styles.backButtonIcon, { backgroundColor: theme === 'dark' ? colors.border : '#f3f4f6' }]}>
                        <Icon name="arrow-back" size={20} color={colors.text} />
                      </View>
                      <Text style={[styles.backButtonText, { color: colors.text }]}>
                        {t('serviceTabs.back')}
                      </Text>
                    </Pressable>
                    
                    <View style={styles.headerTitleContainer}>
                       <Text style={[styles.headerTitle, { color: colors.text }]}>{selectedProvider}</Text>
                       <Text style={[styles.headerSubtitle, { color: colors.textSecondary }]}>
                         {t('serviceTabs.servicesAvailable', { count: providerServices.length })}
                       </Text>
                    </View>
                    
                    <View style={{ width: 40 }} />
                  </View>
      
                  {currentSubCategories.length > 0 && activeCategory !== 'general' && (
                    <View style={[styles.subTabsContainer, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
                      <ScrollView 
                        horizontal 
                        showsHorizontalScrollIndicator={false}
                        contentContainerStyle={styles.subTabsContent}
                      >
                        {currentSubCategories.map((subCat) => (
                          <Pressable
                            key={subCat.key}
                            style={[
                              styles.subTabButton,
                              { backgroundColor: theme === 'dark' ? colors.border : '#f3f4f6', borderColor: theme === 'dark' ? colors.border : '#e5e7eb' },
                              activeSubCategory === subCat.key && styles.subTabButtonActive,
                            ]}
                            onPress={() => setActiveSubCategory(subCat.key)}
                          >
                            <Icon
                              name={subCat.icon}
                              size={18}
                              color={activeSubCategory === subCat.key ? "#ffffff" : colors.textSecondary}
                            />
                            <Text
                              style={[
                                styles.subTabText,
                                { color: colors.textSecondary },
                                activeSubCategory === subCat.key && styles.subTabTextActive,
                              ]}
                            >
                              {subCat.label}
                            </Text>
                          </Pressable>
                        ))}
                      </ScrollView>
                    </View>
                  )}
                </View>
              }
              ListFooterComponent={footerComponent ? <View>{footerComponent}</View> : null}
              ListEmptyComponent={
                <View style={styles.emptyContainer}>
                  <Icon name="search-off" size={48} color={theme === 'dark' ? colors.border : "#e5e7eb"} />
                  <Text style={[styles.emptyText, { color: colors.text }]}>
                    {t('serviceTabs.noServices', { category: currentSubCategories.find(c => c.key === activeSubCategory)?.label })}
                  </Text>
                  <Text style={[styles.emptySubText, { color: colors.textSecondary }]}>
                    {t('serviceTabs.checkOthers')}
                  </Text>
                </View>
              }
            />
          </View>
        )}
      </View>

      <InputModal
        visible={inputModalVisible}
        onClose={() => setInputModalVisible(false)}
        onSubmit={handleInputSubmit}
        serviceName={selectedServiceForInput?.serviceName || ""}
        fields={selectedServiceForInput?.requiresInput?.fields || []}
      />

      <AddServiceModal
        visible={addModalVisible}
        onClose={() => {
          setAddModalVisible(false);
          setEditingService(null);
        }}
        onSubmit={handleAddEditSubmit}
        initialValues={editingService}
      />

      <Modal
        visible={menuVisible}
        transparent
        animationType="fade"
        onRequestClose={closeMenu}
      >
        <Pressable style={styles.menuBackdrop} onPress={closeMenu}>
          <View style={styles.menuContainer}>
            <View style={[styles.menuContent, { backgroundColor: colors.surface }]}>
              <Text style={[styles.menuTitle, { color: colors.textSecondary, borderBottomColor: colors.border }]}>
                {selectedServiceForMenu?.serviceName}
              </Text>
              
              <Pressable 
                style={[styles.menuItem, { borderBottomColor: colors.border }]} 
                onPress={() => handleMenuAction('share')}
              >
                <View style={[styles.menuIconContainer, { backgroundColor: '#e0e7ff' }]}>
                  <Icon name="share" size={20} color="#6366f1" />
                </View>
                <Text style={[styles.menuItemText, { color: colors.text }]}>{t('serviceTabs.menu.share')}</Text>
              </Pressable>

              <Pressable 
                style={[styles.menuItem, { borderBottomColor: colors.border }]} 
                onPress={() => handleMenuAction('favorite')}
              >
                <View style={[styles.menuIconContainer, { backgroundColor: '#fef3c7' }]}>
                  <Icon 
                    name={isFavorite(selectedServiceForMenu?.code || '', selectedServiceForMenu?.provider || '') ? "star" : "star-border"} 
                    size={20} 
                    color="#f59e0b" 
                  />
                </View>
                <Text style={[styles.menuItemText, { color: colors.text }]}>
                  {isFavorite(selectedServiceForMenu?.code || '', selectedServiceForMenu?.provider || '') ? t('serviceTabs.menu.favoriteRemove') : t('serviceTabs.menu.favoriteAdd')}
                </Text>
              </Pressable>

              {activeCategory === 'custom' && (
                <>
                  <Pressable 
                    style={[styles.menuItem, { borderBottomColor: colors.border }]} 
                    onPress={() => handleMenuAction('edit')}
                  >
                    <View style={[styles.menuIconContainer, { backgroundColor: '#dbeafe' }]}>
                      <Icon name="edit" size={20} color="#3b82f6" />
                    </View>
                    <Text style={[styles.menuItemText, { color: colors.text }]}>{t('serviceTabs.menu.edit')}</Text>
                  </Pressable>

                  <Pressable 
                    style={[styles.menuItem, { borderBottomColor: colors.border }]} 
                    onPress={() => handleMenuAction('delete')}
                  >
                    <View style={[styles.menuIconContainer, { backgroundColor: '#fee2e2' }]}>
                      <Icon name="delete" size={20} color="#ef4444" />
                    </View>
                    <Text style={[styles.menuItemText, { color: '#ef4444' }]}>{t('serviceTabs.menu.delete')}</Text>
                  </Pressable>
                </>
              )}
            </View>
            
            <Pressable style={[styles.menuCancelButton, { backgroundColor: colors.surface }]} onPress={closeMenu}>
              <Text style={styles.menuCancelText}>{t('serviceTabs.menu.cancel')}</Text>
            </Pressable>
          </View>
        </Pressable>
      </Modal>

      {activeCategory === 'custom' && !selectedProvider && (
        <Pressable
          style={styles.fab}
          onPress={() => setAddModalVisible(true)}
        >
          <Icon name="add" size={28} color="#ffffff" />
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#ffffff",
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    color: "#1f2937",
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 12,
  },
  tabsContainer: {
    flexDirection: "row",
    paddingHorizontal: 12,
    paddingVertical: 8,
    gap: 8,
  },
  tabButton: {
    flex: 1,
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: 12,
    backgroundColor: "#f3f4f6",
  },
  tabButtonActive: {
    backgroundColor: "#d1fae5",
  },
  tabText: {
    fontSize: 12,
    fontWeight: "500",
    color: "#6b7280",
    marginTop: 4,
    textAlign: "center",
  },
  tabTextActive: {
    color: "#10b981",
    fontWeight: "600",
  },
  contentArea: {
    flex: 1,
    paddingTop: 8,
  },
  // Provider Grid Styles
  gridContent: {
    padding: 12,
  },
  gridRow: {
    gap: 12,
    marginBottom: 12,
  },
  providerCard: {
    flex: 1,
    backgroundColor: "#ffffff",
    borderRadius: 16,
    padding: 16,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 1,
    borderColor: "#f3f4f6",
    minHeight: 140,
    justifyContent: "space-between",
  },
  providerCardName: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1f2937",
    textAlign: "center",
    marginTop: 12,
    lineHeight: 18,
  },
  providerCardArrow: {
    marginTop: 8,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "#f3f4f6",
    alignItems: "center",
    justifyContent: "center",
  },
  // Provider Header Styles
  providerHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: "#ffffff",
    borderBottomWidth: 1,
    borderBottomColor: "#f3f4f6",
  },
  backButton: {
    flexDirection: "row",
    alignItems: "center",
  },
  backButtonIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#f3f4f6",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 8,
  },
  backButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1f2937",
  },
  headerTitleContainer: {
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1f2937",
  },
  headerSubtitle: {
    fontSize: 12,
    color: "#6b7280",
    marginTop: 2,
  },
  
  // Sub-Category Tabs Styles
  subTabsContainer: {
    backgroundColor: "#ffffff",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f3f4f6",
  },
  subTabsContent: {
    paddingHorizontal: 16,
    gap: 8,
  },
  subTabButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: "#f3f4f6",
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  subTabButtonActive: {
    backgroundColor: "#1f2937", // Dark theme for active tab
    borderColor: "#1f2937",
  },
  subTabText: {
    fontSize: 13,
    fontWeight: "500",
    color: "#4b5563",
    marginLeft: 6,
  },
  subTabTextActive: {
    color: "#ffffff",
    fontWeight: "600",
  },

  // Service List Styles
  servicesContainer: {
    flex: 1,
    backgroundColor: "#f9fafb", // Light gray background for list
  },
  serviceListContent: {
    padding: 16,
  },
  serviceCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
    backgroundColor: "#ffffff",
    borderRadius: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    borderWidth: 1,
    borderColor: "#f3f4f6",
  },
  serviceInfo: {
    flex: 1,
    marginRight: 16,
  },
  serviceName: {
    fontSize: 15,
    fontWeight: "600",
    color: "#1f2937",
    marginBottom: 4,
    lineHeight: 20,
  },
  serviceCode: {
    fontSize: 13,
    color: "#6b7280",
    fontFamily: "monospace",
    backgroundColor: "#f3f4f6",
    alignSelf: "flex-start",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    overflow: "hidden",
  },
  serviceIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#ecfdf5",
    alignItems: "center",
    justifyContent: "center",
  },
  serviceActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  actionButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#f3f4f6",
    alignItems: "center",
    justifyContent: "center",
  },
  fab: {
    position: "absolute",
    bottom: 24,
    right: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#10b981",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  emptyContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 64,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#374151",
    marginTop: 16,
  },
  emptySubText: {
    fontSize: 14,
    color: "#9ca3af",
    marginTop: 4,
  },
  // Menu Styles
  menuBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  menuContainer: {
    padding: 16,
    paddingBottom: 32,
  },
  menuContent: {
    backgroundColor: "white",
    borderRadius: 16,
    overflow: "hidden",
    marginBottom: 12,
  },
  menuTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#6b7280",
    textAlign: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f3f4f6",
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#f3f4f6",
  },
  menuIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  menuItemText: {
    fontSize: 16,
    fontWeight: "500",
    color: "#1f2937",
  },
  menuCancelButton: {
    backgroundColor: "white",
    padding: 16,
    borderRadius: 16,
    alignItems: "center",
  },
  menuCancelText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#ef4444",
  },
});
