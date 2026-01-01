/**
 * Initializes and exports Firebase services.
 * Note: React Native Firebase auto-initializes using google-services.json
 */

import { getApp, getApps } from '@react-native-firebase/app';
import auth, { getAuth, connectAuthEmulator } from '@react-native-firebase/auth';
import functions, { getFunctions, connectFunctionsEmulator, httpsCallable } from '@react-native-firebase/functions';
import firestore, { getFirestore, connectFirestoreEmulator } from '@react-native-firebase/firestore';

const isInitialized = () => getApps().length > 0;

// Proper Modular Getters for v22+
export const firebaseAuth = () => getAuth(getApp());
export const firebaseFunctions = () => getFunctions(getApp());
export const firebaseFirestore = () => getFirestore(getApp());

/**
 * Ensures a user is authenticated (anonymously if needed)
 */
export const ensureAuth = async () => {
  const authInstance = firebaseAuth();
  if (!authInstance.currentUser) {
    try {
      console.log("[Firebase] [Auth] Attempting anonymous sign-in...");
      const userCred = await authInstance.signInAnonymously();
      console.log("[Firebase] [Auth] Success! UID:", userCred.user.uid);
      return userCred.user;
    } catch (e: any) {
      console.warn("[Firebase] [Auth] Sign-in failed (common in emulators):", e.message);
      return null;
    }
  }
  return authInstance.currentUser;
};

/**
 * DIAGNOSTIC: Test if the app can reach the PC's specific ports
 */
const diagNetwork = async (host: string) => {
  const port = 5001;
  try {
    const res = await fetch(`http://${host}:${port}/swift-payments-6492e/us-central1/testConnection`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ data: {} })
    });
    console.log(`[Firebase] [Diag] Emulator Network test (Port ${port}): SUCCESS!`);
  } catch (e: any) {
    console.warn(`[Firebase] [Diag] Emulator Network test failed: ${e.message}`);
  }
};

// Use your verified IP
const HOST = "192.168.242.134";

// Connect to Emulators if in development
if (__DEV__) {
  console.log(`[Firebase] [Init] Configuring emulators for host: ${HOST}`);
  
  try {
    const app = getApp();
    // Latest v22+ Modular API usage
    connectAuthEmulator(getAuth(app), `http://${HOST}:9099`);
    connectFunctionsEmulator(getFunctions(app), HOST, 5001);
    connectFirestoreEmulator(getFirestore(app), HOST, 8080);
    
    console.log("[Firebase] [Init] Emulators connected (Auth:9099, Func:5001, FS:8080)");
    diagNetwork(HOST);
  } catch (e: any) {
    console.warn("[Firebase] [Init] Configuration warning (possibly already connected):", e.message);
  }
}

export const callFunction = async (name: string, data: any) => {
  if (!isInitialized()) {
    console.warn(`[Firebase] Function ${name} failed. Falling back to MOCK MODE.`);
    return { success: false, error: "Firebase not initialized" };
  }

  // DIRECT ACCESS IN DEV (TURBO MODE)
  // In development, the Firebase SDK often hits a "1 out of 2 tasks failed" error on emulators.
  // We go straight to the Direct HTTP path to make things instantaneous.
  if (__DEV__) {
    try {
      console.log(`[Firebase] [Turbo] Calling ${name} via direct HTTP...`);
      
      const authInstance = firebaseAuth();
      const token = authInstance.currentUser ? await authInstance.currentUser.getIdToken() : null;
      
      const headers: any = { 'Content-Type': 'application/json' };
      if (token) {
        headers['Authorization'] = `Bearer ${token}`; 
      }

      const response = await fetch(`http://${HOST}:5001/swift-payments-6492e/us-central1/${name}`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ data })
      });
      
      const responseData = await response.json();
      console.log(`[Firebase] [Turbo] ${name} SUCCESS!`);
      return responseData.result; 
    } catch (e: any) {
      console.warn(`[Firebase] [Turbo] Primary path failed, trying SDK as backup:`, e.message);
      // If direct fetch fails (network issue), try the SDK as a backup
    }
  }

  // STANDARD SDK PATH (Production / Fallback)
  try {
    console.log(`[Firebase] [SDK] Calling: ${name}`);
    await ensureAuth();
    
    const func = httpsCallable(firebaseFunctions(), name);
    const result = await func(data);
    return result.data;
  } catch (error: any) {
    // FINAL FALLBACK
    if (!__DEV__) {
       // If we're in PROD and the SDK fails, one more raw attempt as a hail mary
       try {
         const response = await fetch(`https://us-central1-swift-payments-6492e.cloudfunctions.net/${name}`, {
           method: 'POST',
           headers: { 'Content-Type': 'application/json' },
           body: JSON.stringify({ data })
         });
         const responseData = await response.json();
         return responseData.result;
       } catch (e) {
         throw error;
       }
    }
    throw error;
  }
};
