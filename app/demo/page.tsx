import type { Metadata } from "next";
import { Header } from "@/components/Header";
import { DemoUsernameForm } from "@/components/DemoUsernameForm";
import { getLocale, pick } from "@/lib/i18n";
import styles from "./demo.module.css";

export const metadata: Metadata = {
  title: "Test radar mode",
  description: "Preview Foresight without connecting a game server.",
};

export default async function DemoEntryPage() {
  const locale = await getLocale();
  const t = <T,>(ru: T, en: T) => pick(locale, { ru, en });

  return (
    <>
      <Header />
      <main className={styles.entryPage}>
        <div className={styles.entryGlow} aria-hidden="true" />
        <section className={styles.entryCard}>
          <div className={styles.systemLine}><i /> FORESIGHT / TEST MODE</div>
          <span className={styles.step}>01 — PLAYER IDENTITY</span>
          <h1>{t("Проверить радар без сервера", "Test radar without a server")}</h1>
          <p>{t(
            "Это только тестовый режим. В реальной катке ссылка создаётся автоматически при подключении игрока к серверу.",
            "This is only a test mode. In a real match, the URL is created automatically when the player joins the server.",
          )}</p>
          <div className={styles.formWrap}>
            <DemoUsernameForm buttonLabel={t("Открыть тест", "Open test")} />
          </div>
          <div className={styles.urlExample}>
            <small>LIVE URL FORMAT</small>
            <code>foresight.gg/radar/<strong>username/F8K2P7Q4</strong></code>
          </div>
          <div className={styles.entryMeta}>
            <span>AUTO-CREATED</span><span>PLAYER BOUND</span><span>SESSION ID</span>
          </div>
        </section>
      </main>
    </>
  );
}
