import Link from "next/link";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { RadarVisual } from "@/components/RadarVisual";
import { Arrow, Check } from "@/components/Icons";
import { getLocale, pick } from "@/lib/i18n";

export default async function Home() {
  const locale = await getLocale();
  const t = <T,>(ru: T, en: T) => pick(locale, { ru, en });

  const cards = [
    [t("Позиции игроков", "Player positions"), t("Точный тактический слой без визуального шума.", "A precise tactical layer without visual noise.")],
    [t("События раунда", "Round events"), t("Контакт, гранаты и бомба появляются только по событию.", "Contact, utility and bomb states appear only when they happen.")],
    [t("Навигация", "Navigation"), t("Маршруты следуют проходам карты и не пересекают стены.", "Routes follow connected map paths and never cross walls.")],
    [t("Защищённая сессия", "Protected session"), t("Персональная ссылка для второго экрана или команды.", "A personal link for a second display or your team.")],
  ];

  return (
    <>
      <Header />
      <main>
        <section className="hero">
          <div className="container hero-copy">
            <div className="eyebrow"><i />{t("ТАКТИЧЕСКАЯ ЯСНОСТЬ В РЕАЛЬНОМ ВРЕМЕНИ", "REAL-TIME TACTICAL CLARITY")}</div>
            <h1>{t("Видеть матч.", "See the match.")}<br /><span>{t("Понимать момент.", "Understand the moment.")}</span></h1>
            <p>{t("Foresight превращает поток игровых данных в спокойную и точную картину раунда.", "Foresight turns live match data into a calm, precise picture of the round.")}</p>
            <div className="hero-actions">
              <Link href="/demo" className="button">{t("Открыть демо", "Open demo")}<Arrow /></Link>
              <Link href="#features" className="button ghost">{t("Посмотреть возможности", "Explore features")}</Link>
            </div>
            <div className="trust-row">
              <span><Check />NAVMESH PATHING</span>
              <span><Check />20 HZ TELEMETRY</span>
              <span><Check />SECURE SESSION</span>
            </div>
          </div>
          <div className="container hero-visual"><RadarVisual /></div>
        </section>

        <section className="section" id="features">
          <div className="container">
            <div className="section-title">
              <span className="eyebrow">{t("СИГНАЛ БЕЗ ШУМА", "SIGNAL WITHOUT NOISE")}</span>
              <h2>{t("Информация появляется тогда, когда она нужна.", "Information appears exactly when it matters.")}</h2>
              <p>{t("Никаких декоративных тревог и бесконечных циклов. Интерфейс реагирует только на состояние раунда.", "No decorative alerts or endless loops. The interface responds only to the round state.")}</p>
            </div>

            <div className="feature-split">
              <div className="feature-copy">
                <span className="count">01 / EVENT DRIVEN</span>
                <h2>{t("Движение подчинено данным", "Motion follows data")}</h2>
                <p>{t("Игроки движутся по навигационному графу. Контакт, убийство и установка бомбы запускают собственные короткие реакции интерфейса.", "Players follow the navigation graph. Contact, eliminations and the bomb trigger their own short interface responses.")}</p>
                <ul className="check-list">
                  <li><Check />{t("Маршруты без пересечения стен", "Routes without wall crossing")}</li>
                  <li><Check />{t("События вместо случайной анимации", "Events instead of random animation")}</li>
                  <li><Check />{t("Спокойное состояние между контактами", "A calm state between contacts")}</li>
                </ul>
              </div>
              <div className="data-panel">
                <div className="panel-top"><span>LIVE EVENT STREAM</span><i>CONNECTED</i></div>
                {["NAVMESH / MID → HIGHWAY", "CONTACT / CAR", "ELIMINATION / QUAD", "OBJECTIVE / A SITE"].map((item, index) => (
                  <div className="data-row" key={item}>
                    <span className={index > 1 ? "dot red" : "dot"} />
                    <strong>{item}</strong>
                    <em>{[18, 42, 67, 91][index]}%</em>
                    <div><i style={{ width: `${[18, 42, 67, 91][index]}%` }} /></div>
                  </div>
                ))}
              </div>
            </div>

            <div className="feature-split reverse">
              <div className="feature-copy">
                <span className="count">02 / SECURE SESSION</span>
                <h2>{t("Один адрес. Любой экран.", "One address. Any screen.")}</h2>
                <p>{t("Создайте персональную демо-сессию по нику и откройте радар на втором устройстве.", "Create a personal demo session by username and open the radar on a second device.")}</p>
                <div className="share-demo">
                  <small>PERSONAL RADAR URL</small>
                  <code>foresight.gg/demo/username</code>
                  <span>ACTIVE</span>
                </div>
              </div>
              <div className="data-panel">
                <div className="panel-top"><span>SESSION TELEMETRY</span><i>SECURE</i></div>
                {["USER / PLAYER_NAME", "MAP / DE_CACHE", "MODEL / RULE BASED", "UPDATE / 20 HZ"].map((item, index) => (
                  <div className="data-row" key={item}>
                    <span className="dot" />
                    <strong>{item}</strong>
                    <em>{index === 0 ? "AUTH" : "LIVE"}</em>
                    <div><i style={{ width: `${100 - index * 8}%` }} /></div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="section alt">
          <div className="container">
            <div className="section-title">
              <span className="eyebrow">{t("СИСТЕМА", "THE SYSTEM")}</span>
              <h2>{t("Четыре слоя. Одна ясная картина.", "Four layers. One clear picture.")}</h2>
            </div>
            <div className="card-grid">
              {cards.map(([heading, description], index) => (
                <article className="feature-card" key={heading}>
                  <div className="card-visual"><span>{String(index + 1).padStart(2, "0")}</span></div>
                  <h3>{heading}</h3>
                  <p>{description}</p>
                  <b>LIVE DATA <Arrow size={14} /></b>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="section" id="start">
          <div className="container">
            <div className="section-title">
              <span className="eyebrow">{t("ТРИ ШАГА", "THREE STEPS")}</span>
              <h2>{t("От доступа до первого сигнала.", "From access to first signal.")}</h2>
            </div>
            <div className="steps">
              {[
                ["01", t("Выберите доступ", "Choose access")],
                ["02", t("Откройте сессию", "Open a session")],
                ["03", t("Следите за раундом", "Follow the round")],
              ].map(([number, heading]) => (
                <div className="step" key={number}>
                  <b>{number}</b><h3>{heading}</h3>
                  <p>{t("Минимум действий. Только нужные данные.", "Minimal setup. Only the data you need.")}</p>
                </div>
              ))}
            </div>
            <div className="cta">
              <div><span className="eyebrow">{t("ГОТОВЫ УВИДЕТЬ СИСТЕМУ?", "READY TO SEE THE SYSTEM?")}</span><h2>{t("Запустите персональное демо.", "Launch a personal demo.")}</h2></div>
              <Link href="/demo" className="button">{t("Открыть Foresight", "Open Foresight")}<Arrow /></Link>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
