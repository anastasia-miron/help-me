import { v4 } from "uuid";
import { getDatabase } from "../utils/database";
import User from "./user";
import type { RequestStatusEnum, RequestUrgencyEnum } from "./request";
import { markMessageReadQuery } from "../db/queries";

const db = getDatabase();

class Message {
  public id: string = v4();
  public request_id: string = "";
  public user_id: string | null = null;
  public is_system: boolean = false;
  public content: string = "";
  public timestamp: Date = new Date();

  toJSON() {
    return {
      id: this.id,
      request_id: this.request_id,
      user_id: this.user_id,
      user: this.user_id ? User.findById(this.user_id) : null,
      isSystem: this.is_system,
      content: this.content,
      timestamp: this.timestamp,
    };
  }

  create() {
    db.query(
      `INSERT INTO messages (id, request_id, user_id, is_system, content, timestamp) 
                  VALUES ($id, $request_id, $user_id, $is_system, $content, $timestamp)`
    ).run({
      id: this.id,
      request_id: this.request_id,
      is_system: this.is_system,
      user_id: this.user_id,
      content: this.content,
      timestamp: this.timestamp.toISOString(),
    });
  }

  static findByRequest(id: string) {
    return db
      .prepare(
        `SELECT * FROM messages WHERE request_id = $request_id ORDER BY timestamp ASC`
      )
      .as(Message)
      .all({
        request_id: id,
      });
  }

  /**
   * Return every request that this user is involved in,
   * with unreadCount, lastMessage, beneficiary & volunteer all populated.
   */
  static findWithMetaByUser(userId: string): Array<{
    id: string;
    title: string;
    description: string;
    status: RequestStatusEnum;
    urgency: RequestUrgencyEnum;
    unreadCount: number;
    lastMessage: {
      content: string;
      timestamp: string;
      isSystem: boolean;
      sender?: {
        id: string;
        username: string;
        profileImg: string | null;
      } | null;
    };
    beneficiary: {
      id: string;
      username: string;
      profileImg: string | null;
      isVerified: boolean;
    };
    volunteer: {
      id: string;
      username: string;
      profileImg: string | null;
      isVerified: boolean;
    } | null;
  }> {
    const stmt = db.prepare(`
        SELECT
          r.id,
          r.title,
          r.description,
          r.status,
          r.urgency,
  
          -- only count non-system messages you didn’t send and haven’t read
          COALESCE((
            SELECT COUNT(*)
              FROM messages m
             WHERE m.request_id = r.id
               AND m.is_read   = 0
               AND m.is_system = 0
               AND (m.user_id IS NULL OR m.user_id <> $userId)
          ), 0) AS unreadCount,
  
          -- pack the very last message + its optional sender
          json_object(
            'content',   lm.content,
            'timestamp', lm.timestamp,
            'isSystem',  lm.is_system,
            'sender',
              CASE
                WHEN lm.is_system = 0 AND su.id IS NOT NULL THEN
                  json_object(
                    'id',         su.id,
                    'username',   su.username,
                    'profileImg', su.profile_img
                  )
                ELSE NULL
              END
          ) AS lastMessage,
  
          -- beneficiary
          json_object(
            'id',         b.id,
            'username',   b.username,
            'profileImg', b.profile_img,
            'isVerified', b.is_verified
          ) AS beneficiary,
  
          -- volunteer may be NULL
          CASE
            WHEN v.id IS NULL THEN NULL
            ELSE json_object(
              'id',         v.id,
              'username',   v.username,
              'profileImg', v.profile_img,
              'isVerified', v.is_verified
            )
          END AS volunteer
  
        FROM requests r
  
        -- find the single most-recent message per request
        JOIN (
          SELECT m.*
            FROM messages m
            JOIN (
              SELECT request_id, MAX(timestamp) AS ts
                FROM messages
               GROUP BY request_id
            ) mx
              ON m.request_id = mx.request_id
             AND m.timestamp  = mx.ts
        ) lm
          ON lm.request_id = r.id
  
        LEFT JOIN users su
          ON su.id = lm.user_id
  
        JOIN users b
          ON b.id = r.beneficiary_id
  
        LEFT JOIN users v
          ON v.id = r.volunteer_id
  
        WHERE (r.volunteer_id  = $userId
           OR r.beneficiary_id = $userId) AND lm.is_system = 0
  
        ORDER BY r.created_at DESC
      `);

    // execute & JSON-parse the three embedded blobs
    const rows = stmt.all({ userId });
    return rows.map((r) => ({
      id: r.id,
      title: r.title,
      description: r.description,
      status: r.status,
      urgency: r.urgency,
      unreadCount: r.unreadCount,
      lastMessage: JSON.parse(r.lastMessage),
      beneficiary: JSON.parse(r.beneficiary),
      volunteer: r.volunteer === null ? null : JSON.parse(r.volunteer),
    }));
  }

