const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

transporter.verify((error) => {
  if (error) {
    console.error("Email transporter error:", error.message);
  }
});

const sendEmail = async ({ to, subject, html }) => {
  try {
    const info = await transporter.sendMail({
      from: `"Emergency Alert System" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      html,
    });
    console.log(`Email sent: ${info.messageId}`);
    return info;
  } catch (error) {
    console.error("Email Error:", error.message);
    throw error;
  }
};

const sendSOSEmail = async (contact, userName, location, emergencyType) => {
  const locationUrl = `https://maps.google.com/?q=${location.coordinates[1]},${location.coordinates[0]}`;
  await sendEmail({
    to: contact.email,
    subject: `EMERGENCY: ${userName} needs help!`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto;">
        <div style="background: #e53e3e; color: white; padding: 20px; border-radius: 8px 8px 0 0;">
          <h1 style="margin:0">🚨 Emergency Alert</h1>
        </div>
        <div style="padding: 20px; background: #fff3f3; border: 1px solid #e53e3e;">
          <p><strong>${userName}</strong> has triggered an SOS alert.</p>
          <p><strong>Emergency Type:</strong> ${emergencyType.replace(/_/g, " ").toUpperCase()}</p>
          <p><strong>Location:</strong> <a href="${locationUrl}" style="color:#e53e3e">View on Google Maps</a></p>
          <p>Please try to contact them or alert the authorities immediately.</p>
        </div>
        <div style="background: #eee; padding: 10px; text-align: center; border-radius: 0 0 8px 8px; font-size: 12px;">
          Emergency Response Platform
        </div>
      </div>
    `,
  });
};

// ← This was missing — caused crash in incident controller
const sendSOSEmailToAll = async (contacts, userName, location, emergencyType) => {
  const promises = contacts.map((contact) =>
    sendSOSEmail(contact, userName, location, emergencyType).catch((err) =>
      console.error(`Failed to send SOS email to ${contact.email}:`, err.message)
    )
  );
  await Promise.all(promises);
};

const sendOTPEmail = async (email, otp) => {
  await sendEmail({
    to: email,
    subject: "Your OTP for Emergency Response Platform",
    html: `
      <div style="font-family: Arial, sans-serif; text-align: center; padding: 40px;">
        <h2>Your OTP Code</h2>
        <div style="font-size: 36px; font-weight: bold; color: #e53e3e; letter-spacing: 8px; padding: 20px;">
          ${otp}
        </div>
        <p>This OTP expires in 10 minutes. Do not share it with anyone.</p>
      </div>
    `,
  });
};

module.exports = { sendEmail, sendSOSEmail, sendSOSEmailToAll, sendOTPEmail };