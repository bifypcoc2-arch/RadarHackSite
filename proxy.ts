import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";
const secret = new TextEncoder().encode(process.env.AUTH_SECRET || "development-secret-change-me-32chars");
export async function proxy(req: NextRequest) { if (!req.nextUrl.pathname.startsWith("/dashboard")) return NextResponse.next(); const token = req.cookies.get("radar_session")?.value; if (!token) return NextResponse.redirect(new URL("/login", req.url)); try { await jwtVerify(token, secret); return NextResponse.next(); } catch { const res = NextResponse.redirect(new URL("/login", req.url)); res.cookies.delete("radar_session"); return res; } }
export const config = { matcher: ["/dashboard/:path*"] };
