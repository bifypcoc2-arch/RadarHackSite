import type { Metadata } from "next";
import { Header } from "@/components/Header";
import { DemoUsernameForm } from "@/components/DemoUsernameForm";
import { getLocale, pick } from "@/lib/i18n";
import styles from "./demo.module.css";

export const metadata: Metadata = {
  title: "Open radar demo",
  description: "Open a personalized Foresight radar demo by username.",
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
          <div className={styles.systemLine}>
            <i /> FORESIGHT / DEMO ACCESS
          </div>
          <span className={styles.step}>01 — PLAYER IDENTITY</span>
          <h1>{t("Открыть персональный радар", "Open personalized radar")}</h1>
          <p>
            {t(
              "Введи ник игрока. Foresight создаст отдельный адрес демо-сессии и запустит радар.",
              "Enter a player username. Foresight will create a dedicated demo URL and launch the radar.",
            )}
          </p>
          <div className={styles.formWrap}>
            <DemoUsernameForm buttonLabel={t("Запустить радар", "Launch radar")} />
          </div>
          <div className={styles.urlExample}>
            <small>URL FORMAT</small>
            <code>foresight.gg/demo/<strong>username</strong></code>
          </div>
          <div className={styles.entryMeta}>
            <span>NAVMESH CACHE</span>
            <span>1V4 CLUTCH</span>
            <span>LIVE 20 HZ</span>
          </div>
        </section>
      </main>
    </>
  );
}
