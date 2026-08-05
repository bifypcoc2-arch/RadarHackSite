import type { Metadata } from "next";
import Link from "next/link";
import { Header } from "@/components/Header";
import { RadarVisual } from "@/components/RadarVisual";
import { getLocale, pick } from "@/lib/i18n";
import styles from "./page.module.css";

export const metadata: Metadata = {
  title: "Foresight Demo",
  description: "Interactive Foresight tactical radar demonstration on Cache.",
};

export default async function ForesightDemoPage() {
  const locale = await getLocale();
  const t = <T,>(ru: T, en: T) => pick(locale, { ru, en });

  return (
    <>
      <Header />
      <main className={styles.page}>
        <div className={styles.ambient} aria-hidden="true" />
        <section className={styles.intro}>
          <div>
            <div className={styles.breadcrumb}>
              <span>FORESIGHT</span>
              <i>/</i>
              <strong>DEMO</strong>
            </div>
            <h1>{t("Тактический радар в реальном времени", "Real-time tactical radar")}</h1>
            <p>
              {t(
                "Детерминированная демонстрация post-plant клатча 1v4 на Cache. Игроки перемещаются по навигационному графу и принимают решения из состояния раунда.",
                "A deterministic 1v4 post-plant clutch on Cache. Players follow the navigation graph and make decisions from the live round state.",
              )}
            </p>
          </div>
          <div className={styles.actions}>
            <span><i /> LIVE SIMULATION</span>
            <Link href="/pricing" className="button small">
              {t("Получить доступ", "Get access")}
            </Link>
          </div>
        </section>

        <section className={styles.console}>
          <div className={styles.consoleTop}>
            <div>
              <small>DE_CACHE</small>
              <strong>A RETAKE / 1V4</strong>
            </div>
            <div className={styles.telemetry}>
              <span><small>PATHING</small>NAV GRAPH</span>
              <span><small>MODEL</small>RULE BASED</span>
              <span><small>TICK</small>20 HZ</span>
            </div>
          </div>
          <div className={styles.radarStage}>
            <RadarVisual />
          </div>
        </section>

        <section className={styles.explainer}>
          <article>
            <span>01</span>
            <div><strong>{t("Настоящие маршруты", "Real routes")}</strong><p>{t("Движение только по связанным проходам Cache — без пересечения стен.", "Movement is restricted to connected Cache paths, with no wall crossing.")}</p></div>
          </article>
          <article>
            <span>02</span>
            <div><strong>{t("Логика контакта", "Contact logic")}</strong><p>{t("Бой начинается только при дистанции и видимости между соседними зонами.", "Combat starts only when range and visibility rules are satisfied.")}</p></div>
          </article>
          <article>
            <span>03</span>
            <div><strong>{t("Условия победы", "Win conditions")}</strong><p>{t("Зачистка точки, дефьюз, гибель CT или взрыв бомбы определяют исход.", "Site clear, defuse, CT death, or bomb detonation determine the result.")}</p></div>
          </article>
        </section>

        <div className={styles.bottomBar}>
          <span>FORESIGHT DEMO · CACHE · SECURE SESSION</span>
          <Link href="/">← {t("Вернуться на главную", "Back to home")}</Link>
        </div>
      </main>
    </>
  );
}
