import React, { useState } from "react";
import { View, Text, TextInput, Pressable, ActivityIndicator, Alert } from "react-native";
import auth from "@react-native-firebase/auth";
import { useNavigation } from "@react-navigation/native";
import { useTheme } from "../contexts/ThemeContext";
import { useAuth } from "../contexts/AuthContext";

export default function LoginScreen() {
  const { colors } = useTheme();
  const navigation = useNavigation<any>();
  const { updateLastLogin } = useAuth();
  
  const [loading, setLoading] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async () => {
    if (!phoneNumber || !password) {
        Alert.alert("Error", "Please fill in all fields.");
        return;
    }
    setLoading(true);

    try {
        const syntheticEmail = `p_${phoneNumber.replace(/\+/g,'').replace(/^0/,'')}@swift.app`;
        // Normalize phone: if no country code, remove leading 0. Ideally should be robust.
        // NOTE: For robustness, ensure we use the same normalization logic as RegisterScreen.
        // Assuming user types 080... or +234... 
        
        let normalizedPhone = phoneNumber.replace(/\s/g, '');
        if (normalizedPhone.startsWith('0')) normalizedPhone = normalizedPhone.substring(1);
        if (normalizedPhone.startsWith('+')) normalizedPhone = normalizedPhone.substring(1);
        if (normalizedPhone.startsWith('234')) normalizedPhone = normalizedPhone.substring(3);
        
        // Let's rely on a simpler convention: the Register screen saves `p_{fullNumber}@swift.app`
        // Register screen uses `+234...` then removes `+`.
        // So `+23480123...` -> `p_23480123...@swift.app`
        
        let loginEmail = syntheticEmail;
        if (phoneNumber.startsWith('0')) {
             loginEmail = `p_234${phoneNumber.substring(1)}@swift.app`;
        } else if (phoneNumber.startsWith('+234')) {
             loginEmail = `p_${phoneNumber.substring(1)}@swift.app`;
        }

        await auth().signInWithEmailAndPassword(loginEmail, password);
        await updateLastLogin();
        // App.tsx handles nav
    } catch (error: any) {
        Alert.alert("Login Failed", "Invalid phone number or password.");
        console.error(error);
    } finally {
        setLoading(false);
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.background, padding: 24, justifyContent: 'center' }}>
        <Text style={{ color: colors.primary, fontSize: 32, fontWeight: 'bold', marginBottom: 8 }}>Swift</Text>
        <Text style={{ color: colors.text, fontSize: 24, fontWeight: '600', marginBottom: 32 }}>Welcome Back</Text>

        <Text style={{ color: colors.textSecondary, marginBottom: 8 }}>Phone Number</Text>
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
            placeholder="08012345678"
            placeholderTextColor={colors.textSecondary}
            keyboardType="phone-pad"
            value={phoneNumber}
            onChangeText={setPhoneNumber}
        />

        <Text style={{ color: colors.textSecondary, marginBottom: 8 }}>Password</Text>
        <TextInput 
            style={{ 
                backgroundColor: colors.surface, 
                color: colors.text, 
                padding: 16, 
                borderRadius: 12, 
                fontSize: 16,
                marginBottom: 32,
                borderWidth: 1,
                borderColor: colors.border
            }}
            placeholder="******"
            placeholderTextColor={colors.textSecondary}
            secureTextEntry
            value={password}
            onChangeText={setPassword}
        />

        <Pressable 
            onPress={handleLogin} 
            disabled={loading}
            style={{ backgroundColor: colors.primary, padding: 16, borderRadius: 12, alignItems: 'center' }}
        >
            {loading ? <ActivityIndicator color="#fff" /> : <Text style={{ color: '#fff', fontWeight: 'bold' }}>Log In</Text>}
        </Pressable>

        <Pressable onPress={() => navigation.navigate('Register')} style={{ marginTop: 24, alignItems: 'center' }}>
            <Text style={{ color: colors.textSecondary }}>
                Don't have an account? <Text style={{ color: colors.primary, fontWeight: 'bold' }}>Create One</Text>
            </Text>
        </Pressable>
    </View>
  );
}
