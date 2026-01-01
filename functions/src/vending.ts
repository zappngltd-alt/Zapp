import axios from "axios";
import * as logger from "firebase-functions/logger";
import { getFirestore, FieldValue } from "firebase-admin/firestore";
import { retryWithBackoff } from "./utils/retry.js";

// VTpass Configuration
const VTPASS_API_URL = process.env.VTPASS_API_URL || "https://sandbox.vtpass.com/api";
const VTPASS_API_KEY = process.env.VTPASS_API_KEY || "db759d72a1e91d3a9062e8fd2c8c3c78";
const VTPASS_SECRET_KEY = process.env.VTPASS_SECRET_KEY || "SK_9547906545c59b3fe90a8f2e365e8a746f864a39af9";

interface VendingResult {
  success: boolean;
  token?: string;
  error?: string;
  raw?: any;
}

/**
 * Generates a legit VTpass Request ID (YYYYMMDDHHIIstring)
 */
function generateRequestId(txRef: string) {
  const now = new Date();
  const dateStr = now.getFullYear() +
    String(now.getMonth() + 1).padStart(2, '0') +
    String(now.getDate()).padStart(2, '0') +
    String(now.getHours()).padStart(2, '0') +
    String(now.getMinutes()).padStart(2, '0');
  
  // Suffix: Use last 8 chars of txRef or random
  const suffix = txRef.replace(/[^a-zA-Z0-9]/g, "").slice(-8);
  return dateStr + suffix;
}

/**
 * Main engine that delegates vending to VTpass or ClubKonnect.
 */
export async function handleVending(txRef: string) {
  const txDoc = await getFirestore().collection("transactions").doc(txRef).get();

  if (!txDoc.exists) {
    logger.error(`Transaction ${txRef} not found for vending.`);
    return;
  }

  const txData = txDoc.data();
  if (txData?.status === "VENDED") return; // Avoid double vending

  try {
    let vendingResult: VendingResult;

    if (txData?.category === "data") {
      vendingResult = await vendData(txData);
    } else if (txData?.category === "electricity") {
      vendingResult = await vendElectricity(txData);
    } else if (txData?.category === "airtime") {
      vendingResult = await vendAirtime(txData);
    } else if (txData?.category === "tv") {
      vendingResult = await vendTv(txData);
    } else {
      logger.error(`Unknown category: ${txData?.category}`);
      return;
    }

    if (vendingResult.success) {
      await txDoc.ref.update({
        status: "VENDED",
        vendedAt: FieldValue.serverTimestamp(),
        token: vendingResult.token || null,
        vendorResponse: vendingResult.raw,
      });
      logger.info(`Successfully vended ${txData?.category} for ref: ${txRef}`);
    } else {
      await txDoc.ref.update({status: "VENDING_FAILED", error: vendingResult.error});
      logger.error(`Vending failed for ref: ${txRef}`, vendingResult.error);
    }
  } catch (error) {
    logger.error(`Critical error in vending engine for ref: ${txRef}`, error);
    await txDoc.ref.update({status: "VENDING_ERROR"});
  }
}

