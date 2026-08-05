import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Header } from "@/components/Header";
import { RadarVisual } from "@/components/RadarVisual";
import { getLocale, pick } from "@/lib/i18n";
import styles from "../demo.module.css";

type DemoPageProps = {
  params: Promise<{ username: string }>;
};

function normalizeUsername(value: string) {
  return value.replace(/^@/, "").replace(/[^a-zA-Z0-9_-]/g, "").slice(0, 24);
}

export async function generateMetadata({ params }: DemoPageProps): Promise<Metadata> {
  const { username: rawUsername } = await params;
  const username = normalizeUsername(rawUsername);
  return {
    title: username ? `@${username} · Radar demo` : "Radar demo",
    description: `Live Foresight tactical radar demo for @${username}.`,
  };
}

export default async function PlayerRadarDemo({ params }: DemoPageProps) {
  const { username: rawUsername } = await params;
  const username = normalizeUsername(rawUsername);

  if (username.length < 2 || username !== rawUsername.replace(/^@/, "")) {
    notFound();
  }

  const locale = await getLocale();
  const t = <T,>(ru: T, en: T) => pick(locale, { ru, en });

  return (
    <>
      <Header />
      <main className={styles.radarPage}>
        <section className={styles.profileBar}>
          <div className={styles.identity}>
            <div className={styles.avatar}>{username.slice(0, 2).toUpperCase()}</div>
            <div>
              <small>FORESIGHT / DEMO SESSION</small>
              <h1>@{username}</h1>
            </div>
          </div>
          <div className={styles.sessionStatus}>
            <span><i /> RADAR ONLINE</span>
            <span>DE_CACHE</span>
            <span>1V4 POST-PLANT</span>
          </div>
          <div className={styles.profileActions}>
            <Link href="/demo">{t("Сменить игрока", "Change player")}</Link>
            <Link href="/pricing" className="button small">
              {t("Получить доступ", "Get access")}
            </Link>
          </div>
        </section>

        <section className={styles.radarConsole}>
          <div className={styles.consoleHeader}>
            <div>
              <i />
              <span>TRACKING USER</span>
              <strong>@{username}</strong>
            </div>
            <div>
              <span>PATHING <b>NAV GRAPH</b></span>
              <span>ENGINE <b>RULE BASED</b></span>
              <span>UPDATE <b>20 HZ</b></span>
            </div>
          </div>
          <div className={styles.radarStage}>
            <RadarVisual />
          </div>
        </section>

        <footer className={styles.demoFooter}>
          <span>SESSION / {username.toUpperCase()} / SECURE DEMO</span>
          <Link href="/">← {t("Главная", "Home")}</Link>
        </footer>
      </main>
    </>
  );
}
