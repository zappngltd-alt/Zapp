import axios from "axios";
import * as logger from "firebase-functions/logger";
import { HttpsError } from "firebase-functions/v2/https";
import { getFirestore, FieldValue } from "firebase-admin/firestore";
import { retryWithBackoff } from "./utils/retry.js";

// VTpass Configuration
const VTPASS_API_URL = process.env.VTPASS_API_URL || "https://sandbox.vtpass.com/api";
const VTPASS_API_KEY = process.env.VTPASS_API_KEY || "db759d72a1e91d3a9062e8fd2c8c3c78";
const VTPASS_PUBLIC_KEY = process.env.VTPASS_PUBLIC_KEY || "PK_840fbd91733baf2f4a47b70052206e4d4c8576b712b"; 

/**
 * Fetch Data Plans dynamically from VTpass.
 */
// (Empty line removed)

/**
 * Helper to fetch from VTPass with Retry
 */
const fetchGenerationsFromVtpass = async(serviceID: string, provider: string) => {
    logger.info(`[getDataPlans] Fetching fresh plans from VTpass for ${provider}`);
    const response = await retryWithBackoff(() => axios.get(`${VTPASS_API_URL}/service-variations`, {
      params: { serviceID },
      headers: {
        "api-key": VTPASS_API_KEY,
        "public-key": VTPASS_PUBLIC_KEY 
      },
      timeout: 15000 
    }));
    return response.data;
}

/**
 * Fetch Data Plans with Firestore Caching
 */
export const getDataPlansHandler = async (request: any) => {
  const { provider } = request.data;
  
  // Map our internal provider IDs to VTpass Service IDs
  const serviceMap: Record<string, string> = {
    mtn: "mtn-data",
    airtel: "airtel-data",
    glo: "glo-data",
    "9mobile": "etisalat-data",
    smile: "smile-direct",
    spectranet: "spectranet"
  };

  const serviceID = serviceMap[provider?.toLowerCase()];

  if (!serviceID) {
    throw new HttpsError("invalid-argument", "Invalid or unsupported provider");
  }

  const db = getFirestore();
  const cacheRef = db.collection("data_plans").doc(provider.toLowerCase());
  
  try {
    // 1. Check Cache
    const cacheDoc = await cacheRef.get();
    const now = Date.now();
    const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 Hours

    if (cacheDoc.exists) {
        const cacheData = cacheDoc.data();
        const lastUpdated = cacheData?.lastUpdated?.toMillis() || 0;
        
        if (now - lastUpdated < CACHE_DURATION && cacheData?.plans?.length > 0) {
            logger.info(`[getDataPlans] Returning CACHED plans for ${provider}`);
            return { success: true, plans: cacheData?.plans };
        }
    }

    // 2. Fetch Fresh Data (with Retry)
    const data = await fetchGenerationsFromVtpass(serviceID, provider);
    const variations = data.content?.varations || data.content?.variations;

    if (data.response_description === "000" && variations) {
      const plansMap = new Map();
      variations.forEach((v: any) => {
        let validity = "30 Days"; 
        const nameLower = v.name.toLowerCase();
        
        if (nameLower.includes('24 hrs') || nameLower.includes('1 day') || nameLower.includes('daily')) {
          validity = "1 Day";
        } else if (nameLower.includes('2 days')) {
          validity = "2 Days";
        } else if (nameLower.includes('7 days') || nameLower.includes('weekly') || nameLower.includes('1 week')) {
          validity = "7 Days";
        } else if (nameLower.includes('14 days') || nameLower.includes('2 weeks')) {
          validity = "14 Days";
        } else if (nameLower.includes('30 days') || nameLower.includes('monthly') || nameLower.includes('1 month')) {
          validity = "30 Days";
        }
        
        let cleanName = v.name;
        const dataMatch = v.name.match(/(\d+(?:\.\d+)?(?:MB|GB))/i);
        if (dataMatch) {
          cleanName = dataMatch[1];
        }
        
        plansMap.set(v.variation_code, {
          id: v.variation_code,
          name: cleanName,
          price: Math.round(parseFloat(v.variation_amount)),
          validity: validity,
          category: "data",
          providerId: provider,
        });
      });

      const plans = Array.from(plansMap.values());

      // 3. Update Cache
      await cacheRef.set({
          plans,
          lastUpdated: FieldValue.serverTimestamp(),
          provider
      });
      logger.info(`[getDataPlans] Cache updated for ${provider}`);

      return { success: true, plans };
    }

    logger.warn("[getDataPlans] VTpass Empty/Error Response", data);
    return { success: false, plans: [] };

  } catch (error: any) {
    logger.error(`[getDataPlans] CRITICAL ERROR: ${error.message}`, { 
      stack: error.stack,
      code: error.code,
    });
    return { success: false, error: error.message, plans: [] };
  }
};


/**
 * Returns a curated list of "Hot Deals" for the dashboard.
 */
export const getHotDealsHandler = async (request: any) => {
  logger.info("[getHotDeals] Returning curated deals");
  
  // These are manually curated highly competitive deals.
  // In production, these should be managed in Firestore or fetched/cached from VTpass.
  const deals = [
    {
      id: "mtn-1gb-sme",
      provider: "MTN",
      plan: "1GB SME",
      price: "₦260",
      originalPrice: "₦1,200",
      validity: "30 Days",
      color: "#eab308",
      category: "data",
    },
    {
      id: "airtel-1.5gb",
      provider: "Airtel",
      plan: "1.5GB Data",
      price: "₦950",
      originalPrice: "1,000",
      validity: "30 Days",
      color: "#ef4444",
      category: "data",
    },
    {
      id: "glo-2.5gb",
      provider: "Glo",
      plan: "2.5GB Data",
      price: "₦980",
      originalPrice: "1,000",
      validity: "30 Days",
      color: "#10b981",
      category: "data",
    },
    {
      id: "mtn-2gb-sme",
      provider: "MTN",
      plan: "2GB SME",
      price: "₦520",
      originalPrice: "2,400",
      validity: "30 Days",
      color: "#eab308",
      category: "data",
    }
  ];

  return { success: true, deals };
};
