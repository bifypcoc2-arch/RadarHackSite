"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import styles from "./launcher.module.css";

type SessionLookup = {
  sessionId: string;
  username: string;
  map: string;
  status: string;
};

export function LauncherConnectForm({
  labels,
}: {
  labels: {
    username: string;
    session: string;
    connect: string;
    checking: string;
    hint: string;
  };
}) {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [sessionId, setSessionId] = useState("");
  const [error, setError] = useState("");
  const [checking, setChecking] = useState(false);

  async function connect(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const cleanUsername = username.trim().replace(/^@/, "").replace(/[^a-zA-Z0-9_-]/g, "").slice(0, 24);
    const cleanSessionId = sessionId.trim().toUpperCase().replace(/[^A-Z2-9]/g, "").slice(0, 8);

    if (cleanUsername.length < 2 || cleanSessionId.length !== 8) {
      setError(labels.hint);
      return;
    }

    setChecking(true);
    setError("");

    try {
      const response = await fetch(`/api/radar/sessions/${cleanSessionId}`, { cache: "no-store" });
      if (!response.ok) throw new Error("SESSION_NOT_FOUND");
      const session = (await response.json()) as SessionLookup;
      if (session.username.toLowerCase() !== cleanUsername.toLowerCase()) {
        throw new Error("PLAYER_MISMATCH");
      }
      router.push(`/radar/${encodeURIComponent(session.username)}/${session.sessionId}`);
    } catch (reason) {
      setError(reason instanceof Error && reason.message === "PLAYER_MISMATCH" ? "PLAYER DOES NOT MATCH SESSION" : "SESSION NOT FOUND OR ALREADY CLOSED");
      setChecking(false);
    }
  }

  return (
    <form className={styles.form} onSubmit={connect}>
      <label>
        <span>01 / {labels.username}</span>
        <div className={styles.inputShell}>
          <b>@</b>
          <input value={username} onChange={(event) => setUsername(event.target.value)} placeholder="player_name" autoComplete="off" spellCheck={false} />
        </div>
      </label>
      <label>
        <span>02 / {labels.session}</span>
        <div className={styles.inputShell}>
          <b>#</b>
          <input value={sessionId} onChange={(event) => setSessionId(event.target.value.toUpperCase())} placeholder="F8K2P7Q4" autoComplete="off" spellCheck={false} maxLength={8} />
        </div>
      </label>
      {error && <div className={styles.error}><i />{error}</div>}
      <button type="submit" disabled={checking}>
        <span>{checking ? labels.checking : labels.connect}</span>
        <b>→</b>
      </button>
    </form>
  );
}
