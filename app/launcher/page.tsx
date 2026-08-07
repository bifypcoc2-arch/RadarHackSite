import type { Metadata } from "next";
import Link from "next/link";
import { Header } from "@/components/Header";
import { getLocale, pick } from "@/lib/i18n";
import { LauncherAccount } from "./LauncherAccount";
import { LauncherConnectForm } from "./LauncherConnectForm";
import styles from "./launcher.module.css";

export const metadata: Metadata = { title: "Foresight Launcher", description: "Sign in and connect to a private Foresight radar session." };

export default async function LauncherPage() {
  const locale = await getLocale();
  const t = <T,>(ru: T, en: T) => pick(locale, { ru, en });
  return <><Header /><main className={styles.page}><section className={styles.window}>
    <header className={styles.windowBar}><div><i /><strong>FORESIGHT</strong><span>LAUNCHER / 2.2</span></div><div className={styles.online}><i />AUTH + SESSION ONLINE</div></header>
    <div className={styles.content}>
      <section className={styles.copy}>
        <span className={styles.kicker}>ACCOUNT & MATCH ACCESS</span>
        <h1>{t("АККАУНТ. КАТКА. РАДАР.", "ACCOUNT. MATCH. RADAR.")}</h1>
        <p>{t("Войдите в аккаунт Foresight прямо в launcher, затем подключитесь к персональной сессии радара.", "Sign in to your Foresight account inside the launcher, then connect to your personal radar session.")}</p>
        <LauncherAccount labels={{ account:t("АККАУНТ","ACCOUNT"),email:"EMAIL",password:t("ПАРОЛЬ","PASSWORD"),login:t("ВОЙТИ","SIGN IN"),loggingIn:t("ВХОД...","SIGNING IN..."),logout:t("ВЫЙТИ","SIGN OUT"),guest:t("ГОСТЬ","GUEST"),invalid:t("НЕВЕРНЫЙ EMAIL ИЛИ ПАРОЛЬ","INVALID EMAIL OR PASSWORD") }} />
        <LauncherConnectForm labels={{ username:t("НИК ИГРОКА","PLAYER USERNAME"),session:t("ID СЕССИИ","SESSION ID"),connect:t("ПОДКЛЮЧИТЬСЯ К РАДАРУ","CONNECT TO RADAR"),checking:t("ПРОВЕРКА СЕССИИ...","VERIFYING SESSION..."),hint:t("ВВЕДИТЕ НИК И 8-СИМВОЛЬНЫЙ ID","ENTER USERNAME AND 8-CHARACTER ID") }} />
        <div className={styles.actions}><Link href="/demo">{t("Открыть тестовый режим","Open test mode")}</Link><Link href="/dashboard">{t("Панель управления","Control center")}</Link></div>
      </section>
      <aside className={styles.telemetry}>
        <div className={styles.previewTop}><span>ACCESS PIPELINE</span><b>READY</b></div>
        <div className={styles.radarMark}><span>F</span><i /><i /><i /></div>
        <div className={styles.pipeline}><div><b>01</b><span>ACCOUNT AUTH<small>secure cookie session</small></span><em>READY</em></div><div><b>02</b><span>REALTIME GATEWAY<small>isolated match channel</small></span><em>READY</em></div><div><b>03</b><span>RADAR CLIENT<small>personal live feed</small></span><em>STANDBY</em></div></div>
        <div className={styles.sessionExample}><small>SESSION FORMAT</small><code>/radar/KITE/F8K2P7Q4</code></div>
      </aside>
    </div>
    <footer className={styles.statusBar}><span><i />ACCOUNT AUTH</span><span><i />SESSION ISOLATION</span><span>BUILD 2.2.0 / WEB APP</span></footer>
  </section></main></>;
}
