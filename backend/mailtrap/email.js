import {
  PASSWORD_RESET_REQUEST_TEMPLATE,
  PASSWORD_RESET_SUCCESS_TEMPLATE,
  VERIFICATION_EMAIL_TEMPLATE,
} from "./emailTemplate.js";
import { client, sender } from "./mailtrap.config.js";

export const sendVerificationEmail = async (email, verificationToken) => {
  const recipient = [{ email }];

  try {
    await client.send({
      from: sender,
      to: recipient,
      subject: "Verify your email",
      html: VERIFICATION_EMAIL_TEMPLATE.replace(
        "{verificationCode}",
        verificationToken
      ),
      category: "Email verification",
    });
    console.log("Email was send");
  } catch (error) {
    console.error(error);
    throw new Error("cannot send");
  }
};

export const sendWelcomeEmail = async (email, name) => {
  const recipient = [{ email }];
  try {
    await client.send({
      from: sender,
      to: recipient,
      template_uuid: "b0e3496e-0b3a-489f-88c7-aa586a1e40aa",
      template_variables: {
        company_info_name: "Auth ToT",
        name: name,
      },
    });
    console.log("Email was send");
  } catch (error) {
    throw new Error("cannot send");
  }
};

export const sendPassResetEmail = async (email, resetUrl) => {
  const recipient = [{ email }];
  try {
    await client.send({
      from: sender,
      to: recipient,
      subject: "reset",
      html: PASSWORD_RESET_REQUEST_TEMPLATE.replace("{resetURL}", resetUrl),
      category: "Pass Reset",
    });
    console.log("Email was send");
  } catch (error) {
    throw new Error("cannot send");
  }
};

export const sendResetSuccessEmail = async (email) => {
  const recipient = [{ email }];
  try {
    await client.send({
      from: sender,
      to: recipient,
      subject: "reset sucess",
      html: PASSWORD_RESET_SUCCESS_TEMPLATE,
      category: "Pass Reset",
    });
    console.log("Email was send");
  } catch (error) {
    throw new Error("cannot send");
  }
};
