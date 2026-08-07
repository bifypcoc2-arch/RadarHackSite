"use client";

import { useEffect, useState, type FormEvent } from "react";
import styles from "./LauncherAccount.module.css";

type Account = { name: string; email: string; plan: string; licenseStatus: string };
type Labels = { account: string; email: string; password: string; login: string; loggingIn: string; logout: string; guest: string; invalid: string };

export function LauncherAccount({ labels }: { labels: Labels }) {
  const [account, setAccount] = useState<Account | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/auth/me", { cache: "no-store" })
      .then(async (response) => response.ok ? ((await response.json()).user as Account) : null)
      .then(setAccount)
      .finally(() => setLoading(false));
  }, []);

  async function login(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setError("");
    const form = new FormData(event.currentTarget);
    try {
      const response = await fetch("/api/auth/login", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ email: form.get("email"), password: form.get("password") }) });
      if (!response.ok) throw new Error("LOGIN_FAILED");
      const payload = (await response.json()) as { user: Account };
      setAccount(payload.user);
    } catch {
      setError(labels.invalid);
    } finally {
      setSubmitting(false);
    }
  }

  async function logout() {
    await fetch("/api/auth/me", { method: "DELETE" });
    setAccount(null);
  }

  if (loading) return <div className={styles.loading}><i />AUTH CHANNEL / CHECKING</div>;

  if (account) {
    return <section className={styles.accountCard}>
      <div className={styles.avatar}>{account.name.slice(0, 2).toUpperCase()}</div>
      <div className={styles.identity}><small>{labels.account} / AUTHENTICATED</small><strong>{account.name}</strong><span>{account.email}</span></div>
      <div className={styles.license}><small>LICENSE</small><b>{account.plan.toUpperCase()}</b><span className={account.licenseStatus === "active" ? styles.active : styles.inactive}>{account.licenseStatus.toUpperCase()}</span></div>
      <button type="button" onClick={logout}>{labels.logout}</button>
    </section>;
  }

  return <form className={styles.loginForm} onSubmit={login}>
    <div className={styles.loginHeader}><span><i />{labels.account} / {labels.guest}</span><b>SECURE LOGIN</b></div>
    <label><span>{labels.email}</span><input name="email" type="email" defaultValue="demo@foresight.gg" autoComplete="email" required /></label>
    <label><span>{labels.password}</span><input name="password" type="password" defaultValue="foresight-demo-2026" autoComplete="current-password" required /></label>
    <button type="submit" disabled={submitting}>{submitting ? labels.loggingIn : labels.login}</button>
    {error && <div className={styles.error}>{error}</div>}
  </form>;
}