async function vendData(tx: any): Promise<VendingResult> {
  const phone = tx.details.phone;
  const network = tx.details.network;
  const productId = tx.details.productId;
  
  logger.info(`[vendData] START: Vending ${productId} to ${phone} via ${network}`);
  
  try {
    const requestId = generateRequestId(tx.txRef);
    const serviceID = network.toLowerCase().includes("mtn") ? "mtn-data" : 
                    network.toLowerCase().includes("airtel") ? "airtel-data" :
                    network.toLowerCase().includes("glo") ? "glo-data" : 
                    network.toLowerCase().includes("etisalat") ? "etisalat-data" : `${network.toLowerCase()}-data`;

    const payload = {
      request_id: requestId,
      serviceID: serviceID,
      billersCode: phone,
      variation_code: productId, 
      amount: tx.amount,
      phone: phone,
    };

    logger.info(`[vendData] VTPass Payload:`, payload);

    const response = await retryWithBackoff(() => axios.post(`${VTPASS_API_URL}/pay`, payload, {
      headers: {
        "api-key": VTPASS_API_KEY,
        "secret-key": VTPASS_SECRET_KEY,
      },
      timeout: 30000, 
    }));

    const data = response.data;
    logger.info(`[vendData] VTPass Response Code: ${data.code}`, data);

    if (data.code === "000") {
      logger.info(`[vendData] SUCCESS for ${tx.txRef}`);
      return { success: true, raw: data };
    } 
    
    // SANDBOX BYPASS
    if (VTPASS_API_URL.includes("sandbox") && (data.code === "028" || data.code === "011" || data.code === "016")) {
       logger.warn(`[vendData] BYPASSING VTpass Error ${data.code} for Sandbox testing.`);
       return { 
         success: true, 
         token: "MOCK-DATA-BYPASS",
         raw: { ...data, response_description: `SANDBOX BYPASS (${data.code})` } 
       };
    }
    
    return {
      success: false,
      error: data.response_description || `Vendor Error ${data.code}`,
      raw: data,
    };
  } catch (error: any) {
    logger.error("[vendData] API Error:", error.response?.data || error.message);
    return {
      success: false,
      error: error.response?.data?.response_description || error.message,
    };
  }
}

async function vendAirtime(tx: any): Promise<VendingResult> {
  const phone = tx.details.phone;
  const network = tx.details.network;

  logger.info(`[vendAirtime] START: Vending ${tx.amount} Airtime to ${phone} via ${network}`);

  try {
    const requestId = generateRequestId(tx.txRef);
    // For Airtime, use just the network name (e.g., 'mtn') or check docs.
    // Usually 'mtn', 'airtel', 'glo', 'etisalat'
    const serviceID = network.toLowerCase().includes("mtn") ? "mtn" : 
                    network.toLowerCase().includes("airtel") ? "airtel" :
                    network.toLowerCase().includes("glo") ? "glo" : 
                    network.toLowerCase().includes("etisalat") ? "etisalat" : network.toLowerCase();

    const payload = {
      request_id: requestId,
      serviceID: serviceID,
      billersCode: phone,
      amount: tx.amount,
      phone: phone,
    };

    logger.info(`[vendAirtime] VTPass Payload:`, payload);

    const response = await retryWithBackoff(() => axios.post(`${VTPASS_API_URL}/pay`, payload, {
      headers: {
        "api-key": VTPASS_API_KEY,
        "secret-key": VTPASS_SECRET_KEY,
      },
      timeout: 30000,
    }));

    const data = response.data;
    logger.info(`[vendAirtime] VTPass Response Code: ${data.code}`, data);

    if (data.code === "000") {
        return { success: true, raw: data };
    }

    // SANDBOX BYPASS
    if (VTPASS_API_URL.includes("sandbox") && (data.code === "028" || data.code === "011")) {
       logger.warn(`[vendAirtime] BYPASSING VTpass Error ${data.code} for Sandbox.`);
       return { 
         success: true, 
         token: "MOCK-AIRTIME-SUCCESS",
         raw: { ...data, response_description: `SANDBOX BYPASS (${data.code})` } 
       };
    }

    return {
      success: false,
      error: data.response_description || `Vendor Error ${data.code}`,
      raw: data,
    };
  } catch (error: any) {
    logger.error("[vendAirtime] API Error:", error.response?.data || error.message);
    return {
      success: false,
      error: error.response?.data?.response_description || error.message,
    };
  }
}

