import type { Metadata } from "next";

import { getLocale } from "@/lib/i18n";

import { SignupForm } from "./SignupForm";
import styles from "./signup.module.css";

export const metadata: Metadata = {
  title: "Foresight — Create account",
  description: "Create a Foresight account.",
};

const COPY = {
  ru: {
    kicker: "ШАГ 1 ИЗ 2",
    title: "Создать аккаунт",
    subtitle:
      "Зарегистрируйтесь, подтвердите почту и получите доступ к панели.",
    form: {
      email: "Email",
      password: "Пароль",
      passwordHint: "Минимум 10 символов",
      confirm: "Повторите пароль",
      terms: "Принимаю условия использования и политику конфиденциальности",
      submit: "Создать аккаунт",
      submitting: "Создаём...",
      hasAccount: "Уже есть аккаунт?",
      login: "Войти",
      sentTitle: "Письмо отправлено",
      sentHint: "Ссылка для подтверждения ушла на",
      resend: "Не пришло? Отправить заново",
    },
    perks: [
      "Доступ к панели и истории сессий",
      "Персональные ссылки на трансляцию",
      "Вход в лаунчер одним аккаунтом",
    ],
  },
  en: {
    kicker: "STEP 1 OF 2",
    title: "Create account",
    subtitle: "Sign up, confirm your email, and get access to the dashboard.",
    form: {
      email: "Email",
      password: "Password",
      passwordHint: "At least 10 characters",
      confirm: "Repeat password",
      terms: "I accept the terms of use and privacy policy",
      submit: "Create account",
      submitting: "Creating...",
      hasAccount: "Already have an account?",
      login: "Log in",
      sentTitle: "Email sent",
      sentHint: "We sent a confirmation link to",
      resend: "Nothing arrived? Send again",
    },
    perks: [
      "Dashboard and session history access",
      "Personal broadcast links",
      "One account for the launcher",
    ],
  },
} as const;

export default async function SignupPage() {
  const locale = (await getLocale()) === "en" ? "en" : "ru";
  const copy = COPY[locale];

  return (
    <main className={styles.page}>
      <div className={styles.grid}>
        <section className={styles.intro}>
          <p className={styles.kicker}>{copy.kicker}</p>
          <h1 className={styles.title}>{copy.title}</h1>
          <p className={styles.subtitle}>{copy.subtitle}</p>
          <ul className={styles.perks}>
            {copy.perks.map((perk) => (
              <li key={perk} className={styles.perk}>
                {perk}
              </li>
            ))}
          </ul>
        </section>

        <section className={styles.card}>
          <SignupForm locale={locale} copy={copy.form} />
        </section>
      </div>
    </main>
  );
}
