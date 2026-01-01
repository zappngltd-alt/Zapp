import React, { useState, useRef } from "react";
import { View, Text, TextInput, Pressable, ActivityIndicator, Alert, KeyboardAvoidingView, Platform, ScrollView } from "react-native";
import auth, { FirebaseAuthTypes } from "@react-native-firebase/auth";
import { MaterialIcons as Icon } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { useTheme } from "../contexts/ThemeContext";
import { useTranslation } from "react-i18next";
import { useAuth } from "../contexts/AuthContext";

export default function RegisterScreen() {
  const { colors } = useTheme();
  const { t } = useTranslation();
  const navigation = useNavigation<any>();
  const { updateLastLogin } = useAuth();
  
  const [step, setStep] = useState<1 | 2 | 3>(1); // 1: Phone, 2: OTP, 3: Password
  const [loading, setLoading] = useState(false);
  
  // Data
  const [phoneNumber, setPhoneNumber] = useState("");
  const [verificationCode, setVerificationCode] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [confirmResult, setConfirmResult] = useState<FirebaseAuthTypes.ConfirmationResult | null>(null);

  // Step 1: Send OTP
  const sendCode = async () => {
    if (phoneNumber.length < 10) {
        Alert.alert("Error", "Please enter a valid phone number.");
        return;
    }
    setLoading(true);
    try {
        const fullPhone = phoneNumber.startsWith('+') ? phoneNumber : `+234${phoneNumber.replace(/^0/, '')}`;
        console.log(`[RegisterScreen] Requesting OTP for: ${fullPhone}`); // DEBUG
        const confirmation = await auth().signInWithPhoneNumber(fullPhone);
        console.log(`[RegisterScreen] OTP Sent. Confirmation Object:`, !!confirmation); // DEBUG
        setConfirmResult(confirmation);
        setStep(2);
    } catch (error: any) {
        Alert.alert("Failed to send code", error.message);
    } finally {
        setLoading(false);
    }
  };

  // Step 2: Verify OTP
  const verifyCode = async () => {
    console.log(`[RegisterScreen] Verifying code: '${verificationCode}'`); // DEBUG
    if (verificationCode.length !== 6) {
        Alert.alert("Error", "Code must be 6 digits.");
        return;
    }
    setLoading(true);
    try {
        console.log(`[RegisterScreen] Confirming with result object:`, !!confirmResult); // DEBUG
        if (!confirmResult) throw new Error("No confirmation result found. Please resend code.");
        
        const res = await confirmResult.confirm(verificationCode);
        console.log(`[RegisterScreen] Verification success! User:`, res?.user?.uid); // DEBUG
        setStep(3);
    } catch (error: any) {
        console.error(`[RegisterScreen] Verification Failed:`, error); // DEBUG
        console.error(`[RegisterScreen] Error Code:`, error.code); // DEBUG
        console.error(`[RegisterScreen] Error Message:`, error.message); // DEBUG
        Alert.alert("Verification Failed", `Invalid code. Details: ${error.message}`);
    } finally {
        setLoading(false);
    }
  };

  // Step 3: Setup Password & Link
  const setupPassword = async () => {
    if (password.length < 6) {
        Alert.alert("Error", "Password must be at least 6 characters.");
        return;
    }
    if (password !== confirmPassword) {
        Alert.alert("Error", "Passwords do not match.");
        return;
    }

    setLoading(true);
    try {
        const currentUser = auth().currentUser;
        if (!currentUser) throw new Error("No user found.");

        // Construct a synthetic email for the Phone+Password credential
        const syntheticEmail = `p_${phoneNumber.replace(/\+/g,'')}@swift.app`;
        
        // Link Email/Password credential
        const credential = auth.EmailAuthProvider.credential(syntheticEmail, password);
        await currentUser.linkWithCredential(credential);
        
        // Update user state and finish
        await updateLastLogin();
        // Navigation is handled by App.tsx detecting user change
    } catch (error: any) {
        // If email already in use (e.g. re-registering), try updating instead
        if (error.code === 'auth/email-already-in-use' || error.code === 'auth/credential-already-linked') {
             try {
                 const syntheticEmail = `p_${phoneNumber.replace(/\+/g,'')}@swift.app`;
                 await auth().currentUser?.updateEmail(syntheticEmail);
                 await auth().currentUser?.updatePassword(password);
                 await updateLastLogin();
             } catch (e: any) {
                 Alert.alert("Setup Failed", e.message);
             }
        } else {
             Alert.alert("Error", error.message);
        }
    } finally {
        setLoading(false);
    }
  };

  const renderCurrentStep = () => {
      switch(step) {
          case 1:
              return (
                <View>
                    <Text style={{ color: colors.textSecondary, marginBottom: 8 }}>Phone Number</Text>
                    <TextInput 
                        style={{ 
                            backgroundColor: colors.surface, 
                            color: colors.text, 
                            padding: 16, 
                            borderRadius: 12, 
                            fontSize: 16,
                            marginBottom: 24,
                            borderWidth: 1,
                            borderColor: colors.border
                        }}
                        placeholder="08012345678"
                        placeholderTextColor={colors.textSecondary}
                        keyboardType="phone-pad"
                        value={phoneNumber}
                        onChangeText={setPhoneNumber}
                    />
                    <Pressable 
                        onPress={sendCode} 
                        disabled={loading}
                        style={{ backgroundColor: colors.primary, padding: 16, borderRadius: 12, alignItems: 'center' }}
                    >
                        {loading ? <ActivityIndicator color="#fff" /> : <Text style={{ color: '#fff', fontWeight: 'bold' }}>Send Code</Text>}
                    </Pressable>
                </View>
              );
          case 2:
               return (
                <View>
                    <Text style={{ color: colors.text, fontSize: 18, marginBottom: 8, textAlign: 'center' }}>Verify {phoneNumber}</Text>
                    <Text style={{ color: colors.textSecondary, marginBottom: 24, textAlign: 'center' }}>Enter the 6-digit code sent to your phone.</Text>
                    
                    <TextInput 
                        style={{ 
                            backgroundColor: colors.surface, 
                            color: colors.text, 
                            padding: 16, 
                            borderRadius: 12, 
                            fontSize: 24,
                            marginBottom: 24,
                            borderWidth: 1,
                            borderColor: colors.border,
                            textAlign: 'center',
                            letterSpacing: 8
                        }}
                        placeholder="000000"
                        placeholderTextColor={colors.textSecondary}
                        keyboardType="number-pad"
                        maxLength={6}
                        value={verificationCode}
                        onChangeText={setVerificationCode}
                    />
                     <Pressable 
                        onPress={verifyCode} 
                        disabled={loading}
                        style={{ backgroundColor: colors.primary, padding: 16, borderRadius: 12, alignItems: 'center' }}
                    >
                        {loading ? <ActivityIndicator color="#fff" /> : <Text style={{ color: '#fff', fontWeight: 'bold' }}>Verify</Text>}
                    </Pressable>
                </View>
               );
          case 3:
              return (
                <View>
                    <Text style={{ color: colors.text, fontSize: 18, marginBottom: 16, textAlign: 'center' }}>Setup Password</Text>
                    
                    <Text style={{ color: colors.textSecondary, marginBottom: 8 }}>Password</Text>
                    <TextInput 
                        style={{ 
                            backgroundColor: colors.surface, 
                            color: colors.text, 
                            padding: 16, 
                            borderRadius: 12, 
                            fontSize: 16,
                            marginBottom: 16,
                            borderWidth: 1,
                            borderColor: colors.border
                        }}
                        secureTextEntry
                        value={password}
                        onChangeText={setPassword}
                    />
                    
                    <Text style={{ color: colors.textSecondary, marginBottom: 8 }}>Confirm Password</Text>
                    <TextInput 
                        style={{ 
                            backgroundColor: colors.surface, 
                            color: colors.text, 
                            padding: 16, 
                            borderRadius: 12, 
                            fontSize: 16,
                            marginBottom: 24,
                            borderWidth: 1,
                            borderColor: colors.border
                        }}
                        secureTextEntry
                        value={confirmPassword}
                        onChangeText={setConfirmPassword}
                    />

                    <Pressable 
                        onPress={setupPassword} 
                        disabled={loading}
                        style={{ backgroundColor: colors.primary, padding: 16, borderRadius: 12, alignItems: 'center' }}
                    >
                        {loading ? <ActivityIndicator color="#fff" /> : <Text style={{ color: '#fff', fontWeight: 'bold' }}>Finish Setup</Text>}
                    </Pressable>
                </View>
              );
      }
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.background, padding: 24, justifyContent: 'center' }}>
        <Text style={{ color: colors.primary, fontSize: 32, fontWeight: 'bold', marginBottom: 8 }}>Swift</Text>
        <Text style={{ color: colors.text, fontSize: 24, fontWeight: '600', marginBottom: 32 }}>Create Account</Text>
        
        {renderCurrentStep()}

        <Pressable onPress={() => navigation.navigate('Login')} style={{ marginTop: 24, alignItems: 'center' }}>
            <Text style={{ color: colors.textSecondary }}>
                Already have an account? <Text style={{ color: colors.primary, fontWeight: 'bold' }}>Log In</Text>
            </Text>
        </Pressable>
    </View>
  );
}
