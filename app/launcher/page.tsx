import type { Metadata } from "next";
import Link from "next/link";
import { Header } from "@/components/Header";
import { getLocale, pick } from "@/lib/i18n";
import { LauncherConnectForm } from "./LauncherConnectForm";
import styles from "./launcher.module.css";

export const metadata: Metadata = {
  title: "Foresight Launcher",
  description: "Connect to a private Foresight radar session.",
};

export default async function LauncherPage() {
  const locale = await getLocale();
  const t = <T,>(ru: T, en: T) => pick(locale, { ru, en });

  return (
    <>
      <Header />
      <main className={styles.page}>
        <section className={styles.window}>
          <header className={styles.windowBar}>
            <div><i /><strong>FORESIGHT</strong><span>LAUNCHER / 2.1</span></div>
            <div className={styles.online}><i />SYSTEM ONLINE</div>
          </header>

          <div className={styles.content}>
            <section className={styles.copy}>
              <span className={styles.kicker}>MATCH ACCESS TERMINAL</span>
              <h1>{t("ВАША КАТКА. ОДНА ССЫЛКА.", "YOUR MATCH. ONE LINK.")}</h1>
              <p>{t("Введите ник и ID, который создал приватный сервер. Launcher проверит сессию и сразу откроет персональный радар.", "Enter the username and ID created by the private server. Launcher verifies the session and opens the personal radar.")}</p>
              <LauncherConnectForm labels={{
                username: t("НИК ИГРОКА", "PLAYER USERNAME"),
                session: t("ID СЕССИИ", "SESSION ID"),
                connect: t("ПОДКЛЮЧИТЬСЯ К РАДАРУ", "CONNECT TO RADAR"),
                checking: t("ПРОВЕРКА СЕССИИ...", "VERIFYING SESSION..."),
                hint: t("ВВЕДИТЕ НИК И 8-СИМВОЛЬНЫЙ ID", "ENTER USERNAME AND 8-CHARACTER ID"),
              }} />
              <div className={styles.actions}>
                <Link href="/demo">{t("Открыть тестовый режим", "Open test mode")}</Link>
                <Link href="/dashboard">{t("Панель управления", "Control center")}</Link>
              </div>
            </section>

            <aside className={styles.telemetry}>
              <div className={styles.previewTop}><span>SESSION PIPELINE</span><b>READY</b></div>
              <div className={styles.radarMark}><span>F</span><i /><i /><i /></div>
              <div className={styles.pipeline}>
                <div><b>01</b><span>PRIVATE SERVER<small>creates player session</small></span><em>READY</em></div>
                <div><b>02</b><span>REALTIME GATEWAY<small>isolates match channel</small></span><em>READY</em></div>
                <div><b>03</b><span>RADAR CLIENT<small>opens personal feed</small></span><em>STANDBY</em></div>
              </div>
              <div className={styles.sessionExample}><small>SESSION FORMAT</small><code>/radar/KITE/F8K2P7Q4</code></div>
            </aside>
          </div>

          <footer className={styles.statusBar}>
            <span><i />API CONNECTED</span>
            <span><i />SESSION ISOLATION</span>
            <span>BUILD 2.1.0 / WEB APP</span>
          </footer>
        </section>
      </main>
    </>
  );
}
