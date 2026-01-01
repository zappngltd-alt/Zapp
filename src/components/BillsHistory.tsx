import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Platform,
  Modal,
  TextInput,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { MaterialIcons as Icon } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
import { useTheme } from "../contexts/ThemeContext";
import { collection, query, orderBy, limit, onSnapshot, where } from "@react-native-firebase/firestore";
import { callFunction, firebaseFirestore, firebaseAuth, ensureAuth } from "../services/firebase";
import { ActivityIndicator, Alert } from "react-native";

export default function BillsHistory({ onBack }: { onBack: () => void }) {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();

   const [transactions, setTransactions] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [verifyingId, setVerifyingId] = React.useState<string | null>(null);
  const [selectedTx, setSelectedTx] = React.useState<any | null>(null);
  const [searchQuery, setSearchQuery] = React.useState("");

  const groupTransactionsByDate = (txs: any[]) => {
    const groups: { [key: string]: any[] } = {};
    const today = new Date().toDateString();
    const yesterday = new Date(Date.now() - 86400000).toDateString();

    txs.forEach(tx => {
      let dateKey = tx.createdAt?.toDate ? tx.createdAt.toDate().toDateString() : new Date().toDateString();
      
      let title = dateKey;
      if (dateKey === today) title = "Today";
      else if (dateKey === yesterday) title = "Yesterday";
      else {
        const d = new Date(dateKey);
        title = d.toLocaleDateString(undefined, { weekday: 'long', day: 'numeric', month: 'long' });
      }

      if (!groups[title]) groups[title] = [];
      groups[title].push(tx);
    });

    return Object.keys(groups).map(title => ({
      title,
      data: groups[title]
    }));
  };

  const filteredTransactions = transactions.filter(tx => {
    const q = searchQuery.toLowerCase();
    return (
      tx.provider.toLowerCase().includes(q) ||
      tx.type.toLowerCase().includes(q) ||
      (tx.details?.phone && tx.details.phone.includes(q)) ||
      (tx.details?.meter && tx.details.meter.includes(q))
    );
  });

  const groupedTransactions = groupTransactionsByDate(filteredTransactions);

  const handleVerify = async (txRef: string) => {
    setVerifyingId(txRef);
    try {
      console.log(`[History] Verifying status for: ${txRef}`);
      const result = await callFunction("verifyPayment", { txRef }) as any;
      if (result.success && result.status === "PAID") {
        Alert.alert("Success", "Payment verified! Your order is being processed.");
      } else {
        Alert.alert("Notice", result.message || "Payment not yet detected.");
      }
    } catch (e: any) {
      console.error("[History] Verify Error:", e);
      Alert.alert("Error", "Failed to reach verification server.");
    } finally {
      setVerifyingId(null);
    }
  };

  React.useEffect(() => {
    const fetchUserHistory = async () => {
      let user = firebaseAuth().currentUser;
      if (!user) user = await ensureAuth();
      if (!user) {
        setLoading(false);
        return;
      }

      console.log(`[History] Fetching history for user: ${user.uid}`);

      const q = query(
        collection(firebaseFirestore(), "transactions"),
        where("userId", "==", user.uid),
        orderBy("createdAt", "desc"),
        limit(50)
      );

      return onSnapshot(q, (snapshot) => {
          const txs: any[] = [];
          snapshot.forEach((doc) => {
            const data = doc.data();
            txs.push({
              id: doc.id,
              ...data,
              type: data.category === 'electricity' ? 'Electricity' 
                     : data.category === 'data' ? 'Data' 
                     : data.category === 'airtime' ? 'Airtime' : 'Cable TV',
              provider: data.provider || "Unknown Provider",
              amount: `₦${data.amount}`,
              date: data.createdAt?.toDate ? data.createdAt.toDate().toLocaleString() : "Just now",
              status: data.status === 'VENDED' ? 'Success' 
                       : data.status === 'VENDING_FAILED' ? 'Failed' 
                       : data.status === 'PAID' ? 'Processing' 
                       : 'Unpaid',
              icon: data.category === 'electricity' ? 'bolt' 
                     : data.category === 'data' ? 'wifi' 
                     : data.category === 'airtime' ? 'phone-android' : 'tv',
              color: data.category === 'electricity' ? '#f59e0b' 
                     : data.category === 'data' ? '#3b82f6' 
                     : data.category === 'airtime' ? '#10b981' : '#8b5cf6',
            });
          });
          setTransactions(txs);
          setLoading(false);
        }, (err) => {
          console.error("History Fetch Error:", err);
          setLoading(false);
        });
    };

    let unsub: (() => void) | undefined;
    fetchUserHistory().then(u => { unsub = u; });

    return () => unsub?.();
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Success': return '#10b981';
      case 'Processing': return '#f59e0b';
      case 'Failed': return '#ef4444';
      default: return colors.textSecondary;
    }
  };

  const getStatusBg = (status: string) => {
    switch (status) {
      case 'Success': return '#10b98120';
      case 'Processing': return '#f59e0b20';
      case 'Failed': return '#ef444420';
      default: return colors.background;
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[
        styles.header, 
        { 
          paddingTop: Platform.OS === 'android' ? Math.max(insets.top, 30) : insets.top + 10 
        }
      ]}>
        <Pressable onPress={onBack} style={[styles.backBtn, { backgroundColor: colors.surface }]}>
          <Icon name="arrow-back" size={24} color={colors.text} />
        </Pressable>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Bills History</Text>
        <View style={{ width: 44 }} />
      </View>

      <View style={{ paddingHorizontal: 20, marginBottom: 16 }}>
        <View style={[styles.searchContainer, { backgroundColor: colors.surface, borderColor: colors.border, borderWidth: 1 }]}>
          <Icon name="search" size={20} color={colors.textSecondary} />
          <TextInput
            style={[styles.searchInput, { color: colors.text }]}
            placeholder="Search provider or recipient..."
            placeholderTextColor={colors.textSecondary}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery !== "" && (
            <Pressable onPress={() => setSearchQuery("")}>
              <Icon name="close" size={18} color={colors.textSecondary} />
            </Pressable>
          )}
        </View>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {loading ? (
             <ActivityIndicator size="large" color={colors.primary} style={{ marginTop: 40 }} />
        ) : filteredTransactions.length === 0 ? (
             <View style={{ alignItems: 'center', marginTop: 100 }}>
               <Icon name="search-off" size={64} color={colors.border} />
               <Text style={{ color: colors.textSecondary, marginTop: 16 }}>No matching transactions.</Text>
             </View>
        ) : (
          groupedTransactions.map((group) => (
            <View key={group.title} style={{ marginBottom: 20 }}>
              <Text style={[styles.dateHeader, { color: colors.textSecondary }]}>{group.title}</Text>
              {group.data.map((tx) => (
                <Pressable 
                  key={tx.id} 
                  style={[styles.txCard, { backgroundColor: colors.surface }]}
                  onPress={() => setSelectedTx(tx)}
                >
                  <View style={[styles.iconContainer, { backgroundColor: tx.color + '20' }]}>
                    <Icon name={tx.icon as any} size={24} color={tx.color} />
                  </View>
                  
                  <View style={styles.txInfo}>
                    <View style={styles.txHeader}>
                      <Text style={[styles.txType, { color: colors.text }]}>{tx.provider}</Text>
                      <Text style={[styles.txAmount, { color: colors.text }]}>{tx.amount}</Text>
                    </View>
                    
                    <Text style={[styles.txDate, { color: colors.textSecondary }]}>{tx.date}</Text>
                    
                    <View style={styles.txFooter}>
                      <View style={[styles.statusBadge, { 
                          backgroundColor: getStatusBg(tx.status)
                      }]}>
                        <Text style={[styles.statusText, { 
                            color: getStatusColor(tx.status)
                        }]}>
                          {tx.status}
                        </Text>
                      </View>
                      
                      <View style={{ flexDirection: 'row', gap: 12, alignItems: 'center' }}>
                        {tx.status === 'Unpaid' && (
                          <Pressable 
                            onPress={() => handleVerify(tx.txRef || tx.id)}
                            disabled={verifyingId === (tx.txRef || tx.id)}
                            style={{ backgroundColor: colors.primary + '15', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 6 }}
                          >
                            {verifyingId === (tx.txRef || tx.id) ? (
                              <ActivityIndicator size="small" color={colors.primary} />
                            ) : (
                              <Text style={{ color: colors.primary, fontWeight: '700', fontSize: 13 }}>Verify</Text>
                            )}
                          </Pressable>
                        )}
                        <Icon name="chevron-right" size={20} color={colors.textSecondary} />
                      </View>
                    </View>
                  </View>
                </Pressable>
              ))}
            </View>
          ))
        )}
        
        <View style={{ height: 40 }} />
      </ScrollView>

      {/* Receipt Details Modal */}
      <Modal
        visible={!!selectedTx}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setSelectedTx(null)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContentReceipt, { backgroundColor: colors.background }]}>
            <View style={[styles.modalHeader, { paddingHorizontal: 20 }]}>
              <Text style={[styles.modalTitle, { color: colors.text }]}>Transaction Detail</Text>
              <Pressable onPress={() => setSelectedTx(null)}>
                <Icon name="close" size={24} color={colors.text} />
              </Pressable>
            </View>

            <ScrollView contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 10, paddingBottom: 40 }}>
              <View style={[styles.receiptPaper, { backgroundColor: colors.surface, borderRadius: 4, elevation: 4, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 10 }]}>
                {/* Receipt Content */}
                <View style={{ padding: 24 }}>
                  <View style={{ alignItems: 'center', marginBottom: 24 }}>
                    <View style={[styles.receiptCheck, { backgroundColor: getStatusColor(selectedTx?.status), width: 50, height: 50, borderRadius: 25, justifyContent: 'center', alignItems: 'center', marginBottom: 12 }]}>
                      <Icon name={selectedTx?.status === 'Success' ? "check" : selectedTx?.status === 'Failed' ? "close" : "access-time"} size={30} color="white" />
                    </View>
                    <Text style={[styles.receiptStatus, { color: getStatusColor(selectedTx?.status), fontWeight: '700', fontSize: 16, textTransform: 'uppercase' }]}>{selectedTx?.status}</Text>
                    <Text style={[styles.receiptAmount, { color: colors.text, fontSize: 32, fontWeight: '800', marginTop: 8 }]}>
                      {selectedTx?.amount}
                    </Text>
                  </View>

                  <View style={[styles.divider, { marginVertical: 20, backgroundColor: colors.border, height: 1, borderStyle: 'dashed', opacity: 0.5 }]} />

                  <View style={styles.receiptDetails}>
                    {[
                      { label: "Service", value: selectedTx?.type || "Payment" },
                      { label: "Provider", value: selectedTx?.provider || "Zapp" },
                      { 
                        label: selectedTx?.category === "electricity" || selectedTx?.category === "tv" ? "Account/Meter" : "Recipient", 
                        value: selectedTx?.details?.meter || selectedTx?.details?.phone || "N/A"
                      },
                      { label: "Date", value: selectedTx?.date },
                      { label: "Reference", value: selectedTx?.txRef || selectedTx?.id || "N/A", monospaced: true },
                      { label: "Status", value: selectedTx?.status },
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

                    {selectedTx?.token && (
                      <View style={{ marginTop: 8, padding: 16, backgroundColor: colors.background, borderRadius: 8 }}>
                        <Text style={{ color: colors.textSecondary, fontSize: 12, marginBottom: 4 }}>TOKEN / PIN</Text>
                        <Text style={{ color: colors.primary, fontSize: 18, fontWeight: '800', letterSpacing: 2 }}>
                          {selectedTx.token}
                        </Text>
                      </View>
                    )}
                  </View>

                  <View style={[styles.divider, { marginTop: 30, marginBottom: 20, backgroundColor: colors.border, height: 1, borderStyle: 'dashed', opacity: 0.5 }]} />
                  
                  <View style={{ alignItems: 'center' }}>
                    <Text style={{ color: colors.textSecondary, fontSize: 12 }}>Zapp Payments Receipt</Text>
                    <Text style={{ color: colors.textSecondary, fontSize: 10, marginTop: 4 }}>Transaction Ref: {selectedTx?.txRef || selectedTx?.id}</Text>
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
                        backgroundColor: colors.background, 
                        borderRadius: 10,
                        marginTop: -10
                      }} 
                    />
                  ))}
                </View>
              </View>

              <Pressable 
                style={[styles.primaryBtn, { backgroundColor: colors.primary, marginTop: 40, borderRadius: 16 }]}
                onPress={() => setSelectedTx(null)}
              >
                <Text style={styles.primaryBtnText}>Download Receipt</Text>
              </Pressable>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  backBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '800',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  txCard: {
    flexDirection: 'row',
    padding: 16,
    borderRadius: 24,
    marginBottom: 16,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
  },
  iconContainer: {
    width: 52,
    height: 52,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  txInfo: {
    flex: 1,
  },
  txHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  txType: {
    fontSize: 16,
    fontWeight: '700',
  },
  txAmount: {
    fontSize: 16,
    fontWeight: '800',
  },
  txDate: {
    fontSize: 12,
    marginTop: 4,
  },
  tokenBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
    marginTop: 10,
    gap: 8,
  },
  tokenText: {
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  txFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 14,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContentReceipt: {
    height: '90%',
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    paddingTop: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '800',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: 16,
  },
  receiptPaper: {
    marginTop: 20,
    overflow: 'hidden',
    paddingBottom: 20,
  },
  receiptCheck: {
    // Styles moved inline for dynamic color
  },
  receiptStatus: {
    // Styles moved inline
  },
  receiptAmount: {
    // Styles moved inline
  },
  divider: {
    // Styles moved inline
  },
  receiptDetails: {
    // Styles moved inline
  },
  primaryBtn: {
    paddingVertical: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryBtnText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '700',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    height: 52,
    borderRadius: 16,
    gap: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    fontWeight: '500',
    padding: 0,
  },
  dateHeader: {
    fontSize: 13,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 12,
    marginTop: 8,
  },
});
