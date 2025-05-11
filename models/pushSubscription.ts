import { v4 } from "uuid";
import { getDatabase } from "../utils/database";

const db = getDatabase();

export default class PushSubscription {
  public id = v4();
  public user_id: string;
  public subscription: any;
  public allow_notifications: boolean = true;

  constructor(user_id: string, subscription: any) {
    this.user_id = user_id;
    this.subscription = subscription;
  }

  create() {
    db.prepare(
      `
      INSERT INTO push_subscriptions (id, user_id, endpoint, subscription)
      VALUES ($id, $user_id, $endpoint, $subscription)
    `
    ).run({
      id: this.id,
      user_id: this.user_id,
      endpoint: this.subscription.endpoint,
      subscription: JSON.stringify(this.subscription),
    });
  }

  updateAllowNotification(allowNotifications: number) {
    db.prepare(
      `
      UPDATE push_subscriptions
         SET allow_notifications = $allowNotifications
       WHERE id = $id
    `
    ).run({
      id: this.id,
      allowNotifications,
    });
  }

  static allForRole(role: string) {
    return db
      .prepare(
        `
        SELECT ps.subscription
          FROM push_subscriptions ps
          JOIN users u ON u.id = ps.user_id
         WHERE u.type = $role
      `
      )
      .all({ role })
      .map((r: any) => JSON.parse(r.subscription));
  }

  static findByUserId(user_id: string) {
    return db
      .prepare<PushSubscription[], { user_id: string }>(
        `
        SELECT allow_notifications, id, subscription
          FROM push_subscriptions
         WHERE user_id = $user_id
      `
      )
      .as(PushSubscription)
      .all({ user_id });
  }

  static findByEndpoint(endpoint: string) {
    return db
      .prepare<PushSubscription[], { endpoint: string }>(
        `
        SELECT subscription
          FROM push_subscriptions
         WHERE endpoint = $endpoint
      `
      )
      .as(PushSubscription)
      .get({ endpoint });
  }
}
