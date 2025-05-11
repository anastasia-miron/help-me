import type { Context } from "hono";
import PushSubscription from "../models/pushSubscription";

export const getVapidKey = (c: Context) => {
  return c.json({ key: process.env.VAPID_PUBLIC_KEY });
};

export const subscribePush = async (c: Context) => {
  const { id: user_id } = c.get("user") as { id: string };
  const subscription = (await c.req.json()) as { endpoint: string };

  const pushSubscription = PushSubscription.findByEndpoint(
    subscription.endpoint
  );

  if (pushSubscription) {
    return c.json({ success: true });
  }

  new PushSubscription(user_id, subscription).create();

  return c.json({ success: true });
};

export const allowNotification = async (c: Context) => {
  const { id: user_id } = c.get("user") as { id: string };
  const { allowNotifications } = (await c.req.json()) as {
    allowNotifications: boolean;
  };
  const pushSubscriptions = PushSubscription.findByUserId(user_id);

  console.log("allowNotification", allowNotifications);
 

  pushSubscriptions.forEach((pushSubscription) => {
    pushSubscription.updateAllowNotification(allowNotifications ? 1 : 0);
  });

  return c.json({ success: true });
};

export const getisNotificationEnabled = async (c: Context) => {
  const { id: user_id } = c.get("user") as { id: string };
  const pushSubscriptions = PushSubscription.findByUserId(user_id);

  if (pushSubscriptions.length === 0) {
    return c.json({ success: false });
  }

  return c.json({
    success: true,
    data: { allowNotifications: !!pushSubscriptions[0].allow_notifications },
  });
};