async function vendTv(tx: any): Promise<VendingResult> {
  const smartCard = tx.details.meter || tx.details.phone; // Assuming meter field used for SmartCard
  const provider = tx.details.network; // e.g. DSTV, GOTV
  const productId = tx.details.productId; // e.g. dstv-padi

  logger.info(`[vendTv] START: Vending ${productId} to ${smartCard} via ${provider}`);

  try {
    const requestId = generateRequestId(tx.txRef);
    const serviceID = provider.toLowerCase().includes("dstv") ? "dstv" : 
                    provider.toLowerCase().includes("gotv") ? "gotv" : 
                    provider.toLowerCase().includes("startimes") ? "startimes" : "showmax";

    const payload = {
      request_id: requestId,
      serviceID: serviceID,
      billersCode: smartCard,
      variation_code: productId,
      amount: tx.amount, // Usually fixed by variation_code but required
      phone: "08011111111",
    };

    const response = await retryWithBackoff(() => axios.post(`${VTPASS_API_URL}/pay`, payload, {
      headers: {
        "api-key": VTPASS_API_KEY,
        "secret-key": VTPASS_SECRET_KEY,
      },
    }));

    const data = response.data;
    logger.info(`[vendTv] VTPass Response Code: ${data.code}`, data);

    if (data.code === "000") {
        return { success: true, raw: data };
    }

     // SANDBOX BYPASS
     if (VTPASS_API_URL.includes("sandbox") && (data.code === "028" || data.code === "011")) {
        return { 
          success: true, 
          token: "MOCK-TV-SUCCESS",
          raw: { ...data, response_description: `SANDBOX BYPASS (${data.code})` } 
        };
     }

    return {
      success: false,
      error: data.response_description || `Vendor Error ${data.code}`,
      raw: data,
    };
  } catch (error: any) {
    logger.error("[vendTv] API Error:", error.response?.data || error.message);
    return {
      success: false,
      error: error.response?.data?.response_description || error.message,
    };
  }
}

async function vendElectricity(tx: any): Promise<VendingResult> {
  logger.info(`Vending Electricity to ${tx.details.meter} via VTpass`);

  try {
    // VTpass Electricity Purchase
    const payload = {
      request_id: generateRequestId(tx.txRef),
      serviceID: tx.details.network.toLowerCase().includes("ikeja") ? "ikeja-electric" : "eko-electric", 
      billersCode: tx.details.meter,
      variation_code: "prepaid",
      amount: tx.amount,
      phone: "08011111111", // Default if missing
    };

    // In Live: Use axios here
    logger.debug(`VTpass Electricity Payload for ${VTPASS_SECRET_KEY}:`, payload);
    
    const response = await retryWithBackoff(() => axios.post(`${VTPASS_API_URL}/pay`, payload, {
      headers: {
        "api-key": VTPASS_API_KEY,
        "secret-key": VTPASS_SECRET_KEY,
      },
    }));

    const data = response.data;
    logger.info("VTpass Electricity Response:", data);

    // SANDBOX BYPASS for Code 028
    if (data.code === "000") {
      return {
        success: true,
        token: data.purchased_code || data.content?.purchased_code?.split(':')[1]?.trim() || data.mainToken || "TEST-TOKEN-SANDBOX",
        raw: data,
      };
    } 

    // SANDBOX BYPASS: Only for Code 028 or 011 in Sandbox
    if ((data.code === "028" || data.code === "011") && VTPASS_API_URL.includes("sandbox")) {
       logger.warn(`[vendElectricity] VTpass: FAILED (${data.code}). TRANSACTION TREATED AS MOCK SUCCESS FOR DEV.`);
       return { 
         success: true, 
         token: "MOCK-ELEC-BYPASS-TOKEN",
         raw: { ...data, response_description: `SANDBOX MOCK SUCCESS (${data.code} BYPASS)` } 
       };
    }

    return {
      success: false,
      error: data.response_description || "Electricity vending failed",
      raw: data,
    };
  } catch (error: any) {
    logger.error("VTpass Electricity Error:", error.response?.data || error.message);
    return {
      success: false,
      error: error.response?.data?.response_description || error.message,
    };
  }
}
