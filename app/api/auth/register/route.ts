import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";

import { db as prisma } from "@/lib/db";
import { checkRateLimit, clientKey } from "@/lib/rateLimit";
import { issueEmailVerification } from "@/lib/verification";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const MIN_PASSWORD_LENGTH = 10;

export const dynamic = "force-dynamic";

function displayName(email: string): string {
  const local = email.split("@")[0] || "player";
  return local.slice(0, 32);
}

// JSON registration endpoint used by the launcher.
export async function POST(request: Request) {
  const limit = checkRateLimit(clientKey(request.headers, "register-api"), 5);
  if (!limit.allowed) {
    return NextResponse.json(
      { error: "rate_limited", retryAfter: limit.retryAfterSeconds },
      {
        status: 429,
        headers: { "retry-after": String(limit.retryAfterSeconds) },
      },
    );
  }

  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }

  const body = (payload ?? {}) as Record<string, unknown>;
  const email = String(body.email ?? "")
    .trim()
    .toLowerCase();
  const password = String(body.password ?? "");
  const locale = body.locale === "en" ? "en" : "ru";

  if (!EMAIL_PATTERN.test(email) || email.length > 254) {
    return NextResponse.json({ error: "invalid_email" }, { status: 400 });
  }
  if (password.length < MIN_PASSWORD_LENGTH || password.length > 200) {
    return NextResponse.json({ error: "weak_password" }, { status: 400 });
  }

  try {
    const existing = await prisma.user.findUnique({ where: { email } });

    if (existing) {
      if (!existing.emailVerified) {
        await issueEmailVerification({ userId: existing.id, email, locale });
      }
      // Do not leak account existence.
      return NextResponse.json({ status: "verification_sent" }, { status: 202 });
    }

    const passwordHash = await bcrypt.hash(password, 12);
    const user = await prisma.user.create({
      data: { email, passwordHash, name: displayName(email), locale },
      select: { id: true },
    });

    await issueEmailVerification({ userId: user.id, email, locale });
    return NextResponse.json({ status: "verification_sent" }, { status: 201 });
  } catch (error) {
    console.error("register api failed", error);
    return NextResponse.json({ error: "server_error" }, { status: 500 });
  }
}
