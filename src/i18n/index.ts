import en from "./en.json";
import it from "./it.json";
import es from "./es.json";

export const locales = ["en", "it", "es"] as const;
export type Locale = (typeof locales)[number];
export type Key = keyof typeof en;

const strings: Record<Locale, Record<Key, string>> = { en, it, es };

// Fail the build if a language is missing a key or has one the others don't.
for (const locale of locales) {
  const missing = Object.keys(en).filter((k) => !(k in strings[locale]));
  const extra = Object.keys(strings[locale]).filter((k) => !(k in en));
  if (missing.length || extra.length) {
    throw new Error(`i18n/${locale}.json is out of sync. Missing: ${missing.join(", ") || "none"}. Extra: ${extra.join(", ") || "none"}.`);
  }
}

export const t = (locale: Locale, key: Key) => strings[locale][key];

/** Path for a locale: English lives at the root, the others under /it/ and /es/. */
export const localePath = (locale: Locale, path = "/") => (locale === "en" ? path : `/${locale}${path}`);
