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

export async function sendPasswordResetEmailReal(payload: {
  toEmail: string;
  fullName: string;
  resetLink: string;
}) {
  const { toEmail, fullName, resetLink } = payload;

  if (!transporter) {
    console.warn("[EMAIL] SMTP config missing. Falling back to console output.");
    console.log("[EMAIL RESET PASSWORD]");
    console.log(`To: ${toEmail}`);
    console.log(`Hi ${fullName}, reset your password using this link:`);
    console.log(resetLink);
    return { delivered: false };
  }

  await transporter.sendMail({
    from: EMAIL_FROM,
    to: toEmail,
    subject: "Dat lai mat khau tai khoan JobFinder",
    html: `
      <p>Xin chao ${fullName},</p>
      <p>Ban vua yeu cau dat lai mat khau. Bam vao lien ket ben duoi de tiep tuc:</p>
      <p><a href="${resetLink}">${resetLink}</a></p>
      <p>Lien ket co hieu luc trong mot thoi gian ngan.</p>
      <p>Neu ban khong thuc hien yeu cau nay, vui long bo qua email.</p>
    `,
  });

  return { delivered: true };
}
