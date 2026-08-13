import type { Metadata } from "next";
import Link from "next/link";

import { getLocale } from "@/lib/i18n";

import { ResendForm } from "./ResendForm";
import styles from "./verify.module.css";

export const metadata: Metadata = {
  title: "Foresight — Email verification",
  description: "Email verification status.",
};

type Status = "verified" | "already" | "expired" | "invalid" | "pending";

const STATUSES: Status[] = [
  "verified",
  "already",
  "expired",
  "invalid",
  "pending",
];

const COPY = {
  ru: {
    verified: {
      tone: "ok" as const,
      title: "Почта подтверждена",
      text: "Аккаунт активирован. Теперь можно войти на сайте и в лаунчере.",
    },
    already: {
      tone: "ok" as const,
      title: "Уже подтверждено",
      text: "Эта почта была подтверждена раньше. Просто войдите в аккаунт.",
    },
    expired: {
      tone: "warn" as const,
      title: "Ссылка устарела",
      text: "Ссылка действует 24 часа. Закажите новое письмо ниже.",
    },
    invalid: {
      tone: "warn" as const,
      title: "Ссылка не подходит",
      text: "Возможно, она обрезана почтовым клиентом. Закажите новое письмо.",
    },
    pending: {
      tone: "info" as const,
      title: "Ожидаем подтверждения",
      text: "Откройте письмо и нажмите кнопку подтверждения. Не пришло — отправим заново.",
    },
    login: "Войти в аккаунт",
    home: "На главную",
    resend: {
      label: "Отправить письмо заново",
      submit: "Отправить",
      submitting: "Отправляем...",
    },
  },
  en: {
    verified: {
      tone: "ok" as const,
      title: "Email confirmed",
      text: "Your account is active. You can log in on the site and in the launcher.",
    },
    already: {
      tone: "ok" as const,
      title: "Already confirmed",
      text: "This address was confirmed earlier. Just log in.",
    },
    expired: {
      tone: "warn" as const,
      title: "Link expired",
      text: "Links are valid for 24 hours. Request a new email below.",
    },
    invalid: {
      tone: "warn" as const,
      title: "Link is not valid",
      text: "Your mail client may have truncated it. Request a new email.",
    },
    pending: {
      tone: "info" as const,
      title: "Waiting for confirmation",
      text: "Open the email and press the confirm button. Nothing arrived? We can resend.",
    },
    login: "Log in",
    home: "Back home",
    resend: {
      label: "Resend confirmation email",
      submit: "Send",
      submitting: "Sending...",
    },
  },
} as const;

export default async function VerifyPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const { status: rawStatus } = await searchParams;
  const locale = (await getLocale()) === "en" ? "en" : "ru";
  const copy = COPY[locale];

  const status: Status = STATUSES.includes(rawStatus as Status)
    ? (rawStatus as Status)
    : "pending";
  const current = copy[status];
  const showResend = status !== "verified" && status !== "already";

  return (
    <main className={styles.page}>
      <section className={`${styles.card} ${styles[current.tone]}`}>
        <span className={styles.badge}>
          {current.tone === "ok" ? "✓" : current.tone === "warn" ? "!" : "…"}
        </span>
        <h1 className={styles.title}>{current.title}</h1>
        <p className={styles.text}>{current.text}</p>

        <div className={styles.actions}>
          <Link className={styles.primary} href="/login">
            {copy.login}
          </Link>
          <Link className={styles.secondary} href="/">
            {copy.home}
          </Link>
        </div>

        {showResend ? <ResendForm locale={locale} copy={copy.resend} /> : null}
      </section>
    </main>
  );
}
