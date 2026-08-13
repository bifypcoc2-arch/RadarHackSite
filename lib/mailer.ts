type SendEmailInput = {
  to: string;
  subject: string;
  html: string;
  text: string;
};

type Provider = "resend" | "smtp" | "console";

const MAIL_FROM =
  process.env.MAIL_FROM || "Foresight <no-reply@foresight.local>";

function resolveProvider(): Provider {
  const configured = process.env.MAIL_PROVIDER?.toLowerCase();
  if (
    configured === "resend" ||
    configured === "smtp" ||
    configured === "console"
  ) {
    return configured;
  }
  if (process.env.RESEND_API_KEY) return "resend";
  if (process.env.SMTP_HOST) return "smtp";
  return "console";
}

async function sendViaResend(input: SendEmailInput): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    throw new Error("RESEND_API_KEY is required when MAIL_PROVIDER=resend");
  }

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      from: MAIL_FROM,
      to: [input.to],
      subject: input.subject,
      html: input.html,
      text: input.text,
    }),
    signal: AbortSignal.timeout(10_000),
  });

  if (!response.ok) {
    const detail = await response.text().catch(() => "");
    throw new Error(
      `Resend responded ${response.status}: ${detail.slice(0, 300)}`,
    );
  }
}

// Works with Gmail app passwords: SMTP_HOST=smtp.gmail.com, SMTP_PORT=587.
async function sendViaSmtp(input: SendEmailInput): Promise<void> {
  const host = process.env.SMTP_HOST;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (!host || !user || !pass) {
    throw new Error(
      "SMTP_HOST, SMTP_USER and SMTP_PASS are required when MAIL_PROVIDER=smtp",
    );
  }

  const port = Number(process.env.SMTP_PORT || 587);
  const { default: nodemailer } = await import("nodemailer");

  const transport = nodemailer.createTransport({
    host,
    port,
    // Port 465 speaks TLS from the first byte, 587 upgrades via STARTTLS.
    secure: port === 465,
    auth: { user, pass },
    connectionTimeout: 15_000,
  });

  await transport.sendMail({
    from: MAIL_FROM,
    to: input.to,
    subject: input.subject,
    text: input.text,
    html: input.html,
  });
}

export async function sendEmail(input: SendEmailInput): Promise<void> {
  const provider = resolveProvider();

  if (provider === "console") {
    console.info(
      `[mailer:console] to=${input.to} subject="${input.subject}"\n${input.text}`,
    );
    return;
  }

  if (provider === "smtp") {
    await sendViaSmtp(input);
    return;
  }

  await sendViaResend(input);
}
