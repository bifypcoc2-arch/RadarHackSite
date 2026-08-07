import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { isRadarServerAuthorized, normalizeRadarToken } from "@/lib/radarSessions";

export const runtime = "nodejs";

type RouteContext = { params: Promise<{ sessionId: string }> };

export async function GET(_request: NextRequest, { params }: RouteContext) {
  const { sessionId } = await params;
  const publicId = normalizeRadarToken(sessionId);
  const session = await db.liveRadarSession.findUnique({ where: { publicId } });

  if (!session) return NextResponse.json({ error: "Radar session not found" }, { status: 404 });

  return NextResponse.json({
    sessionId: session.publicId,
    username: session.username,
    map: session.map,
    status: session.status,
    snapshot: session.snapshot ? JSON.parse(session.snapshot) : null,
    updatedAt: session.updatedAt,
    expiresAt: session.expiresAt,
  });
}

export async function PATCH(request: NextRequest, { params }: RouteContext) {
  if (!isRadarServerAuthorized(request)) {
    return NextResponse.json({ error: "Unauthorized radar server" }, { status: 401 });
  }

  const { sessionId } = await params;
  const publicId = normalizeRadarToken(sessionId);
  const body = await request.json().catch(() => null);
  const snapshot = body?.snapshot === undefined ? undefined : JSON.stringify(body.snapshot);

  if (snapshot && snapshot.length > 100_000) {
    return NextResponse.json({ error: "Snapshot is too large" }, { status: 413 });
  }

  const session = await db.liveRadarSession
    .update({
      where: { publicId },
      data: {
        map: body?.map === undefined ? undefined : normalizeRadarToken(body.map, "de_cache"),
        snapshot,
        status: body?.status === undefined ? undefined : normalizeRadarToken(body.status, "live"),
      },
    })
    .catch(() => null);

  if (!session) return NextResponse.json({ error: "Radar session not found" }, { status: 404 });

  return NextResponse.json({ sessionId: session.publicId, status: session.status, updatedAt: session.updatedAt });
}

export async function DELETE(request: NextRequest, { params }: RouteContext) {
  if (!isRadarServerAuthorized(request)) {
    return NextResponse.json({ error: "Unauthorized radar server" }, { status: 401 });
  }

  const { sessionId } = await params;
  const publicId = normalizeRadarToken(sessionId);
  const session = await db.liveRadarSession
    .update({ where: { publicId }, data: { status: "ended", endedAt: new Date() } })
    .catch(() => null);

  if (!session) return NextResponse.json({ error: "Radar session not found" }, { status: 404 });

  return NextResponse.json({ sessionId: session.publicId, status: session.status });
}
