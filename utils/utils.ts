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
      return `${actor ? actor + " a creat o" : "A fost creată o"} nouă cerere`;
    case NotificationStatusEnum.IN_PROGRESS:
      return `${actor ? actor + " a acceptat" : "Cererea a fost acceptată"}`;
    case NotificationStatusEnum.REJECTED:
      return `${actor ? actor + " a respins" : "Cererea a fost respinsă"}`;
    case NotificationStatusEnum.CANCELED:
      return `${actor ? actor + " a anulat" : "Cererea a fost anulată"}`;
    case NotificationStatusEnum.DONE:
      return `${actor ? actor + " a finalizat" : "Cererea a fost finalizată"}`;
    default:
      return `Actualizare privind cererea`;
  }
};