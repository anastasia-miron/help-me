import { type Context } from "hono";

import User, { UserTypeEnum } from "../models/user";
import { UserStatusEnum } from "../models/user";
import Beneficiary from "../models/beneficiary";
import Volunteer from "../models/volunteer";
import Token, { TokenStatusEnum, TokenTypeEnum } from "../models/token";
import { getDatabase } from "../utils/database";
import hbs from "handlebars";
import fs from "node:fs";
import path from "node:path";
import { sendMail, type SendMailProps } from "../service/email.service";

import { updateTokensStatusQuery } from "../db/queries";
const SITE_URL = "http://localhost:5173";

const filepathPasswordRecovery = path.join(
  __dirname,
  "../templates/password-recovery.hbs"
);
const contentPasswordRecovery = fs.readFileSync(
  filepathPasswordRecovery,
  "utf-8"
);
const templatePasswordRecovery = hbs.compile(contentPasswordRecovery);

const filepathEmailVerification = path.join(
  __dirname,
  "../templates/email-verification.hbs"
);
const contentEmailVerification = fs.readFileSync(
  filepathEmailVerification,
  "utf-8"
);
const templateEmailVerification = hbs.compile(contentEmailVerification);

const db = getDatabase();

export const register = async (c: Context) => {
  const body = await c.req.json();
  const { email, password, username, phone } = body;

  let user = User.getByEmail(email);

  if (user && user.status === UserStatusEnum.DELETED) {
    user.status = UserStatusEnum.ACTIVE;
    user.username = username;
    user.phone = phone;
    user.update();
    user.updatePassword(password);
    return c.json({ success: true, data: user.getJwtToken() });
  }

  user = new User();
  user.email = email;
  user.password = password;
  user.status = UserStatusEnum.ACTIVE;
  user.username = username;
  user.phone = phone;
  user.is_verified = false;

  try {
    user.create();

    const token = new Token();
    token.user_id = user.id;
    token.type = TokenTypeEnum.VERIFICATION;
    token.create();

    console.log("Token:", token.token);
    console.log("Email:", email);

    const mailOptions: SendMailProps = {
      to: email,
      subject: "Verify Your Email",
      message: templateEmailVerification({
        token: token.token,
        SITE_URL,
        email: encodeURIComponent(email),
      }),
    };
    await sendMail(mailOptions);
    return c.json({ success: true, data: user.getJwtToken() });
  } catch (error) {
    console.log(error);
    return c.json({ success: false, message: "Registration failed!" });
  }

};

export const login = async (c: Context) => {
  const body = await c.req.json();
  const { email, password } = body;
  const user = User.getByEmail(email);

  if (!user) {
    return c.json({ success: false, message: "Invalid credentials" });
  }

  if (user.status !== UserStatusEnum.ACTIVE) {
    return c.json({ success: false, message: "Invalid credentials" });
  }

  const isValid = user.checkPassword(password);
  if (!isValid) {
    return c.json({ success: false, message: "Invalid credentials" });
  }

  return c.json({ success: true, data: user.getJwtToken() });
};

export const logout = async (c: Context) => {
  return c.json({ success: true, data: null });
};

export const refreshToken = async (c: Context) => {
  const user = c.get("user");
  return c.json({ success: true, data: user.getJwtToken() });
};

export const markFirstVisitSeen = async (c: Context) => {
  const { id: user_id } = c.get("user") as { id: string };
  const user = User.findById(user_id);

  if (!user) {
    return c.json({ success: false, message: "User not found" }, 404);
  }

  user.markFirstVisitSeen();

  return c.json({ success: true, data: user.getJwtToken() });
};

