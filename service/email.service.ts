import nodemailer from "nodemailer";
import type SMTPTransport from "nodemailer/lib/smtp-transport";
import hbs from "handlebars";
import fs from "node:fs";
import path from "node:path";
import { SMTP_HOSTNAME, SMTP_PASSWORD, SMTP_USERNAME } from "../env.config";

const content = fs.readFileSync(path.join(__dirname, '../templates/email-template.hbs'), 'utf-8');

const tpl = hbs.compile(content);


// TO DO: replace key
const config: SMTPTransport.Options = {
    host: SMTP_HOSTNAME,
    port: 465,
    secure: true, // upgrade later with STARTTLS
    auth: {
        user: SMTP_USERNAME,
        pass: SMTP_PASSWORD
    }
};


const transporter = nodemailer.createTransport(config);

transporter.once('error', (err) => console.error('SMTP', err));

export interface SendMailProps { subject: string, message: string, to: string};

export const sendMail = (props: SendMailProps) => {
    return transporter.sendMail({
        from: "bunuconstantinjun@gmail.com",
        to: props.to,
        subject: props.subject,
        html: tpl(props),
    });
}

export default transporter;