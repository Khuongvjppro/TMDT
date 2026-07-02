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

export async function sendInviteEmailReal(payload: {
  toEmail: string;
  fullName: string;
  inviteLink: string;
}) {
  const { toEmail, fullName, inviteLink } = payload;

  if (!transporter) {
    console.warn("[EMAIL] SMTP config missing. Falling back to console output.");
    console.log("[EMAIL INVITE]");
    console.log(`To: ${toEmail}`);
    console.log(`Hi ${fullName}, complete your account setup using this link:`);
    console.log(inviteLink);
    return { delivered: false };
  }

  await transporter.sendMail({
    from: EMAIL_FROM,
    to: toEmail,
    subject: "Lời mời tham gia JobFinder",
    html: `
      <p>Xin chao ${fullName},</p>
      <p>Bạn đã được mời tham gia JobFinder. Vui lòng nhấn vào liên kết bên dưới để hoàn tất đăng ký và tạo mật khẩu:</p>
      <p><a href="${inviteLink}">${inviteLink}</a></p>
      <p>Liên kết này sẽ có hiệu lực trong một thời gian ngắn.</p>
      <p>Nếu bạn không yêu cầu điều này, hãy bỏ qua email này.</p>
    `,
  });

  return { delivered: true };
}

export async function sendJobModerationEmail(payload: {
  toEmail: string;
  fullName: string;
  jobTitle: string;
  type: "APPROVED" | "REJECTED";
  rejectReason?: string;
}) {
  const { toEmail, fullName, jobTitle, type, rejectReason } = payload;
  const isApproved = type === "APPROVED";
  const subject = isApproved
    ? `Tin tuyen dung "${jobTitle}" da duoc duyet`
    : `Tin tuyen dung "${jobTitle}" bi tu choi`;

  const bodyHtml = isApproved
    ? `<p>Xin chao ${fullName},</p>
       <p>Tin tuyen dung <strong>${jobTitle}</strong> cua ban da duoc admin phe duyet va da duoc cong bo.</p>
       <p>Ban co the xem lai tin tuyen dung trong trang quan ly viec lam cua minh.</p>`
    : `<p>Xin chao ${fullName},</p>
       <p>Tin tuyen dung <strong>${jobTitle}</strong> cua ban da bi tu choi.</p>
       <p><strong>Ly do:</strong> ${rejectReason ?? "Khong ro"}</p>
       <p>Vui long chinh sua va gui lai neu can.</p>`;

  if (!transporter) {
    console.warn("[EMAIL] SMTP config missing. Falling back to console output.");
    console.log(`[EMAIL JOB ${type}]`);
    console.log(`To: ${toEmail}`);
    console.log(`Subject: ${subject}`);
    console.log(bodyHtml.replace(/<[^>]+>/g, " "));
    return { delivered: false };
  }

  await transporter.sendMail({
    from: EMAIL_FROM,
    to: toEmail,
    subject,
    html: bodyHtml,
  });

  return { delivered: true };
}
