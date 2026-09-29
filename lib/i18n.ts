import catalogue from "./translations.json" with { type: "json" };
import type { Event } from "./events";

export type Language = "en" | "ru" | "es";
export const LANGUAGE_KEY = "apocalypse-clock-language";
export const locales: Record<Language, string> = {
  en: "en-US",
  ru: "ru-RU",
  es: "es-ES",
};
export function resolveLanguage(value: unknown): Language {
  return value === "ru" || value === "es" ? value : "en";
}

// Original Russian copy remains the stable key, including persisted feed messages.
const messages: Record<string, { en: string; es: string }> = catalogue;
export function translate(
  language: Language,
  text: string,
  ...values: (string | number)[]
) {
  const localized =
    language === "ru"
      ? text
      : Object.hasOwn(messages, text)
        ? messages[text][language]
        : text;
  return localized.replace(/\{(\d+)\}/g, (match, index) =>
    String(values[Number(index)] ?? match),
  );
}

export function localizeEvent(event: Event, language: Language): Event {
  return {
    ...event,
    title: event.auto ? event.title : translate(language, event.title),
    summary: translate(language, event.summary),
    reason: translate(language, event.reason),
    source: translate(language, event.source),
    category: translate(language, event.category),
  };
}

export function formatShift(points: number, language: Language) {
  const days = new Intl.NumberFormat(locales[language], {
    maximumFractionDigits: 1,
  }).format(Math.abs(points * 30));
  return translate(
    language,
    points > 0
      ? "Приближает на {0} дн."
      : points < 0
        ? "Отдаляет на {0} дн."
        : "Без изменения",
    days,
  );
}
