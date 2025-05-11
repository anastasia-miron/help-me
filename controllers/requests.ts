import type { Context } from "hono";
import Request, {
  NotificationStatusEnum,
  RequestStatusEnum,
} from "../models/request";
import Review from "../models/reviews";
import User, { UserTypeEnum } from "../models/user";
import type { ReviewPayload } from "../types/type";
import pubsub from "../utils/pubsub";
import Message from "../models/message";
import Notification from "../models/notification";
import PushSubscription from "../models/pushSubscription";
import webpush from "../utils/webpush";
import {
  getNotificationMessage,
  type NotificationPayload,
} from "../utils/utils";

export const createRequest = async (c: Context) => {
  const body = await c.req.json();

  const request = new Request();
  request.beneficiary_id = c.get("user").id;
  request.title = body.title;
  request.description = body.description;
  request.location = body.location;
  request.urgency = body.urgency;
  request.create();

  const notification = new Notification();
  notification.request_id = request.id;
  notification.recipient_role = UserTypeEnum.VOLUNTEER;
  notification.recipient_id = null;
  notification.status = NotificationStatusEnum.OPEN;
  notification.create();

  pubsub.broadcast("message", { message: "New request created" });
  pubsub.broadcast("notification", {
    notification: {
      ...notification,
      request_title: request.title,
      request_urgency: request.urgency,
      beneficiary_id: request.beneficiary_id,
      beneficiary_username:
        User.findById(request.beneficiary_id)?.username ?? "",
    },
  });

  const subs = PushSubscription.allForRole("volunteer");
  const message = getNotificationMessage({
    ...notification,
    request_title: request.title,
    request_urgency: request.urgency,
    beneficiary_id: request.beneficiary_id,
    beneficiary_username: User.findById(request.beneficiary_id)?.username ?? "",
  } as NotificationPayload);

  // Build a small payload
  const payload = JSON.stringify({
    title: "Help Me Notification",
    body: message,
    url: `/app/requests/${request.id}`,
  });

  // end to each
  await Promise.all(
    subs.map((sub) =>
      webpush.sendNotification(sub, payload).catch(console.error)
    )
  );

  // TODO: Implement logic to create a request
  return c.json({
    success: true,
    data: request,
  });
};

export const getRequests = async (c: Context) => {
  const requests = Request.findAll();
  console.log(requests[0])
  return c.json({
    success: true,
    data: requests,
  });
};

export const getRequestsHistory = async (c: Context) => {
  const user = c.get("user") as User;
  const requests = Request.findCompleted(user!);
  return c.json({
    success: true,
    data: requests,
  });
};

export const getRequestById = async (c: Context) => {
  const { id } = c.req.param();

  const request = Request.findById(id!);
  if (!request) {
    return c.notFound();
  }
  return c.json({
    success: true,
    data: request,
  });
};

export const updateRequest = async (c: Context) => {
  const { id } = c.req.param();
  const body = await c.req.json();

  const request = Request.findById(id);
  if (!request) {
    return c.notFound();
  }

  if (request.status !== RequestStatusEnum.OPEN) {
    return c.json({
      success: false,
      message: "Request is not open",
    });
  }

  request.title = body.title;
  request.description = body.description;
  request.location = body.location;
  request.urgency = body.urgency;
  request.update();

  const message = new Message();
  message.is_system = true;
  message.request_id = request.id;
  message.content = "Request updated";
  message.create();

  pubsub.broadcast("message", { message });

  return c.json({
    success: true,
    data: request,
  });
};

export const createReviewRequest = async (c: Context) => {
  const { id } = c.req.param();
  const body = await c.req.json();

  const request = Request.findById(id);
  if (!request) {
    return c.notFound();
  }
  if (request.status !== RequestStatusEnum.DONE) {
    return c.json({
      success: false,
      message: "Request is not completed",
    });
  }
  const user = c.get("user");

  let review = Review.findByRequest(request.id, user.id);

  if (!review) {
    review = new Review();
    review.request_id = request.id;
    review.from_id = c.get("user").id;
    review.to_id =
      user.type === UserTypeEnum.BENEFICIARY
        ? request.volunteer_id!
        : request.beneficiary_id;
    review.rating = body.rating;
    review.comment = body.comment;
    review.create();
  } else {
    review.rating = body.rating;
    review.comment = body.comment;
    review.update();
  }

  // TODO: Implement logic to review a request
  return c.json({
    success: true,
    data: review,
  });
};

