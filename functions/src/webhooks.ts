import * as logger from "firebase-functions/logger";
import { getFirestore, FieldValue } from "firebase-admin/firestore";
import * as crypto from "crypto";

const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY || "sk_test_1b7e8d339a0e090d962778530eafdf7c842e6dd8";

export const webhookHandler = async (req: any, res: any) => {
  const signature = req.headers["x-paystack-signature"] as string;
  if (!signature) {
    res.status(401).send("No signature.");
    return;
  }

  const hash = crypto.createHmac('sha512', PAYSTACK_SECRET_KEY)
    .update(JSON.stringify(req.body))
    .digest('hex');

  if (hash !== signature) {
    res.status(401).send("Invalid signature");
    return;
  }

  const {event: eventType, data} = req.body;
  logger.info(`[paystackWebhook] Event: ${eventType}, ref: ${data?.reference}`);

  if (eventType === "charge.success") {
    try {
      const ref = data.reference;
      const txDoc = await getFirestore().collection("transactions").doc(ref).get();
      if (txDoc.exists && txDoc.data()?.status !== "PAID") {
        await txDoc.ref.update({
          status: "PAID",
          paidAt: FieldValue.serverTimestamp(),
          paystackAmount: data.amount / 100,
          paystackStatus: data.status,
        });
      }
    } catch (error) {
      logger.error(`Webhook error:`, error);
    }
  }

  res.status(200).send("OK");
};
