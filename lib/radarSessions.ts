import { randomBytes, timingSafeEqual } from "node:crypto";
import type { NextRequest } from "next/server";

const USERNAME_MAX_LENGTH = 24;
const TOKEN_MAX_LENGTH = 64;

export function normalizeRadarUsername(value: unknown) {
  if (typeof value !== "string") return "";

  return value
    .trim()
    .replace(/^@/, "")
    .replace(/[^a-zA-Z0-9_-]/g, "")
    .slice(0, USERNAME_MAX_LENGTH);
}

export function normalizeRadarToken(value: unknown, fallback = "") {
  if (typeof value !== "string") return fallback;
  return (
    value
      .trim()
      .replace(/[^a-zA-Z0-9_.:-]/g, "")
      .slice(0, TOKEN_MAX_LENGTH) || fallback
  );
}

export function createPublicSessionId() {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  return Array.from(
    randomBytes(8),
    (byte) => alphabet[byte % alphabet.length],
  ).join("");
}

export function isRadarServerAuthorized(request: NextRequest) {
  const expected = process.env.RADAR_INGEST_SECRET;
  const received = request.headers.get("x-radar-secret");

  if (!expected || !received) return false;

  const expectedBuffer = Buffer.from(expected);
  const receivedBuffer = Buffer.from(received);

  return (
    expectedBuffer.length === receivedBuffer.length &&
    timingSafeEqual(expectedBuffer, receivedBuffer)
  );
}

export function radarSessionUrl(origin: string, username: string, publicId: string) {
  return `${origin.replace(/\/$/, "")}/radar/${encodeURIComponent(username)}/${publicId}`;
}
