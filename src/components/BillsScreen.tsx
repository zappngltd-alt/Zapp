import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Dimensions,
  Platform,
  Modal,
  TextInput,
  Alert,
  ActivityIndicator,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { MaterialIcons as Icon } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
import { useTheme } from "../contexts/ThemeContext";
import { LinearGradient } from "expo-linear-gradient";
import BillsHistory from "./BillsHistory";
import PaymentWebView from "./PaymentWebView";
import { collection, doc, onSnapshot, query, where, getDocs } from "@react-native-firebase/firestore";
import { callFunction, firebaseFirestore, firebaseAuth, ensureAuth } from "../services/firebase";
import { FINTECH_PROVIDERS, DATA_PLANS, FintechProduct, FintechProvider } from "../data/fintech-products";

const { width, height } = Dimensions.get("window");

export default function BillsScreen() {
  const { t } = useTranslation();
  const { colors, theme } = useTheme();
  const insets = useSafeAreaInsets();

  // Selection State
  const [selectedCategory, setSelectedCategory] = React.useState<string | null>(null);
  const [selectedProduct, setSelectedProduct] = React.useState<FintechProduct | null>(null);
  const [selectedProvider, setSelectedProvider] = React.useState<FintechProvider | null>(null);
  const [selectionStep, setSelectionStep] = React.useState<"category" | "provider" | "details" | "checkout" | "success" | "failure" | "receipt" | "payment-details" | "processing" | "beneficiaries">("category");
  const [modalVisible, setModalVisible] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(false);
  const [showHistory, setShowHistory] = React.useState(false);
  const [meterNumber, setMeterNumber] = React.useState("");
  const [phoneNumber, setPhoneNumber] = React.useState("");
  const [amount, setAmount] = React.useState("");
  const [verifiedName, setVerifiedName] = React.useState("");
  const [paymentInfo, setPaymentInfo] = React.useState<any>(null);
  const [txRef, setTxRef] = React.useState<string | null>(null);
  const [transactionData, setTransactionData] = React.useState<any>(null);
  const [isVerifying, setIsVerifying] = React.useState(false);
  const [paymentMethod, setPaymentMethod] = React.useState<"transfer" | "card" | "ussd" | "mock">("transfer");
  const [showWebView, setShowWebView] = React.useState(false);
  const [checkoutUrl, setCheckoutUrl] = React.useState("");

  // New UI State
  const [electricityType, setElectricityType] = React.useState<"prepaid" | "postpaid">("prepaid");
  const [planFilter, setPlanFilter] = React.useState("HOT");
  
  // Dynamic Plans State
  const [dataPlans, setDataPlans] = React.useState<FintechProduct[]>([]);
  const [isLoadingPlans, setIsLoadingPlans] = React.useState(false);

  // Beneficiaries State
  const [beneficiaries, setBeneficiaries] = React.useState<any[]>([]);
  const [isLoadingBeneficiaries, setIsLoadingBeneficiaries] = React.useState(false);

  // Fetch Beneficiaries
  const fetchBeneficiaries = async () => {
    let user = firebaseAuth().currentUser;
    if (!user) {
      user = await ensureAuth();
    }
    
    if (!user || !selectedCategory) return;

    setIsLoadingBeneficiaries(true);
    try {
      const q = query(
        collection(firebaseFirestore(), "beneficiaries"),
        where("uid", "==", user.uid),
        where("category", "==", selectedCategory)
      );
      const querySnapshot = await getDocs(q);
      const list = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setBeneficiaries(list);
    } catch (e: any) {
      console.error("Fetch Beneficiaries Error:", e.message);
    } finally {
      setIsLoadingBeneficiaries(false);
    }
  };

  const handleSelectBeneficiary = (b: any) => {
    if (selectedCategory === "electricity" || selectedCategory === "tv") {
      setMeterNumber(b.recipient);
    } else {
      setPhoneNumber(b.recipient);
    }
    
    // Auto-select provider if it matches
    const provider = FINTECH_PROVIDERS.find(p => p.id === b.providerId);
    if (provider) {
      setSelectedProvider(provider);
      if (selectedCategory === 'data' || selectedCategory === 'tv') {
        loadPlans(provider);
      }
    }
    
    setSelectionStep("details");
  };

  const [isSavingBeneficiary, setIsSavingBeneficiary] = React.useState(false);
  const [beneficiarySaved, setBeneficiarySaved] = React.useState(false);

  const handleSaveBeneficiary = async () => {
    let user = firebaseAuth().currentUser;
    if (!user) {
      user = await ensureAuth();
    }
    
    if (!user || !selectedCategory) {
      Alert.alert("Error", "Authentication failed. Please try again.");
      return;
    };
    
    setIsSavingBeneficiary(true);
    try {
      const bData = {
        uid: user.uid,
        name: selectedCategory === "electricity" ? `Meter ${meterNumber}` : 
              selectedCategory === "tv" ? `SmartCard ${meterNumber}` : `Phone ${phoneNumber}`, 
        recipient: selectedCategory === "electricity" || selectedCategory === "tv" ? meterNumber : phoneNumber,
        category: selectedCategory,
        providerId: selectedProvider?.id,
        providerName: selectedProvider?.name,
        createdAt: new Date(),
      };
      
      const { firebaseFirestore } = await import("../services/firebase");
      const { addDoc, collection } = await import("@react-native-firebase/firestore");
      
      // Using the direct firestore() for simplicity if the modular one is tricky in this context
      await firebaseFirestore().collection("beneficiaries").add(bData);
      
      setBeneficiarySaved(true);
      Alert.alert("Success", "Beneficiary saved successfully!");
      fetchBeneficiaries(); 
    } catch (e: any) {
      Alert.alert("Error", e.message);
    } finally {
      setIsSavingBeneficiary(false);
    }
  };

  React.useEffect(() => {
    if (modalVisible && selectedCategory) {
      fetchBeneficiaries();
    }
  }, [selectedCategory, modalVisible]);

  const categories = [
    {
      id: "data",
      title: "Cheap Data",
      icon: "wifi",
      color: "#3b82f6",
      gradient: ["#3b82f6", "#2563eb"],
      tag: "HOT",
    },
    {
      id: "airtime",
      title: "Airtime",
      icon: "phone-android",
      color: "#10b981",
      gradient: ["#10b981", "#059669"],
    },
    {
      id: "electricity",
      title: "Electricity",
      icon: "lightbulb",
      color: "#f59e0b",
      gradient: ["#f59e0b", "#d97706"],
    },
    {
      id: "tv",
      title: "Cable TV",
      icon: "tv",
      color: "#8b5cf6",
      gradient: ["#8b5cf6", "#7c3aed"],
    },
  ];

  // Hot Deals State
  const [hotDeals, setHotDeals] = React.useState<any[]>([]);
  const [isLoadingDeals, setIsLoadingDeals] = React.useState(false);

  const fetchHotDeals = async () => {
    setIsLoadingDeals(true);
    try {
      const result = await callFunction("getHotDeals", {}) as any;
      if (result.success && result.deals) {
        setHotDeals(result.deals);
      }
    } catch (e: any) {
      console.warn("Fetch Hot Deals Error:", e.message);
    } finally {
      setIsLoadingDeals(false);
    }
  };

  React.useEffect(() => {
    fetchHotDeals();
  }, []);

  const handleCategoryPress = (id: string) => {
    setSelectedCategory(id);
    setSelectionStep("provider");
    setModalVisible(true);
  };

  const loadPlans = async (provider: FintechProvider) => {
    if (provider.category === 'data') {
      setIsLoadingPlans(true);
      setDataPlans([]); // Clear previous
      try {
        const result = await callFunction("getDataPlans", { provider: provider.id }) as any;
        if (result.success && result.plans.length > 0) {
          setDataPlans(result.plans);
        } else {
          // Fallback to static
          setDataPlans(DATA_PLANS.filter(p => p.providerId === provider.id));
        }
      } catch (e: any) {
        console.warn("Fetch Plans Error (using fallback):", e.message || e);
        setDataPlans(DATA_PLANS.filter(p => p.providerId === provider.id));
      } finally {
        setIsLoadingPlans(false);
      }
    } else {
      // For TV or others, use static for now
      setDataPlans(DATA_PLANS.filter(p => p.providerId === provider.id));
    }
  };

  const handleDealPress = (deal: any) => {
    setSelectedProduct({
      id: deal.id,
      name: deal.plan,
      price: parseInt(deal.price.replace("₦", "").replace(",", "")),
      category: "data",
      providerId: deal.provider.toLowerCase(),
    });
    setSelectedProvider(FINTECH_PROVIDERS.find(p => p.id === deal.provider.toLowerCase()) || null);
    setSelectedCategory("data");
    setSelectionStep("details");
    setModalVisible(true);
  };

  const handleValidate = () => {
    setIsLoading(true);
    // Simulate API Verification
    setTimeout(() => {
      setIsLoading(false);
      setVerifiedName(selectedCategory === "electricity" ? "RASHEED ADEBAYO (Prepaid)" : "");
      setSelectionStep("checkout");
    }, 1500);
  };

  const handlePay = async () => {
    setIsLoading(true);
    setIsVerifying(false); // Reset gate for new attempt
    try {
      const payAmount = selectedProduct ? selectedProduct.price : parseInt(amount);
      const result = await callFunction("initPayment", {
        category: selectedCategory,
        amount: payAmount,
        paymentMethod,
        details: {
          phone: phoneNumber,
          meter: meterNumber,
          network: selectedProvider?.name || "Unknown",
          productId: selectedProduct?.id,
        },
        provider: selectedProvider?.name || "Zapp",
      }) as any;

      if (result.success) {
        if (paymentMethod === 'mock') {
            console.log("[BillsScreen] MOCK MODE: Triggering instant bypass...");
            setTxRef(result.txRef);
            setSelectionStep("payment-details"); // Go to details page
            setIsLoading(true);
            try {
              // Directly mark as PAID on server
              await callFunction("confirmMockPayment", { txRef: result.txRef });
            } catch (e) {
               console.error("Mock bypass failed:", e);
               setIsLoading(false);
            }
        } else if (result.isWebView) {
          setCheckoutUrl(result.checkoutUrl);
          setTxRef(result.txRef);
          setShowWebView(true);
        } else {
          setPaymentInfo(result.paymentDetails);
          setTxRef(result.txRef);
          setSelectionStep("payment-details");
        }
      }
    } catch (error: any) {
      console.error("Payment Init Error:", error);
      Alert.alert(
        "Connection Error",
        `Could not reach the server (${error?.message || 'Unknown error'}).\n\n1. Ensure phone is on same Wi-Fi.\n2. PC IP: 192.168.56.134\n3. Check Firewall.`
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleShowReceipt = () => {
    setSelectionStep("receipt");
  };

  const resetFlow = () => {
    setModalVisible(false);
    setSelectedCategory(null);
    setSelectedProduct(null);
    setSelectionStep("category");
    setMeterNumber("");
    setPhoneNumber("");
    setAmount("");
    setVerifiedName("");
    setTxRef(null);
    setPaymentInfo(null);
    setTransactionData(null);
    setSelectedProvider(null);
    setIsVerifying(false);
    setBeneficiarySaved(false);
  };

  const handleWebViewClose = async () => {
    setShowWebView(false);
    // If we have a txRef and we aren't already success/vended, check the status
    if (txRef && !["VENDED", "SUCCESS"].includes(transactionData?.status)) {
        console.log(`[BillsScreen] WebView closed. Checking status for: ${txRef}`);
        setIsLoading(true);
        setSelectionStep("processing");
        try {
            const result = await callFunction("verifyPayment", { txRef }) as any;
            if (result.success && result.status === "PAID") {
                console.log("[BillsScreen] Status check on Close: Payment detected!");
            } else {
                console.log("[BillsScreen] Status check on Close: Still unpaid or checking...");
                setTimeout(() => {
                    setSelectionStep(prev => {
                       if (prev === "processing" && (transactionData?.status === "UNPAID" || transactionData?.status === "PENDING" || !transactionData?.status)) {
                           setIsLoading(false);
                           return "checkout";
                       }
                       return prev;
                    });
                }, 3000);
            }
        } catch (e) {
            console.error("Status check error on close:", e);
            setSelectionStep("checkout");
            setIsLoading(false);
        }
    }
  };

  // Live Polling Effect
  React.useEffect(() => {
    if (!txRef || (selectionStep !== "payment-details" && selectionStep !== "processing")) return;

    console.log(`[Polling] Listening for transaction: ${txRef}`);
    
    // Subscribe to transaction status using MODULAR API
    const unsubscribe = onSnapshot(
      doc(collection(firebaseFirestore(), "transactions"), txRef),
      (snapshot) => {
        if (snapshot.exists) {
          const data = snapshot.data();
          if (!data) {
             console.warn(`[Status Listener] Document exists but data is NULL for ${txRef}`);
             return;
          }
          
          setTransactionData(data);
          const currentStatus = data.status;
          console.log(`[Status Listener] RECEIVED DATA for ${txRef}:`, JSON.stringify(data, null, 2));
          console.log(`[Status Listener] Detected Status: ${currentStatus}`);
          
          if (currentStatus === "PAID") {
            console.log("[Status Listener] Status is PAID. Waiting for Vending trigger...");
            setIsLoading(true); 
          } else if (currentStatus === "VENDED") {
            console.log("[Status Listener] Status is VENDED! Navigating to success.");
            setSelectionStep("success");
            setIsLoading(false);
            setIsVerifying(false);
          } else if (currentStatus === "FAILED" || currentStatus === "VENDING_FAILED" || currentStatus === "VENDING_ERROR") {
            console.error(`[Status Listener] Terminal Failure State: ${currentStatus}`, data.error);
            setIsLoading(false);
            setIsVerifying(false);
            setSelectionStep("failure");
          } else {
            console.log(`[Status Listener] Status is ${currentStatus}. No action taken.`);
          }
        }
      },
      (error) => {
        console.error("[Status Listener] Subscription error:", error);
      }
    );

    return () => unsubscribe();
  }, [txRef, selectionStep]);

  // Manual Verification Polling (Backup for Webhooks)
  React.useEffect(() => {
    if (!txRef || (selectionStep !== "payment-details" && selectionStep !== "processing") || transactionData?.status === "VENDED") return;

    const interval = setInterval(async () => {
      if (transactionData?.status === "UNPAID" || transactionData?.status === "PENDING" || !transactionData?.status) {
        console.log(`[Auto-Poll] Verifying payment for: ${txRef}`);
        try {
          await callFunction("verifyPayment", { txRef });
        } catch (e) {
          console.warn("[Auto-Poll] Verification check failed silently.");
        }
      }
    }, 15000); 

    return () => clearInterval(interval);
  }, [txRef, selectionStep, transactionData?.status]);

  if (showHistory) {
    return <BillsHistory onBack={() => setShowHistory(false)} />;
  }

  const renderModalContent = () => {
    switch (selectionStep) {
      case "provider":
        const filteredProviders = FINTECH_PROVIDERS.filter(p => p.category === selectedCategory);
        return (
            <View style={[styles.modalContent, { backgroundColor: colors.surface }]}>
            <View style={styles.dragHandle} />
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: colors.text }]}>
                {selectedCategory === "electricity" ? "Electricity" : 
                 selectedCategory === "data" ? "Mobile Data" : 
                 selectedCategory === "airtime" ? "Airtime" : "Cable TV"}
              </Text>
              <Pressable onPress={resetFlow}>
                <Icon name="close" size={24} color={colors.text} />
              </Pressable>
            </View>

            {/* Provider List Horizontal for cleaner look if many, or Grid */}
            <Text style={[styles.inputLabel, { color: colors.textSecondary, marginBottom: 12 }]}>Select Provider</Text>
            <View style={styles.providerGrid}>
              {filteredProviders.map((p, index) => (
                <Pressable 
                  key={`${p.id}-${index}`} 
                  style={({pressed}) => [
                    styles.providerBtn, 
                    { 
                      backgroundColor: colors.surface, 
                      borderColor: pressed ? colors.primary : colors.border,
                      transform: [{scale: pressed ? 0.98 : 1}]
                    }
                  ]}
                  onPress={() => {
                    setSelectedProvider(p);
                    loadPlans(p);
                    setSelectionStep("details");
                  }}
                >
                  <View style={[styles.providerLogoCircle, { backgroundColor: colors.background }]}>
                     {/* Use logic to show logo based on provider */}
                     <Icon 
                        name={selectedCategory === "electricity" ? "bolt" : selectedCategory === "tv" ? "tv" : "wifi"} 
                        size={24} 
                        color={p.id.includes('mtn') ? '#FDB913' : p.id.includes('airtel') ? '#E31D1A' : p.id.includes('glo') ? '#5EA329' : colors.primary} 
                     />
                  </View>
                  <Text style={[styles.providerName, { color: colors.text }]}>{p.name}</Text>
                </Pressable>
              ))}
            </View>
          </View>
        );

      case "details":
        const plansToDisplay = dataPlans.filter(p => {
          if (planFilter === "HOT") return true; // Show all plans
          
          const validity = p.validity?.toLowerCase() || '';
          const name = p.name.toLowerCase();
          
          if (planFilter === "Daily") {
            return validity.includes('day') && !validity.includes('days') || 
                   validity === '1 day' || 
                   name.includes('daily');
          }
          
          if (planFilter === "Weekly") {
            return validity.includes('7 day') || 
                   validity.includes('week') || 
                   name.includes('weekly');
          }
          
          if (planFilter === "Monthly") {
            return validity.includes('30 day') || 
                   validity.includes('month') || 
                   name.includes('monthly');
          }
          
          return true;
        });
        return (
          <View style={[styles.modalContent, { backgroundColor: colors.surface }]}>
            <View style={styles.dragHandle} />
            
            {/* Header with Back Button */}
            <View style={styles.modalHeader}>
              <View style={{flexDirection: 'row', alignItems: 'center', gap: 12}}>
                 <Pressable onPress={() => setSelectionStep("provider")}>
                  <Icon name="arrow-back" size={24} color={colors.text} />
                </Pressable>
                <Text style={[styles.modalTitle, { color: colors.text, fontSize: 18 }]}>
                  {selectedProvider?.name} {selectedCategory === "electricity" ? "" : ""}
                </Text>
              </View>
              {/* Optional: Add History Link here */}
            </View>

            <ScrollView horizontal={false} showsVerticalScrollIndicator={false} contentContainerStyle={{paddingBottom: 24}}>
              
              {/* Prepaid / Postpaid Toggle for Electricity */}
              {selectedCategory === "electricity" && (
                <View style={styles.toggleContainer}>
                  <Pressable 
                    style={[styles.toggleBtn, electricityType === 'prepaid' && { backgroundColor: '#d1fae5', borderColor: '#10b981' }]}
                    onPress={() => setElectricityType('prepaid')}
                  >
                    <Text style={[styles.toggleText, electricityType === 'prepaid' ? { color: '#059669', fontWeight: '700' } : { color: colors.textSecondary }]}>Prepaid</Text>
                    {electricityType === 'prepaid' && <View style={styles.activeCheck}><Icon name="check" size={12} color="white" /></View>}
                  </Pressable>
                   <Pressable 
                    style={[styles.toggleBtn, electricityType === 'postpaid' && { backgroundColor: '#d1fae5', borderColor: '#10b981' }]}
                    onPress={() => setElectricityType('postpaid')}
                  >
                    <Text style={[styles.toggleText, electricityType === 'postpaid' ? { color: '#059669', fontWeight: '700' } : { color: colors.textSecondary }]}>Postpaid</Text>
                     {electricityType === 'postpaid' && <View style={styles.activeCheck}><Icon name="check" size={12} color="white" /></View>}
                  </Pressable>
                </View>
              )}

              {/* Beneficiary Style Input Header */}
              <View style={styles.inputGroup}>
                <View style={{flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8}}>
                   <Text style={[styles.inputLabel, { color: colors.text, marginBottom: 0 }]}>
                    {selectedCategory === "electricity" ? "Meter / Account Number" : 
                     selectedCategory === "tv" ? "SmartCard Number" : "Phone Number"}
                  </Text>
                  <Pressable 
                    style={{flexDirection: 'row', alignItems: 'center'}}
                    onPress={() => setSelectionStep("beneficiaries")}
                  >
                    <Text style={{color: colors.textSecondary, fontSize: 12}}>Beneficiaries</Text>
                    <Icon name="chevron-right" size={16} color={colors.textSecondary}/>
                  </Pressable>
                </View>

                <View style={[styles.inputContainer, { backgroundColor: colors.background, borderColor: colors.border }]}>
                  <TextInput
                    style={[styles.inputField, { color: colors.text, marginLeft: 0 }]} // Adjust margin since no icon inside now
                    placeholder={selectedCategory === "electricity" ? "Enter Meter Number" : 
                                 selectedCategory === "tv" ? "Enter IUC Number" : "Enter Phone Number"}
                    placeholderTextColor={colors.textSecondary}
                    keyboardType="numeric"
                    value={selectedCategory === "electricity" || selectedCategory === "tv" ? meterNumber : phoneNumber}
                    onChangeText={selectedCategory === "electricity" || selectedCategory === "tv" ? setMeterNumber : setPhoneNumber}
                  />
                  {/* Contact Picker Icon could go here */}
                   <Icon name="contacts" size={20} color={colors.textSecondary} />
                </View>
              </View>

              {/* Data Plans Grid */}
              {(selectedCategory === "data" || selectedCategory === "tv") && (
                <View style={styles.section}>
                  {selectedCategory === "data" && (
                    <View style={styles.tabContainer}>
                      {["HOT", "Daily", "Weekly", "Monthly"].map(tab => (
                        <Pressable key={tab} onPress={() => setPlanFilter(tab)} style={[styles.tabItem, planFilter === tab && styles.tabItemActive]}>
                          <Text style={[styles.tabText, planFilter === tab && styles.tabTextActive]}>{tab}</Text>
                        </Pressable>
                      ))}
                    </View>
                  )}
                  
                  {isLoadingPlans ? (
                    <ActivityIndicator size="large" color={colors.primary} style={{ marginTop: 20 }} />
                  ) : (
                    <View style={styles.planGrid}>
                       {plansToDisplay.map((plan) => (
                        <Pressable 
                          key={plan.id}
                          style={({pressed}) => [
                            styles.planCard, 
                            { 
                              backgroundColor: colors.surface,
                              borderColor: selectedProduct?.id === plan.id ? colors.primary : 'transparent',
                              transform: [{scale: pressed ? 0.96 : 1}]
                            }
                          ]}
                          onPress={() => setSelectedProduct(plan)}
                        >
                          {/* Discount Badge */}
                          <View style={styles.planBadge}>
                             <Text style={styles.planBadgeText}>%</Text>
                          </View>

                          <Text style={[styles.planCardName, { color: colors.text }]}>{plan.name.replace('Data', '').replace(' ', '')}</Text>
                          <Text style={[styles.planCardValidity, { color: colors.textSecondary }]}>{plan.validity || "30 Days"}</Text>
                          <Text style={[styles.planCardPrice, { color: colors.text }]}>₦{plan.price}</Text>
                          
                          {/* Strikethrough random original price for effect */}
                          <Text style={styles.planCardOldPrice}>₦{Math.floor(plan.price * 1.1)}</Text>



                           {selectedProduct?.id === plan.id && (
                             <View style={styles.planSelectedOverlay}>
                               <Icon name="check-circle" size={24} color={colors.primary} />
                             </View>
                           )}
                        </Pressable>
                      ))}
                    </View>
                  )}
                  </View>
                )}

              {/* Large Amount Grid for Airtime/Electricity */}
              {(selectedCategory === "airtime" || selectedCategory === "electricity") && (
                <View style={styles.inputGroup}>
                  <Text style={[styles.inputLabel, { color: colors.text, marginBottom: 12 }]}>Select Amount</Text>
                  <View style={styles.amountGrid}>
                    {[1000, 2000, 3000, 5000, 10000, 20000].map(amt => (
                      <Pressable 
                        key={amt} 
                        style={[
                          styles.amountBigCard, 
                          { 
                            backgroundColor: amount === amt.toString() ? '#F0FDF4' : colors.surface, // Light green if selected
                            borderColor: amount === amt.toString() ? colors.primary : 'transparent'
                          }
                        ]}
                        onPress={() => setAmount(amt.toString())}
                      >
                        <Text style={[styles.amountBigText, { color: colors.text }]}>₦ {amt.toLocaleString()}</Text>
                        <Text style={[styles.amountSubText, { color: colors.textSecondary }]}>Pay ₦{amt.toLocaleString()}</Text>
                      </Pressable>
                    ))}
                  </View>
                   
                   {/* Manual Amount Input */}
                   <View style={[styles.inputContainer, { backgroundColor: colors.background, borderColor: colors.border, marginTop: 16 }]}>
                    <Text style={{ fontSize: 18, fontWeight: '700', color: colors.textSecondary }}>₦</Text>
                    <TextInput
                      style={[styles.inputField, { color: colors.text }]}
                      placeholder="Enter Amount"
                      placeholderTextColor={colors.textSecondary}
                      keyboardType="numeric"
                      value={amount}
                      onChangeText={setAmount}
                    />
                  </View>

                </View>
              )}

            </ScrollView>

            <View style={{ paddingVertical: 16, borderTopWidth: 1, borderTopColor: colors.border }}>
              <Pressable 
                style={[
                  styles.primaryBtn, 
                  { 
                    backgroundColor: colors.primary, 
                    opacity: (selectedCategory === "data" ? !selectedProduct : !amount) || (selectedCategory === "electricity" ? !meterNumber : !phoneNumber) ? 0.5 : 1,
                    marginTop: 0 
                  }
                ]}
                onPress={handleValidate}
                disabled={
                  (selectedCategory === "data" || selectedCategory === "tv" ? !selectedProduct : !amount) || 
                  (selectedCategory === "electricity" || selectedCategory === "tv" ? !meterNumber : !phoneNumber)
                }
              >
                {isLoading ? (
                  <ActivityIndicator color="white" />
                ) : (
                  <Text style={styles.primaryBtnText}>Continue</Text>
                )}
              </Pressable>
            </View>
          </View>
        );

      case "beneficiaries":
        return (
          <View style={[styles.modalContent, { backgroundColor: colors.surface }]}>
            <View style={styles.dragHandle} />
            <View style={styles.modalHeader}>
              <View style={{flexDirection: 'row', alignItems: 'center', gap: 12}}>
                 <Pressable onPress={() => setSelectionStep("details")}>
                  <Icon name="arrow-back" size={24} color={colors.text} />
                </Pressable>
                <View>
                  <Text style={[styles.modalTitle, { color: colors.text, fontSize: 18 }]}>Beneficiaries</Text>
                  <Text style={{ color: colors.textSecondary, fontSize: 12 }}>Quickly select a recipient</Text>
                </View>
              </View>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
              {isLoadingBeneficiaries ? (
                <ActivityIndicator size="large" color={colors.primary} style={{ marginTop: 40 }} />
              ) : beneficiaries.length === 0 ? (
                <View style={{ alignItems: 'center', paddingVertical: 60 }}>
                  <View style={{ width: 80, height: 80, borderRadius: 40, backgroundColor: colors.background, justifyContent: 'center', alignItems: 'center', marginBottom: 16 }}>
                    <Icon name="person-add" size={40} color={colors.textSecondary} />
                  </View>
                  <Text style={{ color: colors.text, fontWeight: '700', fontSize: 16 }}>No beneficiaries yet</Text>
                  <Text style={{ color: colors.textSecondary, textAlign: 'center', marginTop: 8, paddingHorizontal: 40 }}>
                    Successfully completed transactions can be saved as beneficiaries for future use.
                  </Text>
                </View>
              ) : (
                <View style={{ gap: 12 }}>
                  {beneficiaries.map((b) => (
                    <Pressable 
                      key={b.id} 
                      onPress={() => handleSelectBeneficiary(b)}
                      style={({pressed}) => [
                        { 
                          flexDirection: 'row', 
                          alignItems: 'center', 
                          padding: 16, 
                          backgroundColor: colors.background, 
                          borderRadius: 20,
                          opacity: pressed ? 0.7 : 1
                        }
                      ]}
                    >
                      <View style={{ width: 48, height: 48, borderRadius: 24, backgroundColor: colors.primary + '15', justifyContent: 'center', alignItems: 'center', marginRight: 16 }}>
                        <Text style={{ color: colors.primary, fontWeight: '800', fontSize: 18 }}>
                          {(b.name || "U").charAt(0).toUpperCase()}
                        </Text>
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text style={{ color: colors.text, fontWeight: '700', fontSize: 15 }}>{b.name || "Unnamed Recipient"}</Text>
                        <Text style={{ color: colors.textSecondary, fontSize: 13, marginTop: 2 }}>{b.recipient} • {b.providerName || b.providerId}</Text>
                      </View>
                      <Icon name="chevron-right" size={20} color={colors.textSecondary} />
                    </Pressable>
                  ))}
                </View>
              )}
            </ScrollView>
          </View>
        );

      case "checkout":
        return (
          <View style={[styles.modalContent, { backgroundColor: colors.surface }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: colors.text }]}>Checkout</Text>
              <Pressable onPress={() => setSelectionStep("details")}>
                <Icon name="arrow-back" size={24} color={colors.text} />
              </Pressable>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 32 }}>
              <View style={[styles.summaryCard, { backgroundColor: colors.background, marginTop: 10 }]}>
                <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>Summary</Text>
                <View style={styles.summaryRow}>
                  <Text style={[styles.summaryText, { color: colors.text }]}>
                    {selectedProduct ? 
                      `${selectedProvider?.name} ${selectedProduct.name}` : 
                      `${selectedProvider?.name} ${selectedCategory === "airtime" ? "Airtime" : "Payment"}`}
                  </Text>
                  <Text style={[styles.summaryPrice, { color: colors.primary }]}>₦{selectedProduct?.price || amount}</Text>
                </View>
                {verifiedName ? (
                  <Text style={styles.verifiedText}>Name: {verifiedName}</Text>
                ) : null}
              </View>

              <Text style={[styles.inputLabel, { color: colors.textSecondary, marginTop: 24 }]}>Payment Method</Text>
              <View style={styles.methodList}>
                <Pressable 
                  style={[
                    styles.methodItem, 
                    { 
                      backgroundColor: colors.background, 
                      borderColor: paymentMethod === 'card' ? colors.primary : 'transparent', 
                      borderWidth: 1 
                    }
                  ]}
                  onPress={() => setPaymentMethod('card')}
                >
                  <Icon name="credit-card" size={24} color="#3b82f6" />
                  <Text style={[styles.methodText, { color: colors.text }]}>Card Payment</Text>
                  <Icon name={paymentMethod === 'card' ? "radio-button-checked" : "radio-button-off"} size={20} color={paymentMethod === 'card' ? colors.primary : colors.textSecondary} />
                </Pressable>

                <Pressable 
                  style={[
                    styles.methodItem, 
                    { 
                      backgroundColor: colors.background, 
                      marginTop: 12,
                      borderColor: paymentMethod === 'transfer' ? colors.primary : 'transparent',
                      borderWidth: 1
                    }
                  ]}
                  onPress={() => setPaymentMethod('transfer')}
                >
                  <Icon name="account-balance" size={24} color="#10b981" />
                  <Text style={[styles.methodText, { color: colors.text }]}>{t('bills.transfer')}</Text>
                  <Icon name={paymentMethod === 'transfer' ? "radio-button-checked" : "radio-button-off"} size={20} color={paymentMethod === 'transfer' ? colors.primary : colors.textSecondary} />
                </Pressable>

                <Pressable 
                  style={[
                    styles.methodItem, 
                    { 
                      backgroundColor: colors.background, 
                      marginTop: 12,
                      borderColor: paymentMethod === 'ussd' ? colors.primary : 'transparent',
                      borderWidth: 1
                    }
                  ]}
                  onPress={() => setPaymentMethod('ussd')}
                >
                  <Icon name="dialpad" size={24} color="#6366f1" />
                  <Text style={[styles.methodText, { color: colors.text }]}>Pay with USSD</Text>
                  <Icon name={paymentMethod === 'ussd' ? "radio-button-checked" : "radio-button-off"} size={20} color={paymentMethod === 'ussd' ? colors.primary : colors.textSecondary} />
                </Pressable>

                {/* MOCK BYPASS OPTION */}
                <Pressable 
                  style={[
                    styles.methodItem, 
                    { 
                      backgroundColor: colors.primary + '10', 
                      marginTop: 24,
                      borderColor: paymentMethod === 'mock' ? colors.primary : 'transparent',
                      borderWidth: 1
                    }
                  ]}
                  onPress={() => setPaymentMethod('mock')}
                >
                  <Icon name="bug-report" size={24} color={colors.primary} />
                  <View style={{ flex: 1, marginLeft: 16 }}>
                    <Text style={[styles.methodText, { color: colors.text }]}>Mock Success (Skip Paystack)</Text>
                    <Text style={{ fontSize: 11, color: colors.primary }}>For Development Only</Text>
                  </View>
                  <Icon name={paymentMethod === 'mock' ? "radio-button-checked" : "radio-button-off"} size={20} color={paymentMethod === 'mock' ? colors.primary : colors.textSecondary} />
                </Pressable>
              </View>
            </ScrollView>

            <View style={{ paddingVertical: 16, borderTopWidth: 1, borderTopColor: colors.border }}>
              <Pressable 
                style={[styles.primaryBtn, { backgroundColor: colors.primary, marginTop: 0 }]}
                onPress={handlePay}
              >
                {isLoading ? (
                  <ActivityIndicator color="white" />
                ) : (
                  <Text style={styles.primaryBtnText}>Pay ₦{selectedProduct?.price || amount} Now</Text>
                )}
              </Pressable>
            </View>
          </View>
        );

      case "success":
        return (
          <View style={[styles.modalContent, { backgroundColor: colors.background, paddingHorizontal: 0, paddingBottom: 40 }]}>
            <View style={{ alignItems: 'center', paddingVertical: 32, paddingHorizontal: 20 }}>
              <View style={[styles.successCircle, { backgroundColor: colors.primary, marginBottom: 16 }]}>
                <Icon name="check" size={50} color="white" />
              </View>
              <Text style={[styles.successTitle, { color: colors.text }]}>Payment Successful!</Text>
              <Text style={[styles.successMsg, { color: colors.textSecondary }]}>
                {selectedCategory === "electricity" 
                  ? "Your electricity token has been generated." 
                  : "Your request has been processed successfully."}
              </Text>
            </View>

            <View style={{ paddingHorizontal: 20 }}>
              <View style={[styles.receiptCard, { backgroundColor: colors.surface, padding: 0, overflow: 'hidden' }]}>
                <View style={{ padding: 24 }}>
                  <View style={{ alignItems: 'center', marginBottom: 24 }}>
                    <Text style={{ color: colors.textSecondary, fontSize: 13, textTransform: 'uppercase', letterSpacing: 1 }}>Transaction Amount</Text>
                    <Text style={{ color: colors.text, fontSize: 32, fontWeight: '800', marginTop: 8 }}>₦{(selectedProduct?.price || amount).toLocaleString()}</Text>
                  </View>

                  <View style={{ gap: 16 }}>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                      <Text style={{ color: colors.textSecondary }}>Category</Text>
                      <Text style={{ color: colors.text, fontWeight: '600' }}>{selectedCategory?.toUpperCase()}</Text>
                    </View>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                      <Text style={{ color: colors.textSecondary }}>Provider</Text>
                      <Text style={{ color: colors.text, fontWeight: '600' }}>{selectedProvider?.name}</Text>
                    </View>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                      <Text style={{ color: colors.textSecondary }}>Recipient</Text>
                      <Text style={{ color: colors.text, fontWeight: '600' }}>{phoneNumber || meterNumber}</Text>
                    </View>
                    {transactionData?.token && (
                      <View style={{ marginTop: 8, padding: 16, backgroundColor: colors.background, borderRadius: 12, alignItems: 'center' }}>
                        <Text style={{ color: colors.textSecondary, fontSize: 11, textTransform: 'uppercase' }}>Token Code</Text>
                        <Text style={{ color: colors.primary, fontSize: 20, fontWeight: '800', marginTop: 4, letterSpacing: 2 }}>{transactionData.token}</Text>
                      </View>
                    )}
                  </View>
                </View>
                
                {/* Jagged Edge */}
                <View style={{ flexDirection: 'row', width: '100%', height: 10 }}>
                  {[...Array(20)].map((_, i) => (
                    <View 
                      key={i} 
                      style={{ 
                        width: width / 20, 
                        height: 10, 
                        backgroundColor: colors.background,
                        borderTopLeftRadius: 10,
                        borderTopRightRadius: 10,
                        transform: [{ translateY: 5 }]
                      }} 
                    />
                  ))}
                </View>
              </View>
            </View>

            <View style={{ width: '100%', gap: 12, marginTop: 32, paddingHorizontal: 20 }}>
              {!beneficiarySaved && (
                <Pressable 
                  style={[styles.secondaryBtn, { backgroundColor: colors.primary + '10', borderColor: colors.primary, borderWidth: 1, width: '100%', flexDirection: 'row', gap: 8, height: 56 }]}
                  onPress={handleSaveBeneficiary}
                  disabled={isSavingBeneficiary}
                >
                  {isSavingBeneficiary ? (
                    <ActivityIndicator size="small" color={colors.primary} />
                  ) : (
                    <>
                      <Icon name="person-add" size={20} color={colors.primary} />
                      <Text style={[styles.secondaryBtnText, { color: colors.primary, fontWeight: '700' }]}>Save to Beneficiaries</Text>
                    </>
                  )}
                </Pressable>
              )}

              <Pressable 
                style={[styles.primaryBtn, { backgroundColor: colors.primary, width: '100%', marginTop: 0, height: 56 }]}
                onPress={handleShowReceipt}
              >
                <Text style={styles.primaryBtnText}>Download Receipt</Text>
              </Pressable>
              
              <Pressable 
                style={[styles.secondaryBtn, { borderColor: colors.border, borderWidth: 1, width: '100%', height: 56 }]}
                onPress={resetFlow}
              >
                <Text style={[styles.secondaryBtnText, { color: colors.text, fontWeight: '600' }]}>Back to Home</Text>
              </Pressable>
            </View>
          </View>
        );

      case "failure":
        return (
          <View style={[styles.modalContent, { alignItems: 'center', paddingVertical: 40, backgroundColor: colors.surface }]}>
            <View style={[styles.successCircle, { backgroundColor: "#ef4444" }]}>
              <Icon name="close" size={60} color="white" />
            </View>
            <Text style={[styles.successTitle, { color: colors.text }]}>Transaction Failed</Text>
            <Text style={[styles.successMsg, { color: colors.textSecondary }]}>
              {transactionData?.error || "Your transaction could not be completed at this time."}
            </Text>

            <View style={{ width: '100%', gap: 12, marginTop: 32 }}>
              <Pressable 
                style={[styles.primaryBtn, { backgroundColor: "#ef4444", width: '100%', marginTop: 0 }]}
                onPress={() => setSelectionStep("checkout")}
              >
                <Text style={styles.primaryBtnText}>Try Again</Text>
              </Pressable>
              
              <Pressable 
                style={[styles.secondaryBtn, { borderColor: colors.border, borderWidth: 1, width: '100%' }]}
                onPress={resetFlow}
              >
                <Text style={[styles.secondaryBtnText, { color: colors.text }]}>Dismiss</Text>
              </Pressable>
            </View>
          </View>
        );

      case "receipt":
        return (
          <View style={[styles.modalContent, { backgroundColor: colors.background, paddingHorizontal: 0, paddingBottom: 40 }]}>
             <View style={[styles.modalHeader, { paddingHorizontal: 20 }]}>
              <Text style={[styles.modalTitle, { color: colors.text }]}>Transaction Receipt</Text>
              <Pressable onPress={() => setSelectionStep("success")}>
                <Icon name="close" size={24} color={colors.text} />
              </Pressable>
            </View>

            <ScrollView contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 10 }}>
              <View style={[styles.receiptPaper, { backgroundColor: colors.surface, borderRadius: 4, elevation: 4, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 10 }]}>
                {/* Receipt Content */}
                <View style={{ padding: 24 }}>
                  <View style={{ alignItems: 'center', marginBottom: 24 }}>
                    <View style={[styles.receiptCheck, { backgroundColor: '#10b981', width: 50, height: 50, borderRadius: 25, justifyContent: 'center', alignItems: 'center', marginBottom: 12 }]}>
                      <Icon name="check" size={30} color="white" />
                    </View>
                    <Text style={[styles.receiptStatus, { color: '#10b981', fontWeight: '700', fontSize: 16 }]}>SUCCESS</Text>
                    <Text style={[styles.receiptAmount, { color: colors.text, fontSize: 32, fontWeight: '800', marginTop: 8 }]}>
                      ₦{transactionData?.amount || selectedProduct?.price || amount || "0.00"}
                    </Text>
                  </View>

                  <View style={[styles.divider, { marginVertical: 20, backgroundColor: colors.border, height: 1, borderStyle: 'dashed', opacity: 0.5 }]} />

                  <View style={styles.receiptDetails}>
                    {[
                      { label: "Transaction Type", value: selectedCategory?.toUpperCase() || "PAYMENT" },
                      { label: "Provider", value: transactionData?.provider || selectedProvider?.name || "Zapp" },
                      { 
                        label: selectedCategory === "electricity" || selectedCategory === "tv" ? "Account/Meter" : "Recipient", 
                        value: transactionData?.details?.meter || transactionData?.details?.phone || meterNumber || phoneNumber 
                      },
                      { label: "Date", value: transactionData?.createdAt?.toDate ? transactionData.createdAt.toDate().toLocaleString() : new Date().toLocaleString() },
                      { label: "Reference", value: txRef || "N/A", monospaced: true },
                    ].map((row, i) => (
                      <View key={i} style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 16 }}>
                        <Text style={{ color: colors.textSecondary, fontSize: 13 }}>{row.label}</Text>
                        <Text style={{ 
                          color: colors.text, 
                          fontSize: 14, 
                          fontWeight: '600',
                          fontFamily: row.monospaced ? (Platform.OS === 'ios' ? 'Courier' : 'monospace') : undefined
                        }}>
                          {row.value}
                        </Text>
                      </View>
                    ))}

                    {transactionData?.token && (
                      <View style={{ marginTop: 8, padding: 16, backgroundColor: colors.background, borderRadius: 8 }}>
                        <Text style={{ color: colors.textSecondary, fontSize: 12, marginBottom: 4 }}>TOKEN / PIN</Text>
                        <Text style={{ color: colors.primary, fontSize: 18, fontWeight: '800', letterSpacing: 2 }}>
                          {transactionData.token}
                        </Text>
                      </View>
                    )}
                  </View>

                  <View style={[styles.divider, { marginTop: 30, marginBottom: 20, backgroundColor: colors.border, height: 1, borderStyle: 'dashed', opacity: 0.5 }]} />
                  
                  <View style={{ alignItems: 'center' }}>
                    <Text style={{ color: colors.textSecondary, fontSize: 12 }}>Powered by Zapp Payments</Text>
                    <Text style={{ color: colors.textSecondary, fontSize: 10, marginTop: 4 }}>© {new Date().getFullYear()} Zapp Technologies LTD</Text>
                  </View>
                </View>

                {/* Jagged Edge Bottom */}
                <View style={{ flexDirection: 'row', position: 'absolute', bottom: -10, left: 0, right: 0 }}>
                  {Array.from({ length: 20 }).map((_, i) => (
                    <View 
                      key={i} 
                      style={{ 
                        width: 20, 
                        height: 20, 
                        backgroundColor: colors.surface, 
                        transform: [{ rotate: '45deg' }],
                        marginTop: -10
                      }} 
                    />
                  ))}
                </View>
              </View>

              <Pressable 
                style={[styles.primaryBtn, { backgroundColor: colors.primary, marginTop: 40 }]}
                onPress={() => {
                  // Share logic placeholder
                  Alert.alert("Success", "Receipt shared successfully!");
                }}
              >
                <Text style={styles.primaryBtnText}>Download Receipt</Text>
              </Pressable>

              <Pressable 
                style={{ marginTop: 20, alignItems: 'center' }}
                onPress={resetFlow}
              >
                <Text style={{ color: colors.textSecondary, fontWeight: '600' }}>Back to Home</Text>
              </Pressable>
            </ScrollView>
          </View>
        );

      case "payment-details":
        const bankAccount = paymentInfo?.bankAccounts?.[0];
        return (
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: colors.text }]}>Payment Details</Text>
              <Pressable onPress={() => setSelectionStep("checkout")}>
                <Icon name="arrow-back" size={24} color={colors.text} />
              </Pressable>
            </View>

            <View style={[styles.alertBox, { backgroundColor: colors.primary + '15' }]}>
              <Icon name="info" size={20} color={colors.primary} />
              <Text style={[styles.alertText, { color: colors.text }]}>
                Transfer exactly <Text style={{ fontWeight: 'bold' }}>₦{selectedProduct?.price || amount}</Text> to the account below.
              </Text>
            </View>

            <View style={[styles.paymentCard, { backgroundColor: colors.surface, borderColor: colors.border, borderWidth: 1 }]}>
              <Text style={[styles.paymentLabel, { color: colors.textSecondary }]}>Account Number</Text>
              <View style={styles.copyRow}>
                <Text style={[styles.paymentValue, { color: colors.text }]}>{bankAccount?.accountNumber || "0123456789"}</Text>
                <Pressable style={styles.copyIconBtn}>
                  <Icon name="content-copy" size={20} color={colors.primary} />
                </Pressable>
              </View>

              <Text style={[styles.paymentLabel, { color: colors.textSecondary, marginTop: 16 }]}>Bank Name</Text>
              <Text style={[styles.paymentValue, { color: colors.text }]}>{bankAccount?.bankName || "Monnify / Zapp Bank"}</Text>

              <Text style={[styles.paymentLabel, { color: colors.textSecondary, marginTop: 16 }]}>Account Name</Text>
              <Text style={[styles.paymentValue, { color: colors.text }]}>{bankAccount?.accountName || "Zapp Technologies LTD"}</Text>
            </View>

            <View style={styles.waitingContainer}>
              <ActivityIndicator color={colors.primary} size="small" />
              <Text style={[styles.waitingText, { color: colors.textSecondary }]}>Waiting for payment confirmation...</Text>
            </View>

            <Pressable 
              style={[styles.primaryBtn, { backgroundColor: colors.primary }]}
              onPress={async () => {
                if (!txRef) {
                  console.warn("[BillsScreen] Manual check clicked but txRef is missing!");
                  return;
                }
                setIsLoading(true);
                try {
                   console.log(`[BillsScreen] Manual status re-check for REF: ${txRef}, Current UI Status: ${transactionData?.status}`);
                   const result = await callFunction("verifyPayment", { txRef }) as any;
                   console.log(`[BillsScreen] Manual verification RESULT:`, result);
                   
                   if (result.success && result.status === "PAID") {
                     console.log("[BillsScreen] Payment confirmed by server!");
                   } else {
                     Alert.alert("Status Update", result.message || "Payment not yet detected. If you just paid, please wait a moment.");
                     setIsLoading(false);
                   }
                } catch (e: any) {
                  console.error("Verification Error", e);
                  setIsLoading(false);
                  Alert.alert("Error", "Could not reach verification server.");
                }
              }}
            >
              <Text style={styles.primaryBtnText}>
                 {isLoading && (!transactionData?.status || transactionData?.status === "UNPAID" || transactionData?.status === "PENDING") ? "Confirming Payment..." : 
                  isLoading && transactionData?.status === "PAID" ? "Finalizing Order..." : 
                  "I have sent the money / Check Status"}
              </Text>
            </Pressable>

            {/* BYPASS BUTTON - For Local Testing as requested */}
            <Pressable 
              style={[styles.secondaryBtn, { marginTop: 12, borderColor: colors.primary, borderWidth: 1 }]}
              onPress={async () => {
                if (!txRef) return;
                setIsLoading(true);
                try {
                  console.log(`[BillsScreen] BYPASS TRIGGERED for ${txRef}`);
                  await callFunction("confirmMockPayment", { txRef });
                  // Firestore listener will handle the transition
                } catch (e: any) {
                  console.error("Bypass Error", e);
                  setIsLoading(false);
                }
              }}
            >
              <Text style={[styles.secondaryBtnText, { color: colors.primary }]}>Debug: Skip Verification (Bypass)</Text>
            </Pressable>
          </View>
        );

      case "processing":
        return (
          <View style={[styles.modalContent, { alignItems: 'center', paddingVertical: 60, backgroundColor: colors.surface }]}>
            <ActivityIndicator size="large" color={colors.primary} />
            <Text style={[styles.modalTitle, { color: colors.text, marginTop: 24 }]}>
              {transactionData?.status === "PAID" ? "Finalizing Order..." : 
               transactionData?.status === "UNPAID" ? "Confirming Payment..." : 
               "Processing Transaction..."}
            </Text>
            <Text style={[styles.successMsg, { color: colors.textSecondary, textAlign: 'center', marginTop: 12 }]}>
              {transactionData?.status === "PAID" ? "Payment received! Delivering your service now..." : 
               "Please do not close the app. We are finalizing your request."}
            </Text>
            
            <View style={{ width: '100%', marginTop: 40, gap: 12 }}>
               {/* Button removed as per user request for auto-flow */}
               <Pressable 
                style={[styles.secondaryBtn, { borderColor: colors.border, borderWidth: 1 }]}
                onPress={() => setSelectionStep("checkout")}
              >
                <Text style={[styles.secondaryBtnText, { color: colors.text }]}>Cancel / Go Back</Text>
              </Pressable>
            </View>
          </View>
        );

      default:
        return null;
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header Section */}
        <View style={[
          styles.header, 
          { 
            paddingTop: Platform.OS === 'android' ? Math.max(insets.top, 30) : insets.top + 10 
          }
        ]}>
          <View>
            <Text style={[styles.headerTitle, { color: colors.text }]}>Payments</Text>
            <Text style={[styles.headerSubtitle, { color: colors.textSecondary }]}>
              Pay bills & buy cheap data instantly
            </Text>
          </View>
          <Pressable 
            style={[styles.historyButton, { backgroundColor: colors.surface }]}
            onPress={() => setShowHistory(true)}
          >
            <Icon name="history" size={24} color={colors.primary} />
          </Pressable>
        </View>

        {/* Promo Banner */}
        <LinearGradient
          colors={["#10b981", "#059669"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.promoBanner}
        >
          <View style={styles.promoContent}>
            <Text style={styles.promoTitle}>Save up to 70%</Text>
            <Text style={styles.promoText}>On all SME data purchases today!</Text>
            <Pressable style={styles.promoBtn} onPress={() => handleCategoryPress('data')}>
              <Text style={styles.promoBtnText}>View Deals</Text>
            </Pressable>
          </View>
          <Icon name="flash-on" size={80} color="rgba(255,255,255,0.2)" style={styles.promoIcon} />
        </LinearGradient>

        {/* Categories Grid */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Categories</Text>
          <View style={styles.grid}>
            {categories.map((cat) => (
              <Pressable
                key={cat.id}
                style={[styles.gridItem, { backgroundColor: colors.surface }]}
                onPress={() => handleCategoryPress(cat.id)}
              >
                <LinearGradient
                  colors={cat.gradient}
                  style={styles.categoryIcon}
                >
                  <Icon name={cat.icon as any} size={24} color="white" />
                </LinearGradient>
                <Text style={[styles.categoryTitle, { color: colors.text }]}>{cat.title}</Text>
                {cat.tag && (
                  <View style={styles.hotTag}>
                    <Text style={styles.hotTagText}>{cat.tag}</Text>
                  </View>
                )}
              </Pressable>
            ))}
          </View>
        </View>

        {/* Hot Deals Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Data Hot Deals</Text>
            <Pressable>
              <Text style={{ color: colors.primary, fontWeight: "600" }}>See All</Text>
            </Pressable>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.dealsScroll}>
            {isLoadingDeals ? (
              [1, 2, 3].map((i) => (
                <View key={i} style={[styles.dealCard, { backgroundColor: colors.surface, opacity: 0.5 }]}>
                   <ActivityIndicator size="small" color={colors.primary} style={{ marginTop: 20 }} />
                </View>
              ))
            ) : (
              hotDeals.map((deal) => (
                <Pressable
                  key={deal.id}
                  style={[styles.dealCard, { backgroundColor: colors.surface }]}
                  onPress={() => handleDealPress(deal)}
                >
                  <View style={[styles.providerLine, { backgroundColor: deal.color }]} />
                  <Text style={[styles.dealProvider, { color: colors.textSecondary }]}>{deal.provider}</Text>
                  <Text style={[styles.dealPlan, { color: colors.text }]}>{deal.plan}</Text>
                  <Text style={styles.dealPrice}>{deal.price}</Text>
                  <Text style={styles.dealOldPrice}>{deal.originalPrice}</Text>
                  <View style={styles.dealFooter}>
                    <Icon name="access-time" size={12} color={colors.textSecondary} />
                    <Text style={[styles.dealValidity, { color: colors.textSecondary }]}>{deal.validity}</Text>
                  </View>
                </Pressable>
              ))
            )}
          </ScrollView>
        </View>

        {/* Utilities Section */}
        <View style={[styles.section, { marginBottom: 32 }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Other Services</Text>
          <View style={[styles.utilityList, { backgroundColor: colors.surface, borderRadius: 24, padding: 8, marginTop: 12 }]}>
            <Pressable style={styles.utilityItem} onPress={() => handleCategoryPress('tv')}>
              <View style={[styles.uIcon, { backgroundColor: "#e0f2fe" }]}>
                <Icon name="live-tv" size={22} color="#0284c7" />
              </View>
              <Text style={[styles.uText, { color: colors.text }]}>TV Subscription</Text>
              <Icon name="chevron-right" size={20} color={colors.textSecondary} />
            </Pressable>
            <View style={[styles.divider, { backgroundColor: colors.border, height: 1, marginHorizontal: 16 }]} />
            <Pressable style={styles.utilityItem} onPress={() => handleCategoryPress('electricity')}>
              <View style={[styles.uIcon, { backgroundColor: "#fef3c7" }]}>
                <Icon name="bolt" size={22} color="#d97706" />
              </View>
              <Text style={[styles.uText, { color: colors.text }]}>Electricity Bill</Text>
              <Icon name="chevron-right" size={20} color={colors.textSecondary} />
            </Pressable>
          </View>
        </View>
      </ScrollView>

      {/* Bill Flow Modal */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={resetFlow}
      >
        <View style={styles.modalOverlay}>
            {renderModalContent()}
        </View>
      </Modal>

      <Modal
        visible={showHistory}
        animationType="slide"
        onRequestClose={() => setShowHistory(false)}
      >
        <BillsHistory onBack={() => setShowHistory(false)} />
      </Modal>

      <PaymentWebView
        visible={showWebView}
        url={checkoutUrl}
        txRef={txRef || ""}
        onClose={handleWebViewClose}
        onSuccess={async () => {
          if (isVerifying) return;
          console.log('[BillsScreen] ON_SUCCESS_RECEIVED from WebView...');
          setIsVerifying(true);
          setShowWebView(false);
          setIsLoading(true);
          setSelectionStep("processing");

          if (txRef) {
            try {
              console.log(`[BillsScreen] Bypassing/Triggering server verification for: ${txRef}`);
              // In dev, we use mock bypass. In prod, we'd call verifyPayment or just wait for webhook.
              const result = await callFunction("confirmMockPayment", { txRef }) as any;
              console.log('[BillsScreen] Verification/Bypass result:', result);
            } catch (error) {
              console.error('[BillsScreen] Verification call failed:', error);
            }
          }
        }}
        onFailure={(err) => {
          setShowWebView(false);
          setSelectionStep("checkout");
          Alert.alert("Payment Info", err);
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 20,
    backgroundColor: 'transparent',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  headerSubtitle: {
    fontSize: 14,
    marginTop: 4,
  },
  historyButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  promoBanner: {
    marginHorizontal: 20,
    borderRadius: 24,
    padding: 24,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 32,
    overflow: 'hidden',
    elevation: 4,
    shadowColor: "#10b981",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  promoContent: {
    flex: 1,
    zIndex: 2,
  },
  promoTitle: {
    color: 'white',
    fontSize: 22,
    fontWeight: '800',
    marginBottom: 4,
  },
  promoText: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 14,
    marginBottom: 16,
  },
  promoBtn: {
    backgroundColor: 'white',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  promoBtnText: {
    color: '#059669',
    fontWeight: '700',
    fontSize: 14,
  },
  promoIcon: {
    position: 'absolute',
    right: -10,
    bottom: -10,
    transform: [{ rotate: '-15deg' }],
  },
  section: {
    marginBottom: 32,
    paddingHorizontal: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: -0.5,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
    justifyContent: 'space-between',
  },
  gridItem: {
    width: (width - 56) / 2,
    padding: 20,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  categoryIcon: {
    width: 56,
    height: 56,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  categoryTitle: {
    fontSize: 15,
    fontWeight: '600',
  },
  hotTag: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: '#ef4444',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  hotTagText: {
    color: 'white',
    fontSize: 10,
    fontWeight: '700',
  },
  dealsScroll: {
    marginHorizontal: -20,
    paddingHorizontal: 20,
  },
  dealCard: {
    width: 200,
    padding: 16,
    borderRadius: 20,
    marginRight: 16,
    borderWidth: 1,
    borderColor: 'transparent',
    elevation: 2,
  },
  providerLine: {
    width: 40,
    height: 4,
    borderRadius: 2,
    marginBottom: 12,
  },
  dealProvider: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  dealPlan: {
    fontSize: 18,
    fontWeight: '700',
    marginTop: 4,
    marginBottom: 4,
  },
  dealPrice: {
    fontSize: 20,
    fontWeight: '800',
    color: '#eab308',
  },
  dealOldPrice: {
    fontSize: 14,
    textDecorationLine: 'line-through',
    color: '#9ca3af',
    marginBottom: 12,
  },
  dealFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  dealValidity: {
    fontSize: 12,
  },
  utilityList: {
    borderRadius: 20,
    overflow: 'hidden',
  },
  utilityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    justifyContent: 'space-between',
  },
  uIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  uText: {
    fontSize: 16,
    fontWeight: '500',
    flex: 1,
  },
  divider: {
    height: 1,
    marginLeft: 72,
  },
  
  // MODAL / ACTION SHEET STYLES
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    // backgroundColor: 'white', // Removed to use theme color in JSX
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    paddingHorizontal: 24,
    paddingTop: 12,
    paddingBottom: Platform.OS === 'ios' ? 40 : 24,
    maxHeight: height * 0.92,
    minHeight: height * 0.5,
    elevation: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
  },
  dragHandle: {
    width: 48,
    height: 5,
    backgroundColor: '#E5E7EB',
    borderRadius: 10,
    alignSelf: 'center',
    marginTop: 8,
    marginBottom: 24,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  providerGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
    paddingBottom: 24,
  },
  providerBtn: {
    width: (width - 80) / 3, // (Screen - 2*24 padding - 2*16 gap) / 3
    aspectRatio: 0.9,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    borderWidth: 1,
    borderColor: '#F3F4F6', // Very subtle border
  },
  providerLogoCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
    overflow: 'hidden',
  },
  providerName: {
    fontSize: 12,
    fontWeight: '700',
    textAlign: 'center',
  },
  inputGroup: {
    marginBottom: 24,
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    opacity: 0.8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 60,
    borderRadius: 18,
    paddingHorizontal: 16,
    borderWidth: 1,
  },
  inputField: {
    flex: 1,
    height: '100%',
    marginLeft: 12,
    fontSize: 18,
    fontWeight: '600',
  },
  // Legacy input style support (for areas not yet refactored to container)
  input: {
    height: 56,
    borderWidth: 1.5,
    borderRadius: 16,
    paddingHorizontal: 16,
    fontSize: 18,
    fontWeight: '600',
  },
  quickAmounts: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginTop: 12,
  },
  amountChip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 14,
    borderWidth: 1,
  },
  
  // NEW ADVANCED UI STYLES
  toggleContainer: {
    flexDirection: 'row',
    backgroundColor: 'transparent',
    marginBottom: 24,
    gap: 16,
  },
  toggleBtn: {
    flex: 1,
    height: 52,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F3F4F6', // Default gray
    flexDirection: 'row',
    gap: 8,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  toggleText: {
    fontSize: 16,
    fontWeight: '600',
  },
  activeCheck: {
    backgroundColor: '#059669',
    borderRadius: 8,
    padding: 2,
    position: 'absolute',
    bottom: 4,
    right: 4,
  },
  
  tabContainer: {
    flexDirection: 'row',
    marginBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  tabItem: {
    marginRight: 24,
    paddingBottom: 12,
  },
  tabItemActive: {
    borderBottomWidth: 3,
    borderBottomColor: '#10b981',
  },
  tabText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#9CA3AF',
  },
  tabTextActive: {
    color: '#10b981',
    fontWeight: '700',
  },
  
  planGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    justifyContent: 'space-between',
  },
  planCard: {
    width: (width - 74) / 3, // Grid of 3
    padding: 14,
    borderRadius: 16,
    borderWidth: 1.5,
    minHeight: 120,
    justifyContent: 'space-between',
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    overflow: 'hidden',
  },
  planBadge: {
    position: 'absolute',
    top: 0,
    right: 0,
    backgroundColor: '#EF4444',
    borderBottomLeftRadius: 12,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  planBadgeText: {
    color: 'white',
    fontSize: 10,
    fontWeight: '700',
  },
  planCardName: {
    fontSize: 13,
    fontWeight: '700',
    marginTop: 8,
    marginBottom: 4,
    lineHeight: 17,
  },
  planCardValidity: {
    fontSize: 10,
    marginBottom: 8,
    lineHeight: 14,
  },
  planCardPrice: {
    fontSize: 15,
    fontWeight: '800',
    marginBottom: 3,
    lineHeight: 19,
  },
  planCardOldPrice: {
    fontSize: 10,
    textDecorationLine: 'line-through',
    color: '#9CA3AF',
    lineHeight: 14,
  },

  planSelectedOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 16,
  },

  amountGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  amountBigCard: {
    width: (width - 74) / 3,
    aspectRatio: 1,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 4,
    borderWidth: 1.5,
  },
  amountBigText: {
    fontSize: 16,
    fontWeight: '800',
    marginBottom: 4,
  },
  amountSubText: {
    fontSize: 9,
    textAlign: 'center',
  },
  primaryBtn: {
    height: 58,
    borderRadius: 29,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 16,
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
  },
  primaryBtnText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '700',
  },
  
  // CHECKOUT & RECEIPT
  summaryCard: {
    padding: 24,
    borderRadius: 24,
    marginBottom: 24,
    elevation: 1,
  },
  summaryLabel: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
    marginBottom: 8,
    opacity: 0.7,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  summaryText: {
    fontSize: 18,
    fontWeight: '600',
    maxWidth: '60%',
  },
  summaryPrice: {
    fontSize: 24,
    fontWeight: '800',
  },
  verifiedText: {
    color: '#10b981',
    fontSize: 13,
    fontWeight: '600',
    marginTop: 8,
  },
  methodList: {
    gap: 12,
  },
  methodItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 16,
    borderWidth: 1.5,
  },
  methodText: {
    fontSize: 16,
    fontWeight: '600',
    flex: 1,
    marginLeft: 12,
  },
  successCircle: {
    width: 96,
    height: 96,
    borderRadius: 48,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
    elevation: 8,
    shadowColor: "#10b981",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  successTitle: {
    fontSize: 24,
    fontWeight: '800',
    marginBottom: 8,
    textAlign: 'center',
  },
  successMsg: {
    fontSize: 16,
    textAlign: 'center',
    paddingHorizontal: 32,
    lineHeight: 24,
    opacity: 0.8,
  },
  tokenCard: {
    marginTop: 24,
    padding: 24,
    borderRadius: 20,
    alignItems: 'center',
    width: '100%',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderStyle: 'dashed',
    backgroundColor: '#F9FAFB',
  },
  tokenLabel: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 8,
  },
  tokenCode: {
    fontSize: 28,
    fontWeight: '800',
    letterSpacing: 2,
    textAlign: 'center',
    marginBottom: 16,
  },
  copyBtn: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#E5E7EB',
    borderRadius: 20,
  },
  secondaryBtn: {
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryBtnText: {
    fontSize: 16,
    fontWeight: '600',
  },
  receiptCard: {
    padding: 0, 
    borderRadius: 0,
    elevation: 0,
    backgroundColor: 'transparent',
  },
  receiptPaper: {
    padding: 24,
    borderRadius: 24,
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    marginBottom: 24,
  },
  receiptCheck: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  receiptAmount: {
    fontSize: 32,
    fontWeight: '800',
    marginBottom: 4,
  },
  receiptStatus: {
    fontSize: 14,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  dashedLine: {
    height: 1,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderStyle: 'dashed',
    marginVertical: 24,
    width: '100%',
    borderRadius: 1,
  },
  receiptRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  receiptDetails: {
    paddingVertical: 10,
  },
  receiptLabel: {
    fontSize: 14,
    opacity: 0.6,
  },
  receiptValue: {
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'right',
  },
  receiptFooter: {
    textAlign: 'center',
    fontSize: 12,
    marginTop: 8,
    opacity: 0.5,
  },
  alertBox: {
    flexDirection: 'row',
    padding: 16,
    borderRadius: 12,
    marginBottom: 24,
    gap: 12,
  },
  alertText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
  },
  paymentCard: {
    padding: 24,
    borderRadius: 20,
    marginBottom: 24,
  },
  paymentLabel: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
    marginBottom: 4,
    opacity: 0.7,
  },
  paymentValue: {
    fontSize: 20,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  copyRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  copyIconBtn: {
    padding: 8,
  },
  waitingContainer: {
    alignItems: 'center',
    gap: 8,
    marginBottom: 24,
    flexDirection: 'row',
    justifyContent: 'center',
  },
  waitingText: {
    fontSize: 14,
  },

});
