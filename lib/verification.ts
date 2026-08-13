import { createHash, randomBytes } from "node:crypto";

import { prisma } from "@/lib/db";
import { sendEmail } from "@/lib/mailer";

const TOKEN_TTL_MS = 1000 * 60 * 60 * 24;

function appUrl(): string {
  return (process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000").replace(
    /\/$/,
    "",
  );
}

export function hashToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

function buildEmail(link: string, locale: "ru" | "en") {
  if (locale === "en") {
    return {
      subject: "Confirm your Foresight account",
      text: `Confirm your email to activate your Foresight account:\n\n${link}\n\nThe link expires in 24 hours. If you did not sign up, ignore this message.`,
      html: `<div style="font-family:Arial,Helvetica,sans-serif;background:#0b0e15;color:#e7ecf5;padding:32px">
<h1 style="margin:0 0 16px;font-size:22px;letter-spacing:0.04em">FORESIGHT</h1>
<p style="margin:0 0 20px;color:#9aa7bd">Confirm your email to activate your account.</p>
<p style="margin:0 0 28px"><a href="${link}" style="display:inline-block;background:#3d8bff;color:#fff;text-decoration:none;padding:12px 22px;border-radius:6px;font-weight:700">Confirm email</a></p>
<p style="margin:0;color:#6d7a91;font-size:12px">The link expires in 24 hours. If you did not sign up, ignore this message.</p>
</div>`,
    };
  }

  return {
    subject: "Подтвердите аккаунт Foresight",
    text: `Подтвердите почту, чтобы активировать аккаунт Foresight:\n\n${link}\n\nСсылка действует 24 часа. Если вы не регистрировались, просто проигнорируйте письмо.`,
    html: `<div style="font-family:Arial,Helvetica,sans-serif;background:#0b0e15;color:#e7ecf5;padding:32px">
<h1 style="margin:0 0 16px;font-size:22px;letter-spacing:0.04em">FORESIGHT</h1>
<p style="margin:0 0 20px;color:#9aa7bd">Подтвердите почту, чтобы активировать аккаунт.</p>
<p style="margin:0 0 28px"><a href="${link}" style="display:inline-block;background:#3d8bff;color:#fff;text-decoration:none;padding:12px 22px;border-radius:6px;font-weight:700">Подтвердить почту</a></p>
<p style="margin:0;color:#6d7a91;font-size:12px">Ссылка действует 24 часа. Если вы не регистрировались, просто проигнорируйте письмо.</p>
</div>`,
  };
}

export async function issueEmailVerification(args: {
  userId: string;
  email: string;
  locale?: "ru" | "en";
}): Promise<{ link: string }> {
  const token = randomBytes(32).toString("base64url");

  await prisma.emailVerificationToken.deleteMany({
    where: { userId: args.userId, consumedAt: null },
  });

  await prisma.emailVerificationToken.create({
    data: {
      userId: args.userId,
      tokenHash: hashToken(token),
      expiresAt: new Date(Date.now() + TOKEN_TTL_MS),
    },
  });

  const link = `${appUrl()}/api/auth/verify?token=${token}`;
  await sendEmail({ to: args.email, ...buildEmail(link, args.locale ?? "ru") });

  return { link };
}

export type VerificationOutcome = "verified" | "already" | "expired" | "invalid";

export async function consumeEmailVerification(
  token: string,
): Promise<VerificationOutcome> {
  if (!token || token.length < 20) return "invalid";

  const record = await prisma.emailVerificationToken.findUnique({
    where: { tokenHash: hashToken(token) },
    include: { user: true },
  });

  if (!record) return "invalid";
  if (record.consumedAt) return "already";
  if (record.expiresAt.getTime() < Date.now()) return "expired";
  if (record.user.emailVerified) return "already";

  await prisma.$transaction([
    prisma.emailVerificationToken.update({
      where: { id: record.id },
      data: { consumedAt: new Date() },
    }),
    prisma.user.update({
      where: { id: record.userId },
      data: { emailVerified: new Date() },
    }),
  ]);

  return "verified";
}