export const updateReviewRequest = async (c: Context) => {
  const { id } = c.req.param();
  const body = await c.req.json();

  const review = Review.findById(id);

  const request = Request.findById(review?.request_id!);
  if (!request) {
    return c.notFound();
  }

  if (!review) {
    return c.notFound();
  }

  review.rating = body.rating;
  review.comment = body.comment;
  review.update();

  const notification = new Notification();
  notification.request_id = request.id;
  notification.emiiter_id = c.get("user").id;
  notification.recipient_role =
    c.get("user").type === UserTypeEnum.BENEFICIARY
      ? UserTypeEnum.VOLUNTEER
      : UserTypeEnum.BENEFICIARY;
  notification.recipient_id =
    c.get("user").type === UserTypeEnum.BENEFICIARY
      ? request.volunteer_id!
      : request.beneficiary_id!;
  notification.status = NotificationStatusEnum.RATED;
  notification.create();

  const notificationEmmiter =
    c.get("user").type === UserTypeEnum.BENEFICIARY
      ? {
          beneficiary_id: request.beneficiary_id,
          beneficiary_username:
            User.findById(request.beneficiary_id)?.username ?? "",
        }
      : {
          volunteer_id: request.volunteer_id,
          volunteer_username:
            User.findById(request.volunteer_id!)?.username ?? "",
        };

  pubsub.broadcast("notification", {
    notification: {
      ...notification,
      request_title: request.title,
      request_urgency: request.urgency,
      rating: body.rating,
      rating_comment: body.comment,
      ...notificationEmmiter,
    } as NotificationPayload,
  });

  const subs = PushSubscription.findByUserId(request.beneficiary_id).map(
    (r: any) => JSON.parse(r.subscription)
  );

  const notificationMessage = getNotificationMessage({
    ...notification,
    request_title: request.title,
    request_urgency: request.urgency,
    rating: body.rating,
    ...notificationEmmiter,
  } as NotificationPayload);

  // Build a small payload
  const payload = JSON.stringify({
    title: "Help Me Notification",
    body: notificationMessage,
    url: `/app/requests/${request.id}`,
  });

  // end to each
  await Promise.all(
    subs.map((sub) =>
      webpush.sendNotification(sub, payload).catch(console.error)
    )
  );

  return c.json({
    success: true,
    data: review,
  });
};

export const acceptRequest = async (c: Context) => {
  const { id } = c.req.param();

  const request = Request.findById(id);
  if (!request) {
    return c.notFound();
  }

  if (request.status !== RequestStatusEnum.OPEN) {
    return c.json({
      success: false,
      message: "Request is not open",
    });
  }

  request.accept(c.get("user").id);

  const message = new Message();
  message.is_system = true;
  message.request_id = request.id;
  message.content = `Request accepted by ${c.get("user").username}`;
  message.create();

  const notification = new Notification();
  notification.request_id = request.id;
  notification.emiiter_id = c.get("user").id;
  notification.recipient_role = UserTypeEnum.BENEFICIARY;
  notification.recipient_id = request.beneficiary_id;
  notification.status = NotificationStatusEnum.IN_PROGRESS;
  notification.create();

  pubsub.broadcast("notification", {
    notification: {
      ...notification,
      request_title: request.title,
      request_urgency: request.urgency,
      volunter_id: c.get("user").id,
      volunteer_username: User.findById(c.get("user").id)?.username ?? "",
    } as NotificationPayload,
  });

  const subs = PushSubscription.findByUserId(request.beneficiary_id).map(
    (r: any) => JSON.parse(r.subscription)
  );

  const notificationMessage = getNotificationMessage({
    ...notification,
    request_title: request.title,
    request_urgency: request.urgency,
    volunter_id: c.get("user").id,
    volunteer_username: User.findById(c.get("user").id)?.username ?? "",
  } as NotificationPayload);

  // Build a small payload
  const payload = JSON.stringify({
    title: "Help Me Notification",
    body: notificationMessage,
    url: `/app/requests/${request.id}`,
  });

  // end to each
  await Promise.all(
    subs.map((sub) =>
      webpush.sendNotification(sub, payload).catch(console.error)
    )
  );

  pubsub.broadcast("message", { message });

  return c.json({
    success: true,
    data: request,
  });
};