export const completeRegister = async (c: Context) => {
  const body = await c.req.json();
  const currentUser = c.get("user");

  if (currentUser.type !== UserTypeEnum.NONE) {
    return c.json({ success: false, message: "Cannot redefine user type" });
  }

  currentUser.type = body.type;
  currentUser.update();

  if (body.type === "beneficiary") {
    // Create beneficiary
    const entity = new Beneficiary();
    entity.user_id = currentUser.id;
    entity.needs = body.needs;
    entity.location = body.location;
    entity.create();

    return c.json({
      success: true,
      data: {
        entity,
        token: currentUser.getJwtToken(),
      },
    });
  }

  if (body.type === "volunteer") {
    // Create volunteer
    const entity = new Volunteer();
    entity.user_id = currentUser.id;
    entity.skills = body.skills;
    entity.availability = body.availability;
    entity.create();

    currentUser.type = UserTypeEnum.VOLUNTEER;
    currentUser.update();

    return c.json({
      success: true,
      data: {
        entity,
        token: currentUser.getJwtToken(),
      },
    });
  }
  return c.json({ success: false, message: "Registration failed!" });
};

export const passwordRecovery = async (c: Context) => {
  try {
    const { email } = await c.req.json();
    if (!email) {
      return c.json({ success: false, message: "Email is required." }, 400);
    }

    const user = User.getByEmail(email);
    if (!user) {
      return c.json({ success: false, message: "User not found." }, 404);
    }

    updateTokensStatusQuery.run({
      userId: user.id,
      status: TokenStatusEnum.OUTDATED,
      type: TokenTypeEnum.PASSWORD,
    });

    const token = new Token();
    token.user_id = user.id;
    token.type = TokenTypeEnum.PASSWORD;
    token.create();

    const mailOptions: SendMailProps = {
      to: email,
      subject: "Password Reset",
      message: templatePasswordRecovery({
        token: token.token,
        SITE_URL: SITE_URL,
      }),
    };

    await sendMail(mailOptions);

    return c.json({ success: true, message: "Password reset token sent." });
  } catch (error) {
    const err = error as Error;
    return c.json(
      { success: false, message: "An error occurred.", error: err.message },
      500
    );
  }
};

export const passwordChange = async (c: Context) => {
  try {
    const { token, newPassword } = await c.req.json();

    if (!token || !newPassword) {
      return c.json(
        { success: false, message: "Token and new password are required." },
        400
      );
    }

    const tokenObj = Token.findByToken(token);
    if (!tokenObj || tokenObj.type !== TokenTypeEnum.PASSWORD) {
      return c.json({ success: false, message: "Invalid or expired token." });
    }

    const user = User.findById(tokenObj.user_id);
    if (!user) {
      return c.json({ success: false, message: "User not found." }, 404);
    }

    user.updatePassword(newPassword);

    tokenObj.status = TokenStatusEnum.USED;
    tokenObj.update();

    return c.json({ success: true, message: "Password changed successfully." });
  } catch (error) {
    const err = error as Error;
    return c.json(
      { success: false, message: "An error occurred.", error: err.message },
      500
    );
  }
};

export const emailValidation = async (c: Context) => {
  const { token, email } = await c.req.json();

  const user = User.getByEmail(email);
  if (!user) return c.json({ success: false, message: "Invalid token" });

  const tokenObj = Token.findByToken(token);
  if (
    !tokenObj ||
    tokenObj.user_id !== user.id ||
    tokenObj.type !== TokenTypeEnum.VERIFICATION
  ) {
    return c.json({ success: false, message: "Invalid or expired token" });
  }
  user.is_verified = true;
  user.update();

  tokenObj.status = TokenStatusEnum.USED;
  tokenObj.update();

  return c.json({ success: true, data: "Email verified successfully!" });
};

export const sendVerifyEmail = async (c: Context) => {
  const { email, id } = c.get("user");

  updateTokensStatusQuery.run({
    userId: id,
    status: TokenStatusEnum.OUTDATED,
    type: TokenTypeEnum.VERIFICATION,
  });

  const token = new Token();
  token.user_id = c.get("user").id;
  token.type = TokenTypeEnum.VERIFICATION;
  token.create();

  try {
    const mailOptions: SendMailProps = {
      to: email,
      subject: "Verify Your Email",
      message: templateEmailVerification({
        token: token.token,
        SITE_URL,
        email: encodeURIComponent(email),
      }),
    };
    const res = await sendMail(mailOptions);

    return c.json({ success: true, data: {} });
  } catch (e) {
    return c.json({
      success: false,
      message: "Failed to send verification email",
      error: e,
    });
  }
};