  static findMetaByUserAndRequest(
    userId: string,
    requestId: string
  ): {
    id: string;
    title: string;
    description: string;
    status: RequestStatusEnum;
    urgency: RequestUrgencyEnum;
    unreadCount: number;
    lastMessage: {
      content: string;
      timestamp: string;
      isSystem: boolean;
      sender?: {
        id: string;
        username: string;
        profileImg: string | null;
      } | null;
    };
    beneficiary: {
      id: string;
      username: string;
      profileImg: string | null;
      isVerified: boolean;
    };
    volunteer: {
      id: string;
      username: string;
      profileImg: string | null;
      isVerified: boolean;
    } | null;
  } {
    const row = db
      .prepare(
        `
      SELECT
        r.id,
        r.title,
        r.description,
        r.status,
        r.urgency,

        COALESCE((
          SELECT COUNT(*) FROM messages m
           WHERE m.request_id = r.id
             AND m.is_read   = 0
             AND m.is_system = 0
             AND (m.user_id IS NULL OR m.user_id <> $userId)
        ), 0) AS unreadCount,

        json_object(
          'content',   lm.content,
          'timestamp', lm.timestamp,
          'isSystem',  lm.is_system,
          'sender',
            CASE
              WHEN lm.is_system = 0 AND su.id IS NOT NULL THEN
                json_object(
                  'id',         su.id,
                  'username',   su.username,
                  'profileImg', su.profile_img
                )
              ELSE NULL
            END
        ) AS lastMessage,

        json_object(
          'id',         b.id,
          'username',   b.username,
          'profileImg', b.profile_img,
          'isVerified', b.is_verified
        ) AS beneficiary,

        CASE
          WHEN v.id IS NULL THEN NULL
          ELSE json_object(
            'id',         v.id,
            'username',   v.username,
            'profileImg', v.profile_img,
            'isVerified', v.is_verified
          )
        END AS volunteer

      FROM requests r

      JOIN (
        SELECT m.*
          FROM messages m
          JOIN (
            SELECT request_id, MAX(timestamp) AS ts
              FROM messages
             GROUP BY request_id
          ) mx
            ON m.request_id = mx.request_id
           AND m.timestamp  = mx.ts
         WHERE m.is_system = 0
      ) lm
        ON lm.request_id = r.id

      LEFT JOIN users su ON su.id = lm.user_id
      JOIN users b      ON b.id = r.beneficiary_id
      LEFT JOIN users v ON v.id = r.volunteer_id

      WHERE
        r.id = $requestId
        AND (r.volunteer_id  = $userId
          OR r.beneficiary_id = $userId)
    `
      )
      .get({ userId, requestId });

    if (!row) return null;

    return {
      id: row.id,
      title: row.title,
      description: row.description,
      status: row.status,
      urgency: row.urgency,
      unreadCount: row.unreadCount,
      lastMessage: JSON.parse(row.lastMessage),
      beneficiary: JSON.parse(row.beneficiary),
      volunteer: row.volunteer === null ? null : JSON.parse(row.volunteer),
    };
  }

  static markOneRead(userId: string, messageId: string) {
    markMessageReadQuery.run({ userId, messageId });
  }
}

export default Message;
