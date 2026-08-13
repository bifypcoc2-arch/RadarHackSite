import { NextResponse } from "next/server";

import { consumeEmailVerification } from "@/lib/verification";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const token = url.searchParams.get("token") ?? "";

  let status: string;
  try {
    status = await consumeEmailVerification(token);
  } catch (error) {
    console.error("email verification failed", error);
    status = "invalid";
  }

  const target = new URL("/verify", url.origin);
  target.searchParams.set("status", status);

  return NextResponse.redirect(target, { status: 303 });
}
