"use server";

import { headers } from "next/headers";
import bcrypt from "bcryptjs";

import { db as prisma } from "@/lib/db";
import { clientKey, checkRateLimit } from "@/lib/rateLimit";
import { issueEmailVerification } from "@/lib/verification";

export type SignupState = {
  status: "idle" | "error" | "sent";
  message?: string;
  email?: string;
};

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const MIN_PASSWORD_LENGTH = 10;

function displayName(email: string): string {
  const local = email.split("@")[0] || "player";
  return local.slice(0, 32);
}

function dictionary(locale: "ru" | "en") {
  if (locale === "en") {
    return {
      rateLimited: "Too many attempts. Try again in a minute.",
      invalidEmail: "Enter a valid email address.",
      shortPassword: `Password must be at least ${MIN_PASSWORD_LENGTH} characters.`,
      mismatch: "Passwords do not match.",
      terms: "You must accept the terms.",
      generic: "Could not create the account. Try again later.",
      sent: "Check your inbox and confirm your email address.",
    };
  }

  return {
    rateLimited: "Слишком много попыток. Попробуйте через минуту.",
    invalidEmail: "Введите корректный email.",
    shortPassword: `Пароль должен быть не короче ${MIN_PASSWORD_LENGTH} символов.`,
    mismatch: "Пароли не совпадают.",
    terms: "Нужно принять условия.",
    generic: "Не удалось создать аккаунт. Попробуйте позже.",
    sent: "Проверьте почту и подтвердите адрес.",
  };
}

export async function signupAction(
  _previous: SignupState,
  formData: FormData,
): Promise<SignupState> {
  const locale = formData.get("locale") === "en" ? "en" : "ru";
  const t = dictionary(locale);

  const requestHeaders = await headers();
  const limit = checkRateLimit(clientKey(requestHeaders, "signup"), 5, 60_000);
  if (!limit.allowed) {
    return { status: "error", message: t.rateLimited };
  }

  // Honeypot: bots fill hidden fields, humans never see them.
  if (String(formData.get("company") || "").length > 0) {
    return { status: "sent", message: t.sent };
  }

  const email = String(formData.get("email") || "")
    .trim()
    .toLowerCase();
  const password = String(formData.get("password") || "");
  const passwordConfirm = String(formData.get("passwordConfirm") || "");
  const accepted = formData.get("terms") === "on";

  if (!EMAIL_PATTERN.test(email) || email.length > 254) {
    return { status: "error", message: t.invalidEmail, email };
  }
  if (password.length < MIN_PASSWORD_LENGTH || password.length > 200) {
    return { status: "error", message: t.shortPassword, email };
  }
  if (password !== passwordConfirm) {
    return { status: "error", message: t.mismatch, email };
  }
  if (!accepted) {
    return { status: "error", message: t.terms, email };
  }

  try {
    const existing = await prisma.user.findUnique({ where: { email } });

    if (existing) {
      // Never reveal whether an address is registered.
      if (!existing.emailVerified) {
        await issueEmailVerification({
          userId: existing.id,
          email,
          locale,
        });
      }
      return { status: "sent", message: t.sent, email };
    }

    const passwordHash = await bcrypt.hash(password, 12);
    const user = await prisma.user.create({
      data: { email, passwordHash, name: displayName(email), locale },
      select: { id: true },
    });

    await issueEmailVerification({ userId: user.id, email, locale });
    return { status: "sent", message: t.sent, email };
  } catch (error) {
    console.error("signup failed", error);
    return { status: "error", message: t.generic, email };
  }
}

export async function resendVerificationAction(
  _previous: SignupState,
  formData: FormData,
): Promise<SignupState> {
  const locale = formData.get("locale") === "en" ? "en" : "ru";
  const t = dictionary(locale);
  const email = String(formData.get("email") || "")
    .trim()
    .toLowerCase();

  const requestHeaders = await headers();
  const limit = checkRateLimit(clientKey(requestHeaders, "resend"), 3, 300_000);
  if (!limit.allowed) {
    return { status: "error", message: t.rateLimited, email };
  }

  if (!EMAIL_PATTERN.test(email)) {
    return { status: "error", message: t.invalidEmail, email };
  }

  try {
    const user = await prisma.user.findUnique({ where: { email } });
    if (user && !user.emailVerified) {
      await issueEmailVerification({ userId: user.id, email, locale });
    }
  } catch (error) {
    console.error("resend verification failed", error);
  }

  return { status: "sent", message: t.sent, email };
}
