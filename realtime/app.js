import { timingSafeEqual } from "node:crypto";
import http from "node:http";
import { WebSocket, WebSocketServer } from "ws";

const PORT = Number(process.env.WS_PORT || 22006);
const HOST = process.env.WS_HOST || "0.0.0.0";
const INGEST_SECRET = process.env.RADAR_INGEST_SECRET || "";
const APP_URL = (process.env.FORESIGHT_APP_URL || "").replace(/\/$/, "");
const ALLOWED_ORIGINS = new Set((process.env.ALLOWED_ORIGINS || "http://localhost:3000").split(",").map((origin) => origin.trim()).filter(Boolean));
const rooms = new Map();
const wss = new WebSocketServer({ noServer: true, perMessageDeflate: false, clientTracking: false, maxPayload: 256 * 1024 });

if (!INGEST_SECRET) { console.error("RADAR_INGEST_SECRET is required"); process.exit(1); }

function safeEqual(received, expected) {
  const a = Buffer.from(received || "");
  const b = Buffer.from(expected || "");
  return a.length === b.length && timingSafeEqual(a, b);
}

function roomFor(sessionId) {
  if (!rooms.has(sessionId)) rooms.set(sessionId, { producer: null, viewers: new Set(), latest: null, timer: null, pending: null });
  return rooms.get(sessionId);
}

function broadcast(room, message) {
  for (const viewer of room.viewers) if (viewer.readyState === WebSocket.OPEN) viewer.send(message);
}

function persist(sessionId, room, snapshot) {
  if (!APP_URL) return;
  room.pending = snapshot;
  if (room.timer) return;
  room.timer = setTimeout(async () => {
    room.timer = null;
    const pending = room.pending;
    room.pending = null;
    try {
      await fetch(`${APP_URL}/api/radar/sessions/${sessionId}`, {
        method: "PATCH",
        headers: { "content-type": "application/json", "x-radar-secret": INGEST_SECRET },
        body: JSON.stringify({ snapshot: pending, status: "live" }),
        signal: AbortSignal.timeout(2000),
      });
    } catch (error) { console.warn(`Session ${sessionId}: API sync failed`, error.message); }
  }, 250);
}

function parseConnection(request) {
  const base = ["http:", "", request.headers.host || "localhost"].join("/");
  const url = new URL(request.url || "/", base);
  const match = url.pathname.match(/^\/foresight\/([A-Z2-9]{8})$/);
  if (!match) return { error: "Invalid WebSocket path", status: 400 };
  const sessionId = match[1];
  const role = url.searchParams.get("role") || "viewer";
  if (role !== "viewer" && role !== "producer") return { error: "Invalid role", status: 400 };
  if (role === "producer") {
    const bearer = request.headers.authorization?.replace(/^Bearer\s+/i, "") || "";
    const token = request.headers["x-radar-secret"] || url.searchParams.get("token") || bearer;
    if (typeof token !== "string" || !safeEqual(token, INGEST_SECRET)) return { error: "Unauthorized", status: 401 };
  }
  if (role === "viewer" && request.headers.origin && !ALLOWED_ORIGINS.has(request.headers.origin)) return { error: "Origin denied", status: 403 };
  return { sessionId, role };
}

function reject(socket, status, message) {
  socket.write(`HTTP/1.1 ${status} ${message}\r\nConnection: close\r\nContent-Length: ${Buffer.byteLength(message)}\r\n\r\n${message}`);
  socket.destroy();
}

const server = http.createServer((request, response) => {
  if (request.method === "GET" && request.url === "/health") {
    response.writeHead(200, { "content-type": "application/json" });
    response.end(JSON.stringify({ status: "ok", rooms: rooms.size }));
    return;
  }
  response.writeHead(404).end();
});

server.on("connection", (socket) => { socket.setNoDelay(true); socket.setKeepAlive(true, 30000); });
server.on("upgrade", (request, socket, head) => {
  const connection = parseConnection(request);
  if (connection.error) return reject(socket, connection.status, connection.error);
  wss.handleUpgrade(request, socket, head, (ws) => wss.emit("connection", ws, request, connection));
});

wss.on("connection", (socket, request, { sessionId, role }) => {
  const room = roomFor(sessionId);
  socket.isAlive = true;
  socket.windowStarted = Date.now();
  socket.messageCount = 0;

  if (role === "producer") {
    if (room.producer?.readyState === WebSocket.OPEN) room.producer.close(4009, "Producer replaced");
    room.producer = socket;
    broadcast(room, JSON.stringify({ type: "source_status", status: "online" }));
  } else {
    room.viewers.add(socket);
    socket.send(JSON.stringify({ type: "session_status", sessionId, source: room.producer ? "online" : "offline" }));
    if (room.latest) socket.send(room.latest);
  }

  socket.on("pong", () => { socket.isAlive = true; });
  socket.on("message", (data, binary) => {
    if (role !== "producer") return socket.close(1008, "Viewer is read-only");
    const now = Date.now();
    if (now - socket.windowStarted >= 1000) { socket.windowStarted = now; socket.messageCount = 0; }
    if (++socket.messageCount > 120) return socket.close(1008, "Rate exceeded");
    if (binary) return socket.close(1003, "JSON only");
    let snapshot;
    const text = data.toString("utf8");
    try { snapshot = JSON.parse(text); } catch { return socket.close(1007, "Invalid JSON"); }
    if (!snapshot || typeof snapshot !== "object" || Array.isArray(snapshot)) return socket.close(1007, "Object required");
    room.latest = text;
    broadcast(room, text);
    persist(sessionId, room, snapshot);
  });
  socket.on("close", () => {
    if (role === "producer" && room.producer === socket) { room.producer = null; broadcast(room, JSON.stringify({ type: "source_status", status: "offline" })); }
    else room.viewers.delete(socket);
    if (!room.producer && room.viewers.size === 0) { if (room.timer) clearTimeout(room.timer); rooms.delete(sessionId); }
  });
  socket.on("error", (error) => console.error(`Session ${sessionId}:`, error.message));
});

const heartbeat = setInterval(() => {
  for (const room of rooms.values()) for (const socket of [room.producer, ...room.viewers].filter(Boolean)) {
    if (!socket.isAlive) socket.terminate();
    else { socket.isAlive = false; socket.ping(); }
  }
}, 30000);

function shutdown() {
  clearInterval(heartbeat);
  for (const room of rooms.values()) { room.producer?.close(1001); for (const viewer of room.viewers) viewer.close(1001); }
  server.close(() => process.exit(0));
}
process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
server.listen(PORT, HOST, () => console.info(`Foresight realtime gateway listening on ${HOST}:${PORT}`));
