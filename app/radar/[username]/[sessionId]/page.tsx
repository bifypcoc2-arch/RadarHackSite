import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Header } from "@/components/Header";
import { RadarVisual } from "@/components/RadarVisual";
import { db } from "@/lib/db";
import { getLocale, pick } from "@/lib/i18n";
import { normalizeRadarToken, normalizeRadarUsername } from "@/lib/radarSessions";
import styles from "../../../demo/demo.module.css";

export const dynamic = "force-dynamic";

type RadarSessionPageProps = { params: Promise<{ username: string; sessionId: string }> };

async function getRadarSession(params: RadarSessionPageProps["params"]) {
  const { username: rawUsername, sessionId: rawSessionId } = await params;
  const username = normalizeRadarUsername(rawUsername);
  const publicId = normalizeRadarToken(rawSessionId);

  if (!username || !publicId) return null;

  const session = await db.liveRadarSession.findUnique({ where: { publicId } });
  if (!session || session.username.toLowerCase() !== username.toLowerCase()) return null;
  return session;
}

export async function generateMetadata({ params }: RadarSessionPageProps): Promise<Metadata> {
  const session = await getRadarSession(params);
  return {
    title: session ? `@${session.username} · ${session.publicId}` : "Radar session",
    description: session ? `Live Foresight radar session for @${session.username}.` : "Foresight radar session.",
  };
}

export default async function LiveRadarSessionPage({ params }: RadarSessionPageProps) {
  const session = await getRadarSession(params);
  if (!session) notFound();

  const locale = await getLocale();
  const t = <T,>(ru: T, en: T) => pick(locale, { ru, en });
  const isLive = session.status === "live" && (!session.expiresAt || session.expiresAt > new Date());

  return (
    <>
      <Header />
      <main className={styles.radarPage}>
        <section className={styles.profileBar}>
          <div className={styles.identity}>
            <div className={styles.avatar}>{session.username.slice(0, 2).toUpperCase()}</div>
            <div>
              <small>FORESIGHT / MATCH SESSION / {session.publicId}</small>
              <h1>@{session.username}</h1>
            </div>
          </div>
          <div className={styles.sessionStatus}>
            <span><i /> {isLive ? "RADAR ONLINE" : "SESSION ENDED"}</span>
            <span>{session.map.toUpperCase()}</span>
            <span>ID {session.publicId}</span>
          </div>
          <div className={styles.profileActions}>
            <Link href="/demo">{t("Тестовый режим", "Test mode")}</Link>
            <Link href="/pricing" className="button small">{t("Получить доступ", "Get access")}</Link>
          </div>
        </section>

        <section className={styles.radarConsole}>
          <div className={styles.consoleHeader}>
            <div><i /><span>TRACKING PLAYER</span><strong>@{session.username}</strong></div>
            <div>
              <span>SESSION <b>{session.publicId}</b></span>
              <span>MAP <b>{session.map.toUpperCase()}</b></span>
              <span>STATUS <b>{isLive ? "LIVE" : "ENDED"}</b></span>
            </div>
          </div>
          <div className={styles.radarStage}><RadarVisual /></div>
        </section>

        <footer className={styles.demoFooter}>
          <span>SESSION / {session.username.toUpperCase()} / {session.publicId}</span>
          <Link href="/">← {t("Главная", "Home")}</Link>
        </footer>
      </main>
    </>
  );
}
