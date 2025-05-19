import type { Context } from "hono";
import Notification from "../models/notification";
import { UserTypeEnum } from "../models/user";
import type { NotificationPayload } from "../utils/utils";

export const getNotifications = async (c: Context) => {
  const { id, type, is_verified } = c.get("user");
  console.log(id, type, is_verified);
  if  (!is_verified)
  {
    return c.json({ success: false, message: "User is not verified" });
  }
  const requests = (await Notification.findByRequest(
    id,
    type
  )) as (Notification & {
    request_title: string;
    request_urgency: string;
    volunteer_id?: string | null;
    volunteer_username?: string;
    volunteer_profile_img?: string | null;
    beneficiary_id?: string | null;
    beneficiary_username?: string;
    beneficiary_profile_img?: string | null;
  })[] as NotificationPayload[];

  console.log(requests.length);

  const response = requests.map((request) => {
    const emiiterPayload = request.recipient_role === UserTypeEnum.VOLUNTEER ? {
      beneficiaryId: request.beneficiary_id,
      beneficiaryUsername: request.beneficiary_username,
      beneficiaryProfileImg: request.beneficiary_profile_img,
    } : {
      volunteerId: request.volunteer_id,
      volunteerUsername: request.volunteer_username,
      volunteerProfileImg: request.volunteer_profile_img,
    }

    return {
      id: request.id,
      requestId: request.request_id,
      recipientId: request.recipient_id ? request.recipient_id : null,
      recipientRole: request.recipient_role,
      status: request.status,
      isRead: !!request.is_read,
      requestTitle: request.request_title,
      rating: request.rating,
      ratingComment: request.rating_comment,
      requestUrgency: request.request_urgency,
      ...emiiterPayload,
      timestamp: request.timestamp,
    };
  });

  return c.json({
    success: true,
    data: response,
  });
};

export async function markAllNotificationsRead(c: Context) {
  const user = c.get("user");
  Notification.markAllRead(user.id);

  return c.json({ success: true });
}



export async function markNotificationRead(c: Context) {
  const user = c.get("user");
  const id = c.req.param("id");
  Notification.markRead(id, user.id);

  return c.json({ success: true });
}

export async function deleteAllNotifications(c: Context) {
  const user = c.get("user");
  Notification.deleteAll(user.id);
  return c.json({ success: true });
}