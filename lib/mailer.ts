type SendEmailInput = {
  to: string;
  subject: string;
  html: string;
  text: string;
};

const MAIL_FROM =
  process.env.MAIL_FROM || "Foresight <no-reply@foresight.local>";

function resolveProvider(): "resend" | "console" {
  const configured = process.env.MAIL_PROVIDER?.toLowerCase();
  if (configured === "resend" || configured === "console") return configured;
  return process.env.RESEND_API_KEY ? "resend" : "console";
}

export async function sendEmail(input: SendEmailInput): Promise<void> {
  const provider = resolveProvider();

  if (provider === "console") {
    console.info(
      `[mailer:console] to=${input.to} subject="${input.subject}"\n${input.text}`,
    );
    return;
  }

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
