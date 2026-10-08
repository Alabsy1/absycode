import { locales, type Locale } from "@/middleware";
export type { Locale };

export function isLocale(v: string): v is Locale {
  return (locales as readonly string[]).includes(v);
}

export type Localized = { en: string; ar: string };

export function t(s: Localized, locale: Locale): string {
  return locale === "ar" ? s.ar : s.en;
}

export function localeDir(locale: Locale): "ltr" | "rtl" {
  return locale === "ar" ? "rtl" : "ltr";
}

export function otherLocale(locale: Locale): Locale {
  return locale === "ar" ? "en" : "ar";
}
