"use client";

import { useActionState } from "react";

import {
  resendVerificationAction,
  type SignupState,
} from "@/app/signup/actions";

import styles from "./verify.module.css";

const INITIAL_STATE: SignupState = { status: "idle" };

export function ResendForm({
  locale,
  copy,
}: {
  locale: "ru" | "en";
  copy: { label: string; submit: string; submitting: string };
}) {
  const [state, formAction, pending] = useActionState(
    resendVerificationAction,
    INITIAL_STATE,
  );

  return (
    <form className={styles.resend} action={formAction}>
      <input type="hidden" name="locale" value={locale} />
      <label className={styles.resendLabel} htmlFor="resend-email">
        {copy.label}
      </label>
      <div className={styles.resendRow}>
        <input
          id="resend-email"
          className={styles.resendInput}
          type="email"
          name="email"
          autoComplete="email"
          defaultValue={state.email ?? ""}
          required
        />
        <button
          className={styles.resendButton}
          type="submit"
          disabled={pending}
        >
          {pending ? copy.submitting : copy.submit}
        </button>
      </div>
      {state.message ? (
        <p
          className={
            state.status === "error" ? styles.resendError : styles.resendOk
          }
          role="status"
        >
          {state.message}
        </p>
      ) : null}
    </form>
  );
}
