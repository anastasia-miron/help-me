import type { Context } from "hono";
import { stream, streamText, streamSSE } from "hono/streaming";
import { v4 } from "uuid";
import pubsub from "../utils/pubsub";
import type Message from "../models/message";
import type Notification from "../models/notification";
import type { NotificationPayload } from "../utils/utils";
import { UserTypeEnum } from "../models/user";
import type { RequestStatusEnum, RequestUrgencyEnum } from "../models/request";

export const requestSSE = (c: Context) => {
  const requestId = c.req.param("id");
  return streamSSE(
    c,
    async (stream) => {
      const unsubscribe = pubsub.on(
        "message",
        async (data: { message: Message }) => {
          if (data.message.request_id !== requestId) return;
          await stream.writeSSE({
            event: "message",
            data: JSON.stringify(data),
            id: v4(),
          });
        }
      );
      stream.onAbort(unsubscribe);
      while (true) {
        await stream.sleep(5000);
        await stream.writeSSE({
          event: "ping",
          data: "",
          id: v4(),
        });
      }
    },
    async (err) => {
      console.error(err);
    }
  );
};

export const messagesSSE = (c: Context) => {
  const user = c.get("user") as { type: string; id: string };
  
  return streamSSE(
    c,
    async (stream) => {
      // Subscribe to every new message
      const unsubscribe = pubsub.on(
        `subscribe_message`,
        async (payload: {
          recievMessagePayload: {
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
          };
          targetUserID: string;
        }) => {
          const msg = payload.recievMessagePayload;

          if (user.id !== payload.targetUserID) return;
          stream.writeSSE({
            event: "subscribe_message",
            data: JSON.stringify(msg),
            id: v4(),
          });
        }
      );

      // Clean up on disconnect
      stream.onAbort(unsubscribe);

      // Heartbeat so proxies don’t drop us
      while (true) {
        await stream.sleep(5000);
        await stream.writeSSE({ event: "ping", data: "", id: v4() });
      }
    },
    async (err) => {
      console.error("SSE(messages) error:", err);
    }
  );
};

export const notificationSSE = (c: Context) => {
  const userId = c.get("user").id;
  return streamSSE(
    c,
    async (stream) => {
      const unsubscribe = pubsub.on(
        "notification",
        (payload: { notification: NotificationPayload }) => {
          if (
            payload.notification.recipient_id &&
            payload.notification.recipient_id !== userId
          )
            return;

          const eventName = `notification:${payload.notification.recipient_role}`;

          const emiiterPayload =
            payload.notification.recipient_role === UserTypeEnum.VOLUNTEER
              ? {
                  beneficiaryId: payload.notification.beneficiary_id,
                  beneficiaryUsername:
                    payload.notification.beneficiary_username,
                  beneficiaryProfileImg:
                    payload.notification.beneficiary_profile_img,
                }
              : {
                  volunteerId: payload.notification.volunteer_id,
                  volunteerUsername: payload.notification.volunteer_username,
                  volunteerProfileImg:
                    payload.notification.volunteer_profile_img,
                };

          const response = {
            id: payload.notification.id,
            requestId: payload.notification.request_id,
            recipientId: payload.notification.recipient_id
              ? payload.notification.recipient_id
              : null,
            recipientRole: payload.notification.recipient_role,
            status: payload.notification.status,
            isRead: !!payload.notification.is_read,
            rating: payload.notification.rating,
            ratingComment: payload.notification.rating_comment,
            timestamp: payload.notification.timestamp,
            requestTitle: payload.notification.request_title,
            requestUrgency: payload.notification.request_urgency,
            ...emiiterPayload,
          };

          stream.writeSSE({
            event: eventName,
            data: JSON.stringify(response),
            id: v4(),
          });
        }
      );

      stream.onAbort(() => {
        unsubscribe();
      });

      while (true) {
        await stream.sleep(5000);
        await stream.writeSSE({ event: "ping", data: "", id: v4() });
      }
    },
    async (err) => {
      console.error("SSE(notifications) error:", err);
    }
  );
};
