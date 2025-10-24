import nodemailer from "nodemailer";

// Email configuration
const RECIPIENT_EMAIL = "info@evergreenlandinvestments.com";

// Create email transporter
// Note: For production, configure with real SMTP settings in environment variables
function createTransporter() {
  // For development/testing, you can use Gmail SMTP or any email service
  // You'll need to set these in your .env file:
  // EMAIL_HOST=smtp.gmail.com
  // EMAIL_PORT=587
  // EMAIL_USER=your-email@gmail.com
  // EMAIL_PASS=your-app-specific-password

  const emailHost = process.env.EMAIL_HOST || "smtp.gmail.com";
  const emailPort = parseInt(process.env.EMAIL_PORT || "587");
  const emailUser = process.env.EMAIL_USER;
  const emailPass = process.env.EMAIL_PASS;

  // If no email credentials configured, use mock mode
  if (!emailUser || !emailPass) {
    console.warn("⚠️  Email: MOCK MODE (credentials not configured)");

    // Return a mock transporter for development
    return {
      sendMail: async (mailOptions: any) => {
        console.log(
          `📧 Mock email to ${mailOptions.to}: ${mailOptions.subject}`
        );
        return { messageId: "mock-" + Date.now() };
      },
    };
  }

  console.log(`✉️  Email: Configured (${emailUser})`);

  return nodemailer.createTransport({
    host: emailHost,
    port: emailPort,
    secure: emailPort === 465, // true for 465, false for other ports
    auth: {
      user: emailUser,
      pass: emailPass,
    },
  });
}

interface FormData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  propertyAddress: string;
  city: string;
  state: string;
  zipCode: string;
  propertyType: string;
  propertyCondition: string;
  desiredTimeline: string;
  additionalInfo?: string;
}

export async function sendCashOfferEmail(formData: FormData) {
  const transporter = createTransporter();

  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body {
          font-family: Arial, sans-serif;
          line-height: 1.6;
          color: #333;
        }
        .container {
          max-width: 600px;
          margin: 0 auto;
          padding: 20px;
        }
        .header {
          background: linear-gradient(135deg, #2d6a4f 0%, #52b788 100%);
          color: white;
          padding: 30px;
          border-radius: 8px 8px 0 0;
          text-align: center;
        }
        .content {
          background: #f8f9fa;
          padding: 30px;
          border-radius: 0 0 8px 8px;
        }
        .section {
          background: white;
          padding: 20px;
          margin-bottom: 20px;
          border-radius: 8px;
          border-left: 4px solid #2d6a4f;
        }
        .section-title {
          color: #2d6a4f;
          font-weight: bold;
          font-size: 18px;
          margin-bottom: 15px;
        }
        .field {
          margin-bottom: 12px;
        }
        .label {
          font-weight: bold;
          color: #555;
          display: inline-block;
          width: 180px;
        }
        .value {
          color: #333;
        }
        .footer {
          text-align: center;
          padding: 20px;
          color: #666;
          font-size: 12px;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1 style="margin: 0;">🏡 New Cash Offer Request</h1>
          <p style="margin: 10px 0 0 0;">Evergreen Land Investments</p>
        </div>

        <div class="content">
          <div class="section">
            <div class="section-title">👤 Contact Information</div>
            <div class="field">
              <span class="label">Name:</span>
              <span class="value">${formData.firstName} ${
    formData.lastName
  }</span>
            </div>
            <div class="field">
              <span class="label">Email:</span>
              <span class="value"><a href="mailto:${formData.email}">${
    formData.email
  }</a></span>
            </div>
            <div class="field">
              <span class="label">Phone:</span>
              <span class="value"><a href="tel:${formData.phone}">${
    formData.phone
  }</a></span>
            </div>
          </div>

          <div class="section">
            <div class="section-title">📍 Property Details</div>
            <div class="field">
              <span class="label">Address:</span>
              <span class="value">${formData.propertyAddress}</span>
            </div>
            <div class="field">
              <span class="label">Location:</span>
              <span class="value">${formData.city}, ${formData.state} ${
    formData.zipCode
  }</span>
            </div>
            <div class="field">
              <span class="label">Property Type:</span>
              <span class="value">${formatPropertyType(
                formData.propertyType
              )}</span>
            </div>
            <div class="field">
              <span class="label">Condition:</span>
              <span class="value">${formatCondition(
                formData.propertyCondition
              )}</span>
            </div>
            <div class="field">
              <span class="label">Desired Timeline:</span>
              <span class="value">${formatTimeline(
                formData.desiredTimeline
              )}</span>
            </div>
          </div>

          ${
            formData.additionalInfo
              ? `
          <div class="section">
            <div class="section-title">📝 Additional Information</div>
            <p style="margin: 0; white-space: pre-wrap;">${formData.additionalInfo}</p>
          </div>
          `
              : ""
          }

          <div style="text-align: center; margin-top: 20px;">
            <p style="color: #2d6a4f; font-weight: bold;">
              Follow up with this lead as soon as possible!
            </p>
          </div>
        </div>

        <div class="footer">
          Received on ${new Date().toLocaleString("en-US", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
            timeZone: "America/Chicago",
          })} CST
        </div>
      </div>
    </body>
    </html>
  `;

  const mailOptions = {
    from: process.env.EMAIL_USER || "noreply@evergreenlandinvestments.com",
    to: RECIPIENT_EMAIL,
    subject: `🏡 New Cash Offer Request - ${formData.propertyAddress}`,
    html: htmlContent,
    replyTo: formData.email,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log(`✅ Email sent to ${mailOptions.to}`);
    return { success: true, messageId: info.messageId };
  } catch (error: any) {
    console.error(`❌ Email failed: ${error.message}`);
    throw new Error(`Failed to send email: ${error.message}`);
  }
}

// Helper functions to format values
function formatPropertyType(type: string): string {
  const types: Record<string, string> = {
    "single-family": "Single Family Home",
    "multi-family": "Multi-Family Home",
    condo: "Condo",
    townhouse: "Townhouse",
    land: "Land/Lot",
    other: "Other",
  };
  return types[type] || type;
}

function formatCondition(condition: string): string {
  const conditions: Record<string, string> = {
    excellent: "Excellent",
    good: "Good",
    fair: "Fair",
    "needs-repair": "Needs Repair",
    "major-repair": "Major Repair Needed",
  };
  return conditions[condition] || condition;
}

function formatTimeline(timeline: string): string {
  const timelines: Record<string, string> = {
    asap: "ASAP",
    "1-month": "Within 1 month",
    "3-months": "1-3 months",
    "6-months": "3-6 months",
    flexible: "Flexible",
  };
  return timelines[timeline] || timeline;
}
