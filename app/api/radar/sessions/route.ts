import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import {
  createPublicSessionId,
  isRadarServerAuthorized,
  normalizeRadarToken,
  normalizeRadarUsername,
  radarSessionUrl,
} from "@/lib/radarSessions";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  if (!isRadarServerAuthorized(request)) {
    return NextResponse.json({ error: "Unauthorized radar server" }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const username = normalizeRadarUsername(body?.username);

  if (username.length < 2) {
    return NextResponse.json({ error: "A valid username is required" }, { status: 400 });
  }

  const map = normalizeRadarToken(body?.map, "de_cache");
  const steamId = normalizeRadarToken(body?.steamId) || null;
  const serverId = normalizeRadarToken(body?.serverId) || null;
  const expiresAt = new Date(Date.now() + 6 * 60 * 60 * 1000);
  const origin = process.env.NEXT_PUBLIC_APP_URL || request.nextUrl.origin;

  if (steamId && serverId) {
    const existing = await db.liveRadarSession.findFirst({
      where: { steamId, serverId, status: "live", expiresAt: { gt: new Date() } },
      orderBy: { createdAt: "desc" },
    });

    if (existing) {
      return NextResponse.json({
        sessionId: existing.publicId,
        username: existing.username,
        status: existing.status,
        url: radarSessionUrl(origin, existing.username, existing.publicId),
        expiresAt: existing.expiresAt,
      });
    }
  }

  for (let attempt = 0; attempt < 5; attempt += 1) {
    const publicId = createPublicSessionId();

    try {
      const session = await db.liveRadarSession.create({
        data: { publicId, username, steamId, serverId, map, expiresAt },
      });

      return NextResponse.json(
        {
          sessionId: session.publicId,
          username: session.username,
          status: session.status,
          url: radarSessionUrl(origin, session.username, session.publicId),
          expiresAt: session.expiresAt,
        },
        { status: 201 },
      );
    } catch (error) {
      if (attempt === 4) console.error("Unable to create radar session", error);
    }
  }

  return NextResponse.json({ error: "Unable to create radar session" }, { status: 500 });
}
