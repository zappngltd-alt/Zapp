import React from 'react';
import { View, StyleSheet, Modal, ActivityIndicator, Pressable, Text } from 'react-native';
import { WebView } from 'react-native-webview';
import { MaterialIcons as Icon } from '@expo/vector-icons';
import { useTheme } from '../contexts/ThemeContext';

interface PaymentWebViewProps {
  visible: boolean;
  url: string;
  txRef: string;
  onClose: () => void;
  onSuccess: () => void;
  onFailure: (error: string) => void;
}

export default function PaymentWebView({ visible, url, txRef, onClose, onSuccess, onFailure }: PaymentWebViewProps) {
  const { colors } = useTheme();
  
  // Use a ref to ensure onSuccess is strictly called once per mount
  const hasTriggeredRef = React.useRef(false);

  const handleNavigationStateChange = (navState: any) => {
    const currentUrl = navState.url;
    const pageTitle = navState.title || '';
    
    console.log(`[WebView URL] ${currentUrl} | Title: ${pageTitle}`);
    
    // Detect Paystack success - looking for redirects after successful payment
    const isSuccessUrl = currentUrl.includes('trxref=') || currentUrl.includes('reference=') || currentUrl.includes('paystack.co/close');
    
    if (isSuccessUrl && !hasTriggeredRef.current) {
        console.log(`[PaymentWebView] SUCCESS REDIRECT MATCH: ${currentUrl}`);
        hasTriggeredRef.current = true;
        onSuccess();
    }
    
    // Detect explicit failure/cancellation
    if (currentUrl.includes('cancel') || currentUrl.includes('failed')) {
      console.log('[PaymentWebView] Failure detected in URL');
      onFailure('Payment was cancelled or failed.');
    }
  };

  return (
    <Modal 
      visible={visible} 
      animationType="slide" 
      transparent={false}
      onRequestClose={onClose}
    >
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={[styles.header, { borderBottomColor: colors.border }]}>
          <Pressable onPress={onClose} style={styles.closeBtn}>
            <Icon name="close" size={24} color={colors.text} />
          </Pressable>
          <Text style={[styles.title, { color: colors.text }]}>Secure Payment</Text>
          <Pressable 
            onPress={onClose} 
            style={({pressed}) => [
              styles.doneBtn, 
              { opacity: pressed ? 0.7 : 1, backgroundColor: colors.primary + '20' }
            ]}>
            <Text style={[styles.doneText, { color: colors.primary }]}>Close</Text>
          </Pressable>
        </View>

        <WebView
          source={{ uri: url }}
          onNavigationStateChange={handleNavigationStateChange}
          injectedJavaScript={`true;`}
          onLoadEnd={(syntheticEvent) => {
            const { nativeEvent } = syntheticEvent;
            if (nativeEvent.url?.includes('paystack.co/close') || nativeEvent.url?.includes('trxref=')) {
                if (!hasTriggeredRef.current) {
                    console.log('[PaymentWebView] Success detected in LoadEnd via URL');
                    hasTriggeredRef.current = true;
                    onSuccess();
                }
            }
          }}
          startInLoadingState={true}
          renderLoading={() => (
            <View style={styles.loading}>
              <ActivityIndicator color={colors.primary} size="large" />
            </View>
          )}
        />
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    height: 60,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    borderBottomWidth: 1,
  },
  closeBtn: {
    padding: 8,
  },
  doneBtn: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  doneText: {
    fontWeight: '700',
    fontSize: 14,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
  },
  loading: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.8)',
  },
});
