import { cookies } from "next/headers";

export type Locale = "ru" | "en";

export async function getLocale(): Promise<Locale> {
  return (await cookies()).get("radar_locale")?.value === "en" ? "en" : "ru";
}

export function pick<T>(locale: Locale, value: { ru: T; en: T }): T {
  const selected = value[locale];
  if (typeof selected === "string") {
    return selected.replaceAll("Web Radar", "Foresight") as T;
  }
  return selected;
}
