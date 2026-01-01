import {setGlobalOptions} from "firebase-functions";
import {onCall, onRequest, HttpsError} from "firebase-functions/v2/https";
import {onDocumentUpdated} from "firebase-functions/v2/firestore";
import * as admin from "firebase-admin";
import { logger } from "firebase-functions";
// (Empty line removed)

// Initialize Admin once at the top level
if (admin.apps.length === 0) {
  admin.initializeApp();
}

setGlobalOptions({maxInstances: 10});

/**
 * TEST CONNECTION
 */
export const testConnection = onCall(async (request) => {
  return { message: "Connected to Emulator!", timestamp: Date.now() };
});

/**
 * GET DATA PLANS (Lazy Load)
 */
export const getDataPlans = onCall(async (request) => {
  const { getDataPlansHandler } = await import("./products.js");
  return getDataPlansHandler(request);
});

/**
 * INITIALIZE PAYMENT (Lazy Load)
 */
export const initPayment = onCall(async (request) => {
  const { initPaymentHandler } = await import("./payments.js");
  return initPaymentHandler(request);
});

/**
 * VERIFY PAYMENT (Lazy Load)
 */
export const verifyPayment = onCall(async (request) => {
  const { verifyPaymentHandler } = await import("./payments.js");
  return verifyPaymentHandler(request);
});

/**
 * PAYSTACK WEBHOOK (Lazy Load)
 */
export const paystackWebhook = onRequest(async (req, res) => {
  const { webhookHandler } = await import("./webhooks.js");
  return webhookHandler(req, res);
});

/**
 * CONFIRM MOCK PAYMENT (Lazy Load)
 */
export const confirmMockPayment = onCall(async (request) => {
  const { getFirestore, FieldValue } = await import("firebase-admin/firestore");
  const {txRef} = request.data;
  
  logger.info(`[confirmMockPayment] Triggering bypass for: ${txRef}`);
  
  const db = getFirestore();
  const txRefDoc = db.collection("transactions").doc(txRef);
  
  const snap = await txRefDoc.get();
  if (!snap.exists) {
    logger.error(`[confirmMockPayment] FAILED: Transaction ${txRef} not found in DB.`);
    throw new HttpsError("not-found", "Transaction ref does not exist.");
  }

  await txRefDoc.update({
    status: "PAID",
    paidAt: FieldValue.serverTimestamp(),
    paymentMethod: "mock-test-bypass",
    verificationMethod: "manual_bypass",
  });

  logger.info(`[confirmMockPayment] SUCCESS: Ref ${txRef} is now marked as PAID.`);
  return {success: true, message: "Mock payment confirmed."};
});

/**
 * FIRESTORE TRIGGER: Watch for "PAID" status to start Vending (Lazy Load)
 */
export const onTransactionPaid = onDocumentUpdated("transactions/{txId}", async (event) => {
  const newData = event.data?.after.data();
  const previousData = event.data?.before.data();

  logger.info(`[onTransactionPaid] Triggered for ${event.params.txId}. Status: ${previousData?.status} -> ${newData?.status}`);

  if (newData?.status === "PAID") {
    logger.info(`[onTransactionPaid] Starting vending engine for: ${event.params.txId}`);
    const { handleVending } = await import("./vending.js");
    try {
        await handleVending(event.params.txId);
        logger.info(`[onTransactionPaid] Vending handler completed for: ${event.params.txId}`);
    } catch (e: any) {
        logger.error(`[onTransactionPaid] CRITICAL ERROR in handleVending:`, e.message);
    }
  } else {
    logger.info(`[onTransactionPaid] Skillping vending. Status is not PAID.`);
  }
});

/**
 * GET HOT DEALS (Lazy Load)
 */
export const getHotDeals = onCall(async (request) => {
  const { getHotDealsHandler } = await import("./products.js");
  return getHotDealsHandler(request);
});
