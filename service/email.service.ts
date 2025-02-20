import nodemailer from "nodemailer";
import dotenv from "dotenv";
import type SMTPTransport from "nodemailer/lib/smtp-transport";
import hbs from "handlebars";
import fs from "node:fs";
import path from "node:path";

const content = fs.readFileSync(path.join(__dirname, '../templates/email-template.hbs'), 'utf-8');

const tpl = hbs.compile(content);

dotenv.config();

const config: SMTPTransport.Options = {
    host: process.env.SMTP_HOSTNAME,
    port: 465,
    secure: true, // upgrade later with STARTTLS
    auth: {
        user: process.env.SMTP_USERNAME,
        pass: process.env.SMTP_PASSWORD
    }
};

console.log(config)

const transporter = nodemailer.createTransport(config);

transporter.once('error', (err) => console.error('SMTP', err));

export const sendMail = (props: { subject: string, message: string, to: string }) => {
    return transporter.sendMail({
        from: 'noreply@odajiu.com',
        to: props.to,
        subject: props.subject,
        html: tpl(props),
    });
}

export default transporter;