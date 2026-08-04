import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
const secret = new TextEncoder().encode(process.env.AUTH_SECRET || "development-secret-change-me-32chars");
export type Session = { userId: string; email: string };
export async function signSession(payload: Session) { return new SignJWT(payload).setProtectedHeader({ alg: "HS256" }).setIssuedAt().setExpirationTime("7d").sign(secret); }
export async function verifySession(token: string) { try { const { payload } = await jwtVerify(token, secret); return payload as Session & { exp: number }; } catch { return null; } }
export async function getSession() { const token = (await cookies()).get("radar_session")?.value; return token ? verifySession(token) : null; }
