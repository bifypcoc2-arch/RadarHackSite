import Link from "next/link";
import { getLocale, pick } from "@/lib/i18n";
import { LanguageSwitch } from "./LanguageSwitch";
import { RadarIcon } from "./Icons";

export async function Header() {
  const locale = await getLocale();

  return (
    <header className="site-header">
      <div className="container nav">
        <Link href="/" className="brand">
          <span className="brand-mark"><RadarIcon /></span>
          <span>FORE<span>SIGHT</span></span>
        </Link>
        <nav className="nav-links">
          <Link href="/#features">{pick(locale, { ru: "Возможности", en: "Features" })}</Link>
          <Link href="/foresight/demo">Demo</Link>
          <Link href="/pricing">{pick(locale, { ru: "Цены", en: "Pricing" })}</Link>
          <Link href="/#start">{pick(locale, { ru: "Как начать", en: "How it works" })}</Link>
        </nav>
        <div className="nav-actions">
          <LanguageSwitch locale={locale} />
          <Link href="/login" className="text-link">{pick(locale, { ru: "Войти", en: "Sign in" })}</Link>
          <Link href="/pricing" className="button small">{pick(locale, { ru: "Купить", en: "Buy now" })}</Link>
        </div>
      </div>
    </header>
  );
}
