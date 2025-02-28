import dotenv from "dotenv";

dotenv.config();

export const SMTP_HOSTNAME = process.env.SMTP_HOSTNAME;
export const SMTP_USERNAME = process.env.SMTP_USERNAME;
export const SMTP_PASSWORD = process.env.SMTP_PASSWORD;


export const SITE_URL = process.env.APP_URL;

console.log(SITE_URL);

export const PORT = Number(process.env.PORT ?? 3000);