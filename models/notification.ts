import { v4 } from "uuid";
import { getDatabase } from "../utils/database";
import User, { UserTypeEnum } from "./user";
import { NotificationStatusEnum } from "./request";
import { deleteAllNotificationsQuery, markAllNotificationsReadQuery, markNotificationReadQuery } from "../db/queries";

const db = getDatabase();

class Notification {
  public id: string = v4();
  public request_id: string = "";
  public recipient_id: string | null = null;
  public emiiter_id: string | null = null;
  public recipient_role: UserTypeEnum = UserTypeEnum.NONE;
  public status: NotificationStatusEnum = NotificationStatusEnum.OPEN;
  public is_read: boolean = false;
  public timestamp: Date = new Date();

  toJSON() {
    return {
      id: this.id,
      request_id: this.request_id,
      emiiter_id: this.emiiter_id,
      recipient_id: this.recipient_id,
      recipient_role: this.recipient_role,
      status: this.status,
      is_read: this.is_read,
      timestamp: this.timestamp,
    };
  }

  create() {
    db.query(
      `INSERT INTO notification (id, emiiter_id, request_id, recipient_id, recipient_role, status, is_read, timestamp) 
                  VALUES ($id, $emiiter_id, $request_id, $recipient_id, $recipient_role, $status, $is_read, $timestamp)`
    ).run({
      id: this.id,
      emitter_id: this.emiiter_id,
      request_id: this.request_id,
      recipient_id: this.recipient_id,
      emiiter_id: this.emiiter_id,
      recipient_role: this.recipient_role,
      status: this.status,
      is_read: this.is_read ? 1 : 0,
      timestamp: this.timestamp.toISOString(),
    });
  }

  // TODO: Handle correct return type and for beneficiary returni correct entity
  static findByRequest(id: string, recipient_role: UserTypeEnum) {
    console.log(recipient_role);
    if (recipient_role === UserTypeEnum.BENEFICIARY) {
      return db
        .prepare(
          `SELECT
      n.id,
      n.request_id,
      n.recipient_id,
      n.recipient_role,
      n.status,
      n.is_read,
      n.timestamp,
      rev.rating,
      rev.comment             AS rating_comment,
      r.title                 AS request_title,
      r.urgency               AS request_urgency,
      r.beneficiary_id        AS volunteer_id,
      u.username              AS volunteer_username,
      u.profile_img           AS volunteer_profile_img 

    FROM notification n
       LEFT JOIN requests r
        ON r.id = n.request_id
       LEFT JOIN reviews rev
          on rev.request_id = n.request_id
       LEFT JOIN users u
        ON u.id = n.emiiter_id
       WHERE n.recipient_id = $recipient_id
       ORDER BY timestamp ASC`
        )
        .as(Notification)
        .all({
          recipient_id: id,
        });
    }

    return db
      .prepare(
        `SELECT
      n.id,
      n.request_id,
      n.recipient_id,
      n.recipient_role,
      n.status,
      n.is_read,
      n.timestamp,
      rev.rating,
      rev.comment,
      r.title                 AS request_title,
      r.urgency               AS request_urgency,
      u.id                    AS beneficiary_id,
      u.username              AS beneficiary_username,
      u.profile_img           AS beneficiary_profile_img 

    FROM notification n
      LEFT JOIN requests r
        ON r.id = n.request_id
      LEFT JOIN reviews rev
        on rev.request_id = n.request_id
      LEFT JOIN users u
        ON u.id = n.emiiter_id
   WHERE recipient_id = $recipient_id
      OR (recipient_role = 'volunteer' AND recipient_id IS NULL)
   ORDER BY timestamp ASC`
      )
      .as(Notification)
      .all({
        recipient_id: id,
      });
  }

  markAsRead(recipientId: string) {
    markNotificationReadQuery.run({
      id: this.id,
      recipient_id: recipientId,
    });
    this.is_read = true;
  }

  /** delete *this* notification */
  remove(recipientId: string) {
    deleteNotificationQuery.run({
      id: this.id,
      recipient_id: recipientId,
    });
  }

  /** static shortcut if you only have IDs */
  static markRead(id: string, recipientId: string) {
    markNotificationReadQuery.run({ id, recipient_id: recipientId });
  }

  static deleteAll(recipientId: string) {
    deleteAllNotificationsQuery.run({ recipient_id: recipientId });
  }

  static markAllRead(recipientId: string) {
    markAllNotificationsReadQuery.run({ recipient_id: recipientId });
  }
}

export default Notification;