export const cancelRequest = async (c: Context) => {
  const { id } = c.req.param();
  const request = Request.findById(id);
  if (!request) {
    return c.notFound();
  }

  if (request.status !== RequestStatusEnum.OPEN) {
    return c.json({
      success: false,
      message: "Request is not open",
    });
  }

  request.cancel();

  const message = new Message();
  message.is_system = true;
  message.request_id = request.id;
  message.content = `Request cancelled by ${c.get("user").username}`;
  message.create();

  pubsub.broadcast("message", { message });

  // look how correctly to handle canceled request
  // Or notify all the user, but look that it don`t have sense

  return c.json({
    success: true,
    data: request,
  });
};

export const rejectRequest = async (c: Context) => {
  const { id } = c.req.param();
  const request = Request.findById(id);
  if (!request) {
    return c.notFound();
  }

  if (request.status !== RequestStatusEnum.IN_PROGRESS) {
    return c.json({
      success: false,
      message: "Request is not in progress",
    });
  }

  const message = new Message();
  message.is_system = true;
  message.request_id = request.id;
  message.content = `Request rejected by ${c.get("user").username}`;
  message.create();

  pubsub.broadcast("message", { message });

  const notification = new Notification();
  notification.request_id = request.id;
  notification.emiiter_id = c.get("user").id;
  notification.recipient_role =
    c.get("user").type === UserTypeEnum.BENEFICIARY
      ? UserTypeEnum.VOLUNTEER
      : UserTypeEnum.BENEFICIARY;
  notification.recipient_id =
    c.get("user").type === UserTypeEnum.BENEFICIARY
      ? request.volunteer_id!
      : request.beneficiary_id!;
  notification.status = NotificationStatusEnum.REJECTED;
  notification.create();

  const notificationEmmiter =
    c.get("user").type === UserTypeEnum.BENEFICIARY
      ? {
          beneficiary_id: request.beneficiary_id,
          beneficiary_username:
            User.findById(request.beneficiary_id)?.username ?? "",
        }
      : {
          volunteer_id: request.volunteer_id,
          volunteer_username:
            User.findById(request.volunteer_id!)?.username ?? "",
        };

  console.log("notificationEmmiter", notificationEmmiter);

  pubsub.broadcast("notification", {
    notification: {
      ...notification,
      request_title: request.title,
      request_urgency: request.urgency,
      ...notificationEmmiter,
    },
  });

  const subs = PushSubscription.findByUserId(
    c.get("user").type === UserTypeEnum.BENEFICIARY
      ? request.volunteer_id!
      : request.beneficiary_id!
  ).map((r: any) => JSON.parse(r.subscription));

  const notificationMessage = getNotificationMessage({
    ...notification,
    request_title: request.title,
    request_urgency: request.urgency,
    ...notificationEmmiter,
  } as NotificationPayload);

  // Build a small payload
  const payload = JSON.stringify({
    title: "Help Me Notification",
    body: notificationMessage,
    url: `/app/requests/${request.id}`,
  });

  // end to each
  await Promise.all(
    subs.map((sub) =>
      webpush.sendNotification(sub, payload).catch(console.error)
    )
  );

  request.reject();

  return c.json({
    success: true,
    data: request,
  });
};

const isReviewPayload = (data: unknown): data is ReviewPayload => {
  if (typeof data !== "object" || data === null) {
    return false;
  }

  return Object.keys(data).length > 0;
};

