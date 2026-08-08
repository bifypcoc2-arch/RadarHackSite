import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";

const secureCookie = process.env.NODE_ENV === "production" && process.env.COOKIE_SECURE !== "false";

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const user = await db.user.findUnique({ where: { id: session.userId }, include: { license: true } });
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  return NextResponse.json({ user: { name: user.name, email: user.email, plan: user.license?.plan ?? "none", licenseStatus: user.license?.status ?? "inactive" } });
}

export async function DELETE() {
  const response = NextResponse.json({ ok: true });
  response.cookies.set("radar_session", "", { httpOnly: true, sameSite: "lax", secure: secureCookie, path: "/", maxAge: 0 });
  return response;
}
