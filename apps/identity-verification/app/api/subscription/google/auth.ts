// app/api/google/auth.ts
import { google } from "googleapis";

export async function getSubscriptionSafe(
  packageName: string,
  subscriptionId: string,
  token: string,
) {
  try {
    const auth = new google.auth.GoogleAuth({
      credentials: {
        type: process.env.GOOGLE_IN_APP_type,
        project_id: process.env.GOOGLE_IN_APP_project_id,
        private_key_id: process.env.GOOGLE_IN_APP_private_key_id,
        private_key: process.env.GOOGLE_IN_APP_private_key?.replace(/\\n/g, "\n"),
        client_email: process.env.GOOGLE_IN_APP_client_email,
        client_id: process.env.GOOGLE_IN_APP_client_id,
        universe_domain: process.env.GOOGLE_IN_APP_universe_domain,
      },
      scopes: ["https://www.googleapis.com/auth/androidpublisher"],
    });

    const publisher = google.androidpublisher({
      version: "v3",
      auth,
    });

    const res = await publisher.purchases.subscriptions.get({
      packageName,
      subscriptionId,
      token,
    });

    return res.data;
  } catch (error) {
    console.error("[getSubscriptionSafe] Error:", error);
    throw new Error("Failed to verify subscription");
  }
}
