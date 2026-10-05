# Часы апокалипсиса — проект для Codex

Визуальная версия от 5 октября 2026: Dystopia Clock / Green Argus по макету v5.
Графитовый фон, зелёные акценты, янтарные стеклянные цифры и отдельный экран часов.
Пять разделов доступны через верхнее меню; ENG/RUS/ESP сохраняются между посещениями.
Показатель «Отодвинуто за этот год» суммирует отрицательные учтённые вклады событий
текущего календарного года UTC до сегодняшней даты и переводит их в дни.

## Открытие

Распакуйте ZIP и откройте папку `apocalypse-clock` как проект в Codex.
В терминале проекта выполните команды ниже. Требуются Node.js 22.13+
(для тестов используйте Node.js 22.18+ или 24) и pnpm 11.25.0.

```bash
corepack enable
corepack prepare pnpm@11.25.0 --activate
pnpm install --frozen-lockfile
pnpm build
pnpm db:init
pnpm dev
```

Если Corepack отсутствует, установите pnpm командой
`npm install -g pnpm@11.25.0`, затем продолжите с `pnpm install`.

Откройте http://localhost:5173. Остановка сервера: Ctrl+C.
При последующих запусках достаточно `pnpm dev`.
`pnpm db:init` создаёт локальные таблицы и безопасен при повторном запуске.
Для просмотра собранной версии: `pnpm start` (адрес появится в терминале).

## Что внутри

- `app/page.tsx`: часы, лента, история, методология и источники.
- `app/globals.css`: текущий дизайн, цвета и адаптивная вёрстка.
- `components/clock/nixie-digit.tsx`: живые цифры ламп.
- `public/nixie-tube-dark.png`: изображение корпуса лампы.
- `lib/events.ts`: стартовые события, история и расчёт сценария.
- `lib/feed.ts`: источники новостей и разбор публикаций.
- `app/api/news/route.ts`: загрузка новостей и ограничение частоты проверок.
- `drizzle/`, `db/`: схема базы данных.
- `tests/scenario.test.mjs`: проверки расчёта сценария.

## Новости и база

Стартовая подборка входит в исходники. Облачная база опубликованного сайта
не входит в ZIP. Локальная база создаётся заново и хранится в `.wrangler/state`.
Обновление новостей требует интернета; выполняется при открытии и по кнопке,
не чаще одного раза в 15 минут. Доступность внешних источников может различаться.
Ключи AI для текущей реализации не требуются: оценка использует правила проекта.
Часы показывают условный сценарий, а не научный прогноз захвата мира.

## Проверка

```bash
pnpm exec tsc --noEmit --incremental false
node --experimental-strip-types --test tests/scenario.test.mjs
pnpm build
```

## Продолжение работы в Codex

Можно начать с запроса:
«Прочитай README.md, установи зависимости, подготовь локальную базу и запусти
проект. Сохрани текущий дизайн часов и правила расчёта. Дальнейшие изменения
вноси по моим указаниям».

Проект использует React, TypeScript, Vinext/Vite и локальную эмуляцию Cloudflare D1.
Это не обычный Next.js-сервер: используйте команды из package.json.
Файл `.openai/hosting.json` сохраняет связь с исходным Sites-проектом.
Локальный запуск ничего не публикует. Для другого хостинга потребуется адаптация.

## Состав экспорта

Исходники и изображения взяты из коммита 615f5e78499cb3d5de9851888a8a022b103cb640.
В экспорт добавлены эта инструкция, команда `db:init` и идемпотентная локальная SQL-схема.
Не включены node_modules, результаты сборки, Git-история, секреты и рабочие базы.

## Interface languages

English is the default for first visits and server-rendered HTML. Use **ENG / RUS / ESP** in the header to switch between English, Russian and Spanish. The selection is saved in browser local storage (`apocalypse-clock-language`) and synchronized across tabs. If storage is disabled, switching still works for the current session.

Translations live in `lib/translations.json`; the original Russian text is the lookup key, including messages from persisted feed records. Add both English and Spanish entries whenever changing user-facing copy. `lib/i18n.ts` handles interpolation, event localization and movement labels. Editorial events and history are translated; automatically fetched article headlines retain the source language and are labeled accordingly. Event IDs, source links and scenario calculations are unchanged.

Run `pnpm test` for scenario and localization checks, and `pnpm exec tsc --noEmit` for type checking.

Local path note: the current Vinext/Vite setup cannot load its configuration from a path containing `#` (such as `##Clock`). For development and builds, place a copy of the project in a path without `#`.

## Render deployment

Render runs the app as a Next.js Node service, using `pnpm build:render` and `pnpm start:render`. The launcher listens on `0.0.0.0:$PORT`. `tsconfig.render.json` selects `lib/db-node.ts`, a SQLite adapter for the same queries used by Cloudflare D1; the original local Vinext commands remain available. Node 24 is required for this deployment. No API keys are required.

The repository includes `render.yaml`. Health checks use `/api/health`, which verifies database access without polling news sources. Tables are created automatically at runtime. `DATABASE_PATH` controls the SQLite file location.

The default Free service uses an ephemeral news cache: automatic events are lost on restart, redeploy or idle spin-down, then fetched again when available from the sources. The editorial collection always remains in the code. For a durable news archive, use a paid instance, attach a persistent disk at `/var/data`, and set `DATABASE_PATH=/var/data/news.sqlite`. Back up existing data before changing the storage path. Free services also have cold starts after inactivity.
