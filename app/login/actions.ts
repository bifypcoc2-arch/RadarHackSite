"use server";

import { db } from "@/lib/db";
import bcrypt from "bcryptjs";
import { signSession } from "@/lib/auth";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

const secureCookie = process.env.NODE_ENV === "production" && process.env.COOKIE_SECURE !== "false";

export async function login(formData: FormData) {
  const email = String(formData.get("email") || "").toLowerCase();
  const password = String(formData.get("password") || "");
  const user = await db.user.findUnique({ where: { email } });
  if (!user || !(await bcrypt.compare(password, user.passwordHash))) redirect("/login?error=1");
  const token = await signSession({ userId: user.id, email: user.email });
  (await cookies()).set("radar_session", token, {
    httpOnly: true,
    sameSite: "lax",
    secure: secureCookie,
    path: "/",
    maxAge: 604800,
  });
  redirect("/dashboard");
}
