import {HttpsError} from "firebase-functions/v2/https";
import * as logger from "firebase-functions/logger";
import { getFirestore, FieldValue } from "firebase-admin/firestore";
import axios from "axios";
import { retryWithBackoff } from "./utils/retry.js";

const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY || "sk_test_1b7e8d339a0e090d962778530eafdf7c842e6dd8";
const PAYSTACK_BASE_URL = "https://api.paystack.co";

export const initPaymentHandler = async (request: any) => {
  const {data} = request;
  const {category, amount, details, provider, paymentMethod = "card"} = data;

  if (!category || !amount || !details) {
    throw new HttpsError("invalid-argument", "Missing required payment details.");
  }

  const txRef = `SWFT-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

  try {
    const txData = {
      userId: request.auth?.uid || "anonymous",
      category,
      amount,
      details,
      provider,
      status: "UNPAID",
      txRef,
      paymentMethod,
      createdAt: FieldValue.serverTimestamp(),
    };

    await getFirestore().collection("transactions").doc(txRef).set(txData);

    logger.info(`[initPayment] Initiating ${category} payment for ref: ${txRef}`);

    const paystackPayload = {
      email: request.auth?.token?.email || "user@swift.app",
      amount: amount * 100, 
      reference: txRef,
      metadata: {
        category,
        provider,
        phone: details.phone || details.meter,
        userId: request.auth?.uid || "anonymous",
      },
      channels: ["card", "bank_transfer", "ussd"],
      callback_url: "https://standard.paystack.co/close",
    };

    const paystackResponse = await retryWithBackoff(() => axios.post(
      `${PAYSTACK_BASE_URL}/transaction/initialize`,
      paystackPayload,
      {
        headers: {
          Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
          "Content-Type": "application/json",
        },
        timeout: 10000,
      }
    ));

    const paystackData = paystackResponse.data;

    if (paystackData.status && paystackData.data) {
      await getFirestore().collection("transactions").doc(txRef).update({
        paystackAccessCode: paystackData.data.access_code,
        paystackReference: paystackData.data.reference,
      });

      return {
        success: true,
        txRef,
        checkoutUrl: paystackData.data.authorization_url,
        accessCode: paystackData.data.access_code,
        isWebView: true,
      };
    } else {
      throw new Error("Paystack initialization failed");
    }
  } catch (error: any) {
    logger.error("[initPayment] Failed:", error.message);
    throw new HttpsError("internal", error.message);
  }
};

export const verifyPaymentHandler = async (request: any) => {
  const {txRef} = request.data;
  if (!txRef) throw new HttpsError("invalid-argument", "Missing txRef");

  try {
    const response = await retryWithBackoff(() => axios.get(
      `${PAYSTACK_BASE_URL}/transaction/verify/${txRef}`,
      {
        headers: { Authorization: `Bearer ${PAYSTACK_SECRET_KEY}` },
        timeout: 10000,
      }
    ));

    const paystackData = response.data;

    if (paystackData.status && paystackData.data.status === "success") {
      const txDoc = await getFirestore().collection("transactions").doc(txRef).get();
      if (!txDoc.exists) throw new HttpsError("not-found", "Transaction not found");

      if (txDoc.data()?.status === "UNPAID") {
        await txDoc.ref.update({
          status: "PAID",
          paidAt: FieldValue.serverTimestamp(),
          paystackAmount: paystackData.data.amount / 100,
          paystackStatus: paystackData.data.status,
        });
        return { success: true, status: "PAID" };
      }
      return { success: true, status: txDoc.data()?.status };
    }
    return { success: false, status: paystackData.data?.status || "failed" };
  } catch (error: any) {
    throw new HttpsError("internal", "Verification failed");
  }
};
