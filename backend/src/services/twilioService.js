import twilio from "twilio";
import dotenv from "dotenv";

dotenv.config({ path: "./src/.env" });

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const verifyServiceSid = process.env.TWILIO_VERIFY_SERVICE_SID;

// Initialize Twilio client with validation
const client = twilio(accountSid, authToken);

/**
 * Formats Pakistani phone numbers for Twilio
 * @param {string} phoneNumber - Raw phone number
 * @returns {string} Formatted phone number with +92 prefix
 */
const formatPhoneNumber = (phoneNumber) => {
  if (!phoneNumber) throw new Error("Phone number is required");

  // Remove all non-digit characters
  const cleaned = phoneNumber.toString().replace(/\D/g, "");

  // Validate length
  if (cleaned.length !== 10 && cleaned.length !== 11 && cleaned.length !== 12) {
    throw new Error("Invalid Pakistani phone number length");
  }

  // Handle different formats
  if (cleaned.startsWith("0")) {
    return `+92${cleaned.substring(1)}`;
  }
  if (cleaned.startsWith("92")) {
    return `+${cleaned}`;
  }
  if (cleaned.length === 10) {
    return `+92${cleaned}`;
  }

  return `+${cleaned}`;
};

export const sendVerificationCode = async (phoneNumber, channel = "sms") => {
  try {
    if (!phoneNumber) throw new Error("Phone number is required");

    const formattedNumber = formatPhoneNumber(phoneNumber);
    console.log(`Attempting to send verification to: ${formattedNumber}`);

    // Verify the service exists
    try {
      const service = await client.verify.v2.services(verifyServiceSid).fetch();
      console.log(`Using Twilio Verify Service: ${service.friendlyName}`);
    } catch (serviceError) {
      console.error("Twilio Service Verification Failed:", serviceError);
      throw new Error("Twilio verification service not found or inaccessible");
    }

    const verification = await client.verify.v2
      .services(verifyServiceSid)
      .verifications.create({
        to: formattedNumber,
        channel,
        locale: "en", // Optional: specify language
      });

    console.log(`Verification sent successfully. SID: ${verification.sid}`);

    return {
      success: true,
      verificationSid: verification.sid,
      formattedNumber,
    };
  } catch (error) {
    console.error("Twilio Verification Error Details:", {
      message: error.message,
      code: error.code,
      status: error.status,
      moreInfo: error.moreInfo,
    });

    return {
      success: false,
      error: "Failed to send verification code. Please try again.",
      details: error.message,
    };
  }
};

export const verifyCode = async (phoneNumber, code) => {
  try {
    if (!phoneNumber || !code) {
      throw new Error("Phone number and code are required");
    }

    const formattedNumber = formatPhoneNumber(phoneNumber);
    console.log(`Verifying code for: ${formattedNumber}`);

    const verificationCheck = await client.verify.v2
      .services(verifyServiceSid)
      .verificationChecks.create({
        to: formattedNumber,
        code,
      });

    console.log(`Verification status: ${verificationCheck.status}`);

    return {
      success: verificationCheck.status === "approved",
      status: verificationCheck.status,
      verificationCheck,
    };
  } catch (error) {
    console.error("Twilio Verification Check Error:", {
      message: error.message,
      code: error.code,
      status: error.status,
    });

    return {
      success: false,
      error: "Invalid verification code or expired. Please try again.",
      details: error.message,
    };
  }
};
