import { NotificationStatusEnum } from "../models/request";
import { UserTypeEnum } from "../models/user";

export interface NotificationPayload {
  id: string;
  request_id: string;
  recipient_id: string | null;
  recipient_role: UserTypeEnum;
  status: NotificationStatusEnum;
  is_read: boolean;
  timestamp: Date;
  request_title: string;
  request_urgency: string;
  volunteer_id?: string | null;
  volunteer_username?: string;
  volunteer_profile_img?: string | null;
  beneficiary_id?: string | null;
  beneficiary_username?: string;
  beneficiary_profile_img?: string | null;
  rating?: number;  
  rating_comment?: string;
}

export const getNotificationMessage = (notification: NotificationPayload) => {
  // Determine who performed the action based on status
  let actor = "";
  if (
    notification.status === NotificationStatusEnum.IN_PROGRESS &&
    notification.volunteer_username
  ) {
    actor = `Volunteer ${notification.volunteer_username}`;
  } else if (notification.beneficiary_username) {
    actor = `Beneficiary ${notification.beneficiary_username}`;
  }

  // Special handling for ratings
  if (notification.status === NotificationStatusEnum.RATED) {
    if (
      notification.recipient_role === UserTypeEnum.VOLUNTEER &&
      notification.beneficiary_username
    ) {
      return `Beneficiary ${
        notification.beneficiary_username
      } rated your help with ${notification.rating} star${
        notification.rating !== 1 ? "s" : ""
      }`;
    } else if (
      notification.recipient_role === UserTypeEnum.BENEFICIARY &&
      notification.volunteer_username
    ) {
      return `Volunteer ${
        notification.volunteer_username
      } rated your request with ${notification.rating} star${
        notification.rating !== 1 ? "s" : ""
      }`;
    }
    return `Request was rated with ${notification.rating} star${
      notification.rating !== 1 ? "s" : ""
    }`;
  }

  switch (notification.status) {
    case NotificationStatusEnum.OPEN:
      return `${actor ? actor + " created a" : "A"} new request`;
    case NotificationStatusEnum.IN_PROGRESS:
      return `${actor ? actor + " accepted" : "Request accepted"}`;
    case NotificationStatusEnum.REJECTED:
      return `${actor ? actor + " rejected" : "Request rejected"}`;
    case NotificationStatusEnum.CANCELED:
      return `${actor ? actor + " canceled" : "Request canceled"}`;
    case NotificationStatusEnum.DONE:
      return `${actor ? actor + " completed" : "Request completed"}`;
    default:
      return `Update on request`;
  }
};