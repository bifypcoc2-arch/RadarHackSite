# Foresight realtime gateway

Session-isolated WebSocket gateway for legal private-server and broadcast radar data.

## Run

```bash
npm install
RADAR_INGEST_SECRET="your-secret" FORESIGHT_APP_URL="http://localhost:3000" npm start
```

Producer connection:

```text
ws://localhost:22006/foresight/F8K2P7Q4?role=producer&token=YOUR_SECRET
```

Viewer connection:

```text
ws://localhost:22006/foresight/F8K2P7Q4?role=viewer
```

Each session ID has an isolated room. Producers are authenticated, viewers are read-only, and the newest frame is persisted to the Next.js session API. Use TLS termination and `wss://` in production.