export const completeRequest = async (c: Context) => {
  const { id } = c.req.param();
  const body = await c.req.json<ReviewPayload>();
  const request = Request.findById(id);
  const user = c.get("user");
  if (!request) {
    return c.notFound();
  }

  if (request.status !== RequestStatusEnum.IN_PROGRESS) {
    return c.json({
      success: false,
      message: "Request is not in progress",
    });
  }

  let review: Review | null = null;

  if (isReviewPayload(body)) {
    review = new Review();
    review.request_id = request.id;
    review.from_id = user.id;
    review.to_id = request.beneficiary_id!;
    review.rating = body.rating;
    review.comment = body.comment;
    review.create();

    const notification = new Notification();
    notification.request_id = request.id;
    notification.recipient_role = UserTypeEnum.BENEFICIARY;
    notification.emiiter_id = c.get("user").id;
    notification.recipient_id = request.beneficiary_id;
    notification.status = NotificationStatusEnum.RATED;
    notification.create();

    pubsub.broadcast("notification", {
      notification: {
        ...notification,
        request_title: request.title,
        request_urgency: request.urgency,
        rating: body.rating,
        rating_comment: body.comment,
        volunter_id: c.get("user").id,
        volunteer_username: User.findById(c.get("user").id)?.username ?? "",
      } as NotificationPayload,
    });

    const subs = PushSubscription.findByUserId(request.beneficiary_id).map(
      (r: any) => JSON.parse(r.subscription)
    );

    const notificationMessage = getNotificationMessage({
      ...notification,
      request_title: request.title,
      request_urgency: request.urgency,
      volunter_id: c.get("user").id,
      rating: body.rating,
      volunteer_username: User.findById(c.get("user").id)?.username ?? "",
    } as NotificationPayload);

    // Build a small payload
    const payload = JSON.stringify({
      title: "Help Me Notification",
      body: notificationMessage,
      url: `/app/requests/${request.id}`,
    });

    // end to each
    await Promise.all(
      subs.map((sub) =>
        webpush.sendNotification(sub, payload).catch(console.error)
      )
    );
  }

  request.complete();

  const message = new Message();
  message.is_system = true;
  message.request_id = request.id;
  message.content = `Request completed by ${c.get("user").username}`;
  message.create();

  pubsub.broadcast("message", { message });

  const notification = new Notification();
  notification.request_id = request.id;
  notification.recipient_role = UserTypeEnum.BENEFICIARY;
  notification.emiiter_id = c.get("user").id;
  notification.recipient_id = request.beneficiary_id;
  notification.status = NotificationStatusEnum.DONE;
  notification.create();

  pubsub.broadcast("notification", {
    notification: {
      ...notification,
      request_title: request.title,
      request_urgency: request.urgency,
      volunter_id: c.get("user").id,
      volunteer_username: User.findById(c.get("user").id)?.username ?? "",
    } as NotificationPayload,
  });

  const subs = PushSubscription.findByUserId(request.beneficiary_id).map(
    (r: any) => JSON.parse(r.subscription)
  );

  const notificationMessage = getNotificationMessage({
    ...notification,
    request_title: request.title,
    request_urgency: request.urgency,
    volunter_id: c.get("user").id,
    volunteer_username: User.findById(c.get("user").id)?.username ?? "",
  } as NotificationPayload);

  // Build a small payload
  const payload = JSON.stringify({
    title: "Help Me Notification",
    body: notificationMessage,
    url: `/app/requests/${request.id}`,
  });

  // end to each
  await Promise.all(
    subs.map((sub) =>
      webpush.sendNotification(sub, payload).catch(console.error)
    )
  );

  return c.json({
    success: true,
    data: request,
  });
};

export const getRequestMessages = async (c: Context) => {
  const { id } = c.req.param();
  const request = Request.findById(id);
  if (!request) {
    return c.notFound();
  }
  const messages = Message.findByRequest(request.id);
  return c.json({
    success: true,
    data: messages,
  });
};

export const getRequestMessagesByUser = async (c: Context) => {
  const user_id = c.get("user").id;

  const messages = Message.findWithMetaByUser(user_id);
  return c.json({
    success: true,
    data: messages,
  });
};

export async function markMessageRead(c: Context) {
  const user = c.get("user");
  const messageId = c.req.param("messageId");
  Message.markOneRead(user.id, messageId);
  return c.json({ success: true });
}

export const createRequestMessage = async (c: Context) => {
  const { id } = c.req.param();
  const user_id = c.get("user").id;
  const body = await c.req.json();
  const request = Request.findById(id);
  if (!request) {
    return c.notFound();
  }
  if (request.beneficiary_id !== user_id && request.volunteer_id !== user_id) {
    return c.json(
      {
        success: false,
        message: "Forbidden",
      },
      403
    );
  }
  const message = new Message();
  message.request_id = request.id;
  message.user_id = c.get("user").id;
  message.content = body.content;
  message.create();

  const recievMessagePayload = Message.findMetaByUserAndRequest(
    c.get("user").id,
    request.id
  );

  pubsub.broadcast(`subscribe_message`, {
    recievMessagePayload,
    targetUserID:
      c.get("user").type === UserTypeEnum.BENEFICIARY
        ? recievMessagePayload.volunteer.id
        : recievMessagePayload.beneficiary.id,
  });

  pubsub.broadcast("message", { message });

  return c.json({
    success: true,
    data: message,
  });
};
