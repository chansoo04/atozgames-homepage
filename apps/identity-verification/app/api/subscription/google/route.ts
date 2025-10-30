import { NextRequest, NextResponse } from "next/server";
import { getSubscriptionSafe } from "./auth";
import { initializeDataSource } from "../../data-source";
import dayjs from "dayjs";

interface GoogleNotificationBody {
  message: {
    data: string;
    messageId: string;
    publishTime: string;
  };
  subscription: string;
}

export async function POST(request: Request) {
  try {
    const dataSource = await initializeDataSource();
    const dataObj = await request.json();
    let body: GoogleNotificationBody | null = null;
    body = dataObj.body as GoogleNotificationBody;

    if (!body || !body.message?.data) {
      console.error("Invalid notification body:", body);
      return new Response("Invalid body", { status: 400 });
    }
    const decoded = Buffer.from(body.message.data, "base64").toString("utf-8");
    const message = JSON.parse(decoded);
    console.log(`google subscription message: ${JSON.stringify(message)}`);
    const { notificationType, purchaseToken, subscriptionId } = message.subscriptionNotification;
    const subscription = await getSubscriptionSafe(
      message.packageName,
      subscriptionId,
      purchaseToken,
    );
    const orderId = subscription?.orderId ?? "UNKNOWN_ORDER_ID";
    const newOrderId = orderId.replace(/\.\.\d+$/, "");
    const originalTransactionId = subscription.linkedPurchaseToken || newOrderId!;
    const transactionId = subscription.orderId!;
    const expiresDate = dayjs(Number(subscription.expiryTimeMillis!)).toDate();
    const purchaseDate = dayjs(Number(subscription.startTimeMillis!)).toDate();
    const revocationDate = dayjs(Number(subscription.expiryTimeMillis!)).toDate();
    const productId = subscriptionId;
    const paymentState = subscription.paymentState;
    const cancelReason = subscription.cancelReason;
    const qr = dataSource.createQueryRunner();
    await qr.connect();
    try {
      const [result_query] = await qr.query(`CALL sp_purchase_subscription(?, ?, ?, ?, ?, ?, ?)`, [
        "GOOGLE",
        notificationType,
        originalTransactionId,
        transactionId,
        expiresDate,
        purchaseDate,
        revocationDate,
        productId,
        paymentState,
        cancelReason,
      ]);
      const resultRow = result_query[0];
      console.log(result_query);
      console.log(resultRow);
    } finally {
      await qr.release();
    }

    return NextResponse.json({ result: "success" }, { status: 200 });
  } catch (e: any) {
    console.error("[ingame-token] issue error:", e?.message || e);
    return NextResponse.json({ error: "server_error" }, { status: 500 });
  }
}
