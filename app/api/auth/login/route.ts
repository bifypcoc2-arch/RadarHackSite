import bcrypt from "bcryptjs";
import { NextRequest, NextResponse } from "next/server";
import { signSession } from "@/lib/auth";
import { db } from "@/lib/db";

export const runtime = "nodejs";
const secureCookie = process.env.NODE_ENV === "production" && process.env.COOKIE_SECURE !== "false";

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  const email = typeof body?.email === "string" ? body.email.trim().toLowerCase().slice(0, 254) : "";
  const password = typeof body?.password === "string" ? body.password.slice(0, 128) : "";

  if (!email || !password) return NextResponse.json({ error: "Email and password are required" }, { status: 400 });

  const user = await db.user.findUnique({ where: { email }, include: { license: true } });
  if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
    return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });
  }

  const token = await signSession({ userId: user.id, email: user.email });
  const response = NextResponse.json({ user: { name: user.name, email: user.email, plan: user.license?.plan ?? "none", licenseStatus: user.license?.status ?? "inactive" } });
  response.cookies.set("radar_session", token, { httpOnly: true, sameSite: "lax", secure: secureCookie, path: "/", maxAge: 604800 });
  return response;
}
