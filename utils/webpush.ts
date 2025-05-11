import webpush from "web-push";

// configure with your env vars
webpush.setVapidDetails(
  "mailto:support@yourdomain.com",
  process.env.VAPID_PUBLIC_KEY!,
  process.env.VAPID_PRIVATE_KEY!
);

export default webpush;
