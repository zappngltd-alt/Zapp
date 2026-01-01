import { Linking, Platform, PermissionsAndroid, Alert, NativeModules } from 'react-native';
import { useCallback } from 'react';
import Toast from 'react-native-toast-message';
import * as IntentLauncher from 'expo-intent-launcher';

const { USSDModule } = NativeModules;

export const useUSSD = () => {
  const dial = useCallback(async (code: string, simSlot: number = -1) => {
    try {
      // Encode the USSD code for tel: URI (replace # with %23)
      const encodedCode = code.replace(/#/g, '%23');
      
      if (Platform.OS === 'android') {
        try {
          // First, try to use the native USSDModule for reliable SIM selection
          if (USSDModule && simSlot !== -1) {
            try {
              const result = await USSDModule.dialUssdWithSim(code, simSlot);
              console.log('Native USSD dial result:', result);
              // Native module handles permission requests internally
              return;
            } catch (nativeError) {
              console.warn('Native USSD module failed, falling back to IntentLauncher:', nativeError);
              // Fall through to IntentLauncher fallback
            }
          }

          // Fallback: Use IntentLauncher approach (original implementation)
          const granted = await PermissionsAndroid.request(
            PermissionsAndroid.PERMISSIONS.CALL_PHONE,
            {
              title: 'Phone Call Permission',
              message: 'This app needs access to make phone calls to dial USSD codes directly.',
              buttonNeutral: 'Ask Me Later',
              buttonNegative: 'Cancel',
              buttonPositive: 'OK',
            },
          );
          
          if (granted === PermissionsAndroid.RESULTS.GRANTED) {
            // Prepare extras for SIM selection
            // Note: simSlot is expected to be 0 for SIM 1, 1 for SIM 2
            const extras: Record<string, any> = {
              data: `tel:${encodedCode}`,
            };

            if (simSlot !== -1) {
              // Standard Android extra (supported on many modern devices)
              extras['com.android.phone.extra.slot'] = simSlot;
              extras['simSlot'] = simSlot;
              extras['slot'] = simSlot;
              
              // Standard Android Subscription ID (often required for newer APIs)
              // Since we don't have the subscription ID, we try to pass slot as index
              extras['android.telecom.extra.PHONE_ACCOUNT_HANDLE'] = simSlot;
              
              // Manufacturer specific extras
              // Samsung
              extras['com.samsung.android.extra.DIAL_SIM_CARD'] = simSlot;
              extras['sim_slot'] = simSlot;
              
              // dual_sim_mode
              extras['com.android.phone.DialingMode'] = 'dual_sim';
              
              // MTK (MediaTek) devices
              extras['com.android.phone.extra.SIM_CONFIG_RESID'] = simSlot;
              
              // Huawei
              extras['subscription'] = simSlot;
              
              // Generic / Other manufacturers
              extras['phone'] = simSlot;
              extras['extra_asus_dial_use_dualsim'] = true;
              extras['extra_asus_dial_use_dualsim_slot'] = simSlot;
            }

            // Direct dial using ACTION_CALL
            await IntentLauncher.startActivityAsync('android.intent.action.CALL', extras);
          } else {
            // Permission denied, fallback to ACTION_DIAL (Linking.openURL)
            console.log('Call permission denied, falling back to dialer');
            await Linking.openURL(`tel:${encodedCode}`);
          }
        } catch (err) {
          console.warn(err);
          // Fallback on error
          await Linking.openURL(`tel:${encodedCode}`);
        }
      } else {
        // iOS or other platforms
        await Linking.openURL(`tel:${encodedCode}`);
      }
    } catch (error) {
      console.error('Dialing error:', error);
      
      // Show user-friendly error message
      Toast.show({
        type: 'error',
        text1: 'Unable to Dial',
        text2: 'Please check if your device supports phone calls',
        visibilityTime: 3000,
      });
      
      throw error;
    }
  }, []);

  return { dial };
};
