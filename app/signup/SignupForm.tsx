"use client";

import Link from "next/link";
import { useActionState } from "react";

import { signupAction, type SignupState } from "./actions";
import styles from "./signup.module.css";

const INITIAL_STATE: SignupState = { status: "idle" };

type Copy = {
  email: string;
  password: string;
  passwordHint: string;
  confirm: string;
  terms: string;
  submit: string;
  submitting: string;
  hasAccount: string;
  login: string;
  sentTitle: string;
  sentHint: string;
  resend: string;
};

export function SignupForm({
  locale,
  copy,
}: {
  locale: "ru" | "en";
  copy: Copy;
}) {
  const [state, formAction, pending] = useActionState(
    signupAction,
    INITIAL_STATE,
  );

  if (state.status === "sent") {
    return (
      <div className={styles.sent} role="status">
        <span className={styles.sentBadge}>✓</span>
        <h2 className={styles.sentTitle}>{copy.sentTitle}</h2>
        <p className={styles.sentText}>
          {copy.sentHint} <strong>{state.email}</strong>
        </p>
        <Link className={styles.sentLink} href="/verify?status=pending">
          {copy.resend}
        </Link>
      </div>
    );
  }

  return (
    <form className={styles.form} action={formAction} noValidate>
      <input type="hidden" name="locale" value={locale} />

      <label className={styles.field}>
        <span className={styles.label}>{copy.email}</span>
        <input
          className={styles.input}
          type="email"
          name="email"
          autoComplete="email"
          defaultValue={state.email ?? ""}
          required
        />
      </label>

      <label className={styles.field}>
        <span className={styles.label}>{copy.password}</span>
        <input
          className={styles.input}
          type="password"
          name="password"
          autoComplete="new-password"
          minLength={10}
          required
        />
        <span className={styles.hint}>{copy.passwordHint}</span>
      </label>

      <label className={styles.field}>
        <span className={styles.label}>{copy.confirm}</span>
        <input
          className={styles.input}
          type="password"
          name="passwordConfirm"
          autoComplete="new-password"
          minLength={10}
          required
        />
      </label>

      <div className={styles.honeypot} aria-hidden="true">
        <input type="text" name="company" tabIndex={-1} autoComplete="off" />
      </div>

      <label className={styles.checkbox}>
        <input type="checkbox" name="terms" />
        <span>{copy.terms}</span>
      </label>

      {state.status === "error" && state.message ? (
        <p className={styles.error} role="alert">
          {state.message}
        </p>
      ) : null}

      <button className={styles.submit} type="submit" disabled={pending}>
        {pending ? copy.submitting : copy.submit}
      </button>

      <p className={styles.footer}>
        {copy.hasAccount}{" "}
        <Link className={styles.link} href="/login">
          {copy.login}
        </Link>
      </p>
    </form>
  );
}
