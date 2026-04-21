import nodemailer from "nodemailer";

const SMTP_HOST = process.env.SMTP_HOST;
const SMTP_PORT = Number(process.env.SMTP_PORT || 587);
const SMTP_USER = process.env.SMTP_USER;
const SMTP_PASS = process.env.SMTP_PASS;
const EMAIL_FROM = process.env.EMAIL_FROM || SMTP_USER || "noreply@example.com";

const transporter =
  SMTP_HOST && SMTP_USER && SMTP_PASS
    ? nodemailer.createTransport({
        host: SMTP_HOST,
        port: SMTP_PORT,
        secure: SMTP_PORT === 465,
        auth: {
          user: SMTP_USER,
          pass: SMTP_PASS,
        },
      })
    : null;

export async function sendVerificationEmailReal(payload: {
  toEmail: string;
  fullName: string;
  verifyLink: string;
}) {
  const { toEmail, fullName, verifyLink } = payload;

  if (!transporter) {
    console.warn("[EMAIL] SMTP config missing. Falling back to console output.");
    console.log("[EMAIL VERIFY]");
    console.log(`To: ${toEmail}`);
    console.log(`Hi ${fullName}, verify your email using this link:`);
    console.log(verifyLink);
    return { delivered: false };
  }

  await transporter.sendMail({
    from: EMAIL_FROM,
    to: toEmail,
    subject: "Xac thuc email tai khoan JobFinder",
    html: `
      <p>Xin chao ${fullName},</p>
      <p>Vui long bam vao lien ket ben duoi de xac thuc email tai khoan cua ban:</p>
      <p><a href="${verifyLink}">${verifyLink}</a></p>
      <p>Neu ban khong thuc hien hanh dong nay, vui long bo qua email.</p>
    `,
  });

  return { delivered: true };
}
