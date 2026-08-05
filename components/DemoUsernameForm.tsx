"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

export function DemoUsernameForm({
  buttonLabel,
}: {
  buttonLabel: string;
}) {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [error, setError] = useState("");

  function openRadar(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const normalized = username
      .trim()
      .replace(/^@/, "")
      .replace(/[^a-zA-Z0-9_-]/g, "")
      .slice(0, 24);

    if (normalized.length < 2) {
      setError("Enter at least 2 characters");
      return;
    }

    router.push(`/demo/${encodeURIComponent(normalized)}`);
  }

  return (
    <form onSubmit={openRadar}>
      <label htmlFor="demo-username">PLAYER USERNAME</label>
      <div>
        <span>@</span>
        <input
          id="demo-username"
          value={username}
          onChange={(event) => {
            setUsername(event.target.value);
            setError("");
          }}
          placeholder="player_name"
          autoComplete="off"
          spellCheck={false}
          maxLength={24}
          autoFocus
        />
        <button type="submit">{buttonLabel} →</button>
      </div>
      {error && <small>{error}</small>}
    </form>
  );
}
