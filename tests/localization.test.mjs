import test from "node:test";
import assert from "node:assert/strict";
import { seed, history, score, contributions } from "../lib/events.ts";
import {
  translate,
  resolveLanguage,
  localizeEvent,
  formatShift,
} from "../lib/i18n.ts";

test("English is the default, and only supported saved languages are restored", () => {
  for (const value of [null, undefined, "", "fr", "toString", "constructor"])
    assert.equal(resolveLanguage(value), "en");
  for (const value of ["en", "ru", "es"])
    assert.equal(resolveLanguage(value), value);
});

test("curated content is fully translated without changing scenario data", () => {
  for (const language of ["en", "es"]) {
    const events = seed.map((event) => localizeEvent(event, language));
    for (const event of events) {
      for (const field of ["title", "summary", "reason", "category", "source"])
        assert.doesNotMatch(event[field], /[А-Яа-яЁё]/u);
      const original = seed.find((item) => item.id === event.id);
      for (const field of ["id", "date", "delta", "url"])
        assert.equal(event[field], original[field]);
    }
    assert.equal(score(events), score(seed));
    assert.deepEqual(contributions(events), contributions(seed));
    for (const item of history)
      for (const field of ["title", "text", "source"])
        assert.doesNotMatch(translate(language, item[field]), /[А-Яа-яЁё]/u);
  }
});

test("Russian retains the original editorial content", () => {
  assert.deepEqual(
    seed.map((event) => localizeEvent(event, "ru")),
    seed,
  );
});

test("automatic titles retain original wording while explanations are translated", () => {
  const original = {
    ...seed[0],
    auto: true,
    title: "Новая модель: original headline",
    summary:
      "Новая публикация из официальной RSS-ленты. Заголовок сохранён на языке источника; полный текст доступен по ссылке.",
  };
  const translated = localizeEvent(original, "es");
  assert.equal(translated.title, original.title);
  assert.doesNotMatch(translated.summary, /[А-Яа-яЁё]/u);
});

test("movement labels use the chosen language and number format", () => {
  assert.equal(formatShift(0, "en"), "No change");
  assert.equal(formatShift(0.25, "en"), "Closer by 7.5 days");
  assert.equal(formatShift(-0.25, "es"), "Se aleja 7,5 días");
  assert.equal(formatShift(0.25, "ru"), "Приближает на 7,5 дн.");
});

test('every catalogue entry has complete translations and matching interpolation slots', async () => {
  const {default: messages} = await import('../lib/translations.json', {with: {type: 'json'}});
  const placeholders = value => [...value.matchAll(/\{\d+\}/g)].map(match => match[0]).sort();
  for (const [original, translations] of Object.entries(messages)) {
    for (const language of ['en', 'es']) {
      assert.ok(translations[language]?.trim(), `${language}: ${original}`);
      assert.deepEqual(placeholders(translations[language]), placeholders(original), original);
      assert.doesNotMatch(translations[language], /[А-Яа-яЁё]/u, original);
    }
  }
});
