"use client";
import { useEffect, useState, useCallback, useMemo, useRef } from "react";
import {
  Radio,
  RefreshCw,
  ArrowUpRight,
  Activity,
  ShieldCheck,
  Search,
  ChevronDown,
  ExternalLink,
} from "lucide-react";
import { DystopiaHero } from "@/components/clock/dystopia-hero";
import { yearlyReversalDays } from "@/lib/clock-metrics";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import {
  seed,
  history,
  checkedAt,
  score,
  targetDate,
  contributions,
  periodEvents,
  type Event,
} from "@/lib/events";
import {
  translate,
  localizeEvent,
  formatShift,
  locales,
  type Language,
} from "@/lib/i18n";
import { useLanguage } from "@/hooks/use-language";
function Change({ n, language }: { n: number; language: Language }) {
  return (
    <span
      className={"change " + (n > 0 ? "danger" : n < 0 ? "safe" : "neutral")}
    >
      {formatShift(n, language)}
    </span>
  );
}
type SourceStatus = {
  id: string;
  checked: string;
  status: string;
};
type NewsResponse = {
  events: Event[];
  sources: SourceStatus[];
  message: string;
  refreshed?: number;
  available?: number;
  nextCheckAt?: string;
  unavailable?: boolean;
};
const anchor = (id: string) => "event-" + id.replace(/[^a-z0-9-]/gi, "-");
export default function Home() {
  const [language, chooseLanguage] = useLanguage();
  const t = (text: string, ...values: (string | number)[]) =>
    translate(language, text, ...values);
  const date = (v: string | number) =>
    new Date(v).toLocaleDateString(locales[language], {
      day: "numeric",
      month: "short",
      year: "numeric",
      timeZone: "UTC",
    });
  const number = (n: number) =>
    new Intl.NumberFormat(locales[language], {
      maximumFractionDigits: 1,
    }).format(n);
  useEffect(() => {
    document.documentElement.lang = language;
    document.title = translate(
      language,
      "Dystopia Clock — Green Argus: наблюдение за ИИ",
    );
    document
      .querySelector('meta[name="description"]')
      ?.setAttribute(
        "content",
        translate(
          language,
          "Реальные события развития AI и открытая сценарная модель: часы, новости, история и источники.",
        ),
      );
  }, [language]);
  const [events, setEvents] = useState<Event[]>(seed),
    [now, setNow] = useState<number | null>(null),
    [busy, setBusy] = useState(false),
    [response, setResponse] = useState<NewsResponse | null>(null),
    [offline, setOffline] = useState(false),
    [sources, setSources] = useState<SourceStatus[]>([]),
    [query, setQuery] = useState(""),
    [category, setCategory] = useState("Все события"),
    [view, setView] = useState("clock");
  useEffect(() => {
    const syncView = () => {
      const views: Record<string, string> = { "": "clock", "#journal": "feed", "#monitor": "clock", "#events": "feed", "#history": "history", "#method": "method", "#sources": "sources" };
      const next = views[window.location.hash];
      if (next) {
        setView(next);
        window.scrollTo({ top: 0, behavior: "instant" });
      }
    };
    syncView();
    window.addEventListener("hashchange", syncView);
    return () => window.removeEventListener("hashchange", syncView);
  }, []);
  const [refreshResult, setRefreshResult] = useState<{
      added: number;
      days: number;
      wasLoaded: boolean;
    } | null>(null),
    [nextCheck, setNextCheck] = useState<string | null>(null);
  const currentEvents = useRef(seed),
    loaded = useRef(false),
    pending = useRef(false);
  const refresh = useCallback(async () => {
    if (pending.current) return;
    pending.current = true;
    setBusy(true);
    try {
      const r = await fetch("/api/news", { cache: "no-store" });
      if (!r.ok) throw Error();
      const data = (await r.json()) as NewsResponse;
      if (!Array.isArray(data.events)) throw Error();
      setResponse(data);
      setOffline(false);
      setSources(data.sources ?? []);
      setNextCheck(data.nextCheckAt ?? null);
      if (data.unavailable) return;
      const before = currentEvents.current;
      const ids = new Set(before.map((e) => e.id));
      const added = data.events.filter((e) => !ids.has(e.id)).length;
      const days = Math.round(
        (targetDate(score(data.events)) - targetDate(score(before))) / 86400000,
      );
      setRefreshResult({ added, days, wasLoaded: loaded.current });
      currentEvents.current = data.events;
      setEvents(data.events);
      loaded.current = true;
    } catch {
      setOffline(true);
    } finally {
      pending.current = false;
      setBusy(false);
    }
  }, []);
  useEffect(() => {
    const firstTick = setTimeout(() => {
      setNow(Date.now());
      void refresh();
    }, 0);
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => {
      clearTimeout(firstTick);
      clearInterval(timer);
    };
  }, [refresh]);
  const displayEvents = useMemo(
    () => events.map((event) => localizeEvent(event, language)),
    [events, language],
  );
  const latestCheck = sources
    .map((source) => source.checked)
    .sort()
    .at(-1);
  const status = offline
    ? t("Связь недоступна. Показана последняя загруженная подборка.")
    : response?.unavailable
      ? t(
          "Обновление недоступно. Сохранённая лента доступна; её актуальность не подтверждена.",
        )
      : response
        ? t("Источники: {0}/4 доступны", response.available ?? 0) +
          (latestCheck
            ? " · " +
              new Date(latestCheck).toLocaleString(locales[language], {
                timeZone: "Asia/Tbilisi",
                day: "numeric",
                month: "short",
                hour: "2-digit",
                minute: "2-digit",
              }) +
              " (" +
              t("Тбилиси") +
              ")"
            : "")
        : t("Проверенная подборка · 29 сентября 2026");
  const change = refreshResult
    ? refreshResult.days < 0
      ? t("Дата приблизилась на {0} дн.", number(-refreshResult.days))
      : refreshResult.days > 0
        ? t("Дата отдалилась на {0} дн.", number(refreshResult.days))
        : t("Дата не изменилась.")
    : "";
  const feedback = offline
    ? t(
        "Не удалось обновить ленту. Часы и события сохранены. Попробуйте ещё раз.",
      )
    : response?.unavailable
      ? t(
          "Новые события не удалось проверить. Часы и загруженная лента сохранены.",
        )
      : refreshResult
        ? (response?.refreshed === 0
            ? t("Показан сохранённый результат проверки. ")
            : "") +
          (refreshResult.added
            ? t(
                refreshResult.wasLoaded
                  ? "Добавлено событий: {0}."
                  : "Загружено сверх стартовой подборки событий: {0}.",
                number(refreshResult.added),
              )
            : t(
                response?.available === 4
                  ? "Новых событий нет."
                  : "Новых событий в доступных источниках нет.",
              )) +
          " " +
          change +
          (response?.available !== 4 ? t(" Не все источники доступны.") : "")
        : t("Загружаем новые события. Пока показана стартовая подборка.");
  const weights = useMemo(() => contributions(events), [events]);
  const index = score(events),
    target = targetDate(index),
    seconds = Math.max(
      0,
      Math.floor((target - (now ?? Date.parse(checkedAt))) / 1000),
    );
  const digits = [
    Math.floor(seconds / 86400),
    Math.floor(seconds / 3600) % 24,
    Math.floor(seconds / 60) % 60,
    seconds % 60,
  ];
  const filtered = displayEvents.filter(
    (e) =>
      (category === "Все события" || e.category === t(category)) &&
      `${e.title} ${t(e.source)} ${e.summary}`
        .toLowerCase()
        .includes(query.toLowerCase()),
  );
  const today = new Date(now ?? Date.parse(checkedAt))
    .toISOString()
    .slice(0, 10);
  const week = periodEvents(displayEvents, today),
    movement = week.events.reduce((n, e) => n + (weights[e.id] ?? 0), 0);
  const latestDate =
    events
      .map((e) => e.date)
      .sort()
      .at(-1) || checkedAt.slice(0, 10);
  const digest = periodEvents(displayEvents, latestDate),
    digestShift = digest.events.reduce((n, e) => n + (weights[e.id] ?? 0), 0);
  const drivers = [...week.events]
    .filter((e) => weights[e.id] !== 0)
    .sort((a, b) => Math.abs(weights[b.id]) - Math.abs(weights[a.id]))
    .slice(0, 3);
  const digestDrivers = [...digest.events]
    .filter((e) => weights[e.id] !== 0)
    .sort((a, b) => Math.abs(weights[b.id]) - Math.abs(weights[a.id]))
    .slice(0, 3);
  const showEvent = (id: string) => {
    setView("feed");
    setCategory("Все события");
    setQuery("");
    setTimeout(
      () =>
        document
          .getElementById(anchor(id))
          ?.scrollIntoView({ block: "center" }),
      0,
    );
  };
  return (
    <main className={`dystopia-site ${view === "clock" ? "clock-view" : "content-view"}`}>
      <header>
        <a className="brand" href="#monitor" onClick={() => setView("clock")}>
          <span className="argus-mark" aria-hidden="true" />
          <div className="brand-copy">
            <span className="brand-name">GREEN ARGUS</span>
            <small>{t("НАБЛЮДЕНИЕ ЗА МАШИННЫМ ИНТЕЛЛЕКТОМ")}</small>
          </div>
        </a>
        <nav aria-label={t("Основная навигация")}>
          {[
            ["clock", "monitor", "Часы"], ["feed", "events", "События"],
            ["history", "history", "История AI"], ["method", "method", "Методология"],
            ["sources", "sources", "Источники"],
          ].map(([key, hash, label]) => (
            <a key={key} href={`#${hash}`} aria-current={view === key ? "page" : undefined} onClick={() => setView(key)}>{t(label)}</a>
          ))}
        </nav>
        <div
          className="language-switcher"
          role="group"
          aria-label={t("Язык интерфейса")}
        >
          {(
            [
              { code: "en", label: "ENG", name: "English" },
              { code: "ru", label: "RUS", name: "Русский" },
              { code: "es", label: "ESP", name: "Español" },
            ] as const
          ).map((item) => (
            <button
              type="button"
              key={item.code}
              lang={item.code}
              aria-label={item.name}
              aria-pressed={language === item.code}
              onClick={() => chooseLanguage(item.code)}
            >
              {item.label}
            </button>
          ))}
        </div>
      </header>
      {view === "clock" && <DystopiaHero
        language={language} digits={digits} target={target} index={index}
        movement={movement}
        closerEvents={week.events.filter((event) => (weights[event.id] ?? 0) > 0).length}
        reversedDays={yearlyReversalDays(events, weights, today)}
      />}
      <div className="feed-overview" hidden={view !== "feed"}>
      <section
        className="change-summary"
        aria-label={t("Что изменилось за неделю")}
      >
        <div>
          <span className="label">
            {t("ЗА 7 ДНЕЙ ·")} {date(week.start)} — {date(week.end)}
          </span>
          <h2>
            {movement === 0
              ? t("Дата не сдвинулась")
              : movement > 0
                ? t("Дата приблизилась на {0} дн.", number(movement * 30))
                : t("Дата отдалилась на {0} дн.", number(-movement * 30))}
          </h2>
          <p>
            {week.events.length
              ? t("Учтено событий: {0}. Главные причины:", week.events.length)
              : t(
                  "За этот период в ленте нет событий. Проверьте актуальность источников.",
                )}
          </p>
        </div>
        <div className="driver-list">
          {drivers.map((e) => (
            <button key={e.id} onClick={() => showEvent(e.id)}>
              <span>{e.title}</span>
              <Change n={weights[e.id]} language={language} />
            </button>
          ))}
          {week.events.length > 0 && !drivers.length && (
            <p>
              {t(
                "События получили нулевое влияние после применения ограничений.",
              )}
            </p>
          )}
        </div>
      </section>
      <div className="status-strip">
        <div>
          <span>
            <Radio size={16} />
            {status}
          </span>
          <p>
            {t("Проверка источников не чаще раза в 15 минут.")}
            {nextCheck && Date.parse(nextCheck) > (now ?? 0)
              ? t(
                  " Следующая возможна после {0} (Тбилиси).",
                  new Date(nextCheck).toLocaleTimeString(locales[language], {
                    hour: "2-digit",
                    minute: "2-digit",
                    timeZone: "Asia/Tbilisi",
                  }),
                )
              : ""}
          </p>
        </div>
        <button onClick={refresh} disabled={busy}>
          <RefreshCw size={16} className={busy ? "spin" : ""} />
          {busy ? t("Проверяем источники") : t("Обновить ленту")}
        </button>
      </div>
      <p className="refresh-feedback" role="status" aria-live="polite">
        {feedback ||
          t("Загружаем новые события. Пока показана стартовая подборка.")}
      </p>
      <div className="stats">
        <div>
          <span className="label">{t("СОБЫТИЯ В БАЗЕ")}</span>
          <strong>
            {events.length}
            <small>{t("подборка + автолента")}</small>
          </strong>
        </div>
        <div>
          <span className="label">{t("СДВИГ ЗА 7 ДНЕЙ")}</span>
          <strong className={movement > 0 ? "orange" : "green"}>
            {movement > 0 ? "−" : movement < 0 ? "+" : ""}
            {number(Math.abs(movement * 30))}
            <small>{t("условных дней")}</small>
          </strong>
        </div>
        <div>
          <span className="label">{t("ИСТОРИЧЕСКИЙ АРХИВ")}</span>
          <strong>
            1943<span className="muted">—</span>2026
          </strong>
        </div>
        <div>
          <span className="label">{t("ПРОВЕРКА ПРИ ОТКРЫТИИ")}</span>
          <strong className="small-stat">
            {t("4 источника")}
            <small>{t("статус во вкладке «Источники»")}</small>
          </strong>
        </div>
      </div>
      </div>
      <section id="journal" className="journal" hidden={view === "clock"}>
        <Tabs value={view} onValueChange={(next) => { setView(next); window.history.replaceState(null, "", `#${next === "feed" ? "events" : next}`); }}>
          <TabsList className="main-tabs" variant="line">
            <TabsTrigger value="feed">
              {t("Лента событий")}
              <span>{events.length}</span>
            </TabsTrigger>
            <TabsTrigger value="history">{t("История AI")}</TabsTrigger>
            <TabsTrigger value="method">{t("Методология")}</TabsTrigger>
            <TabsTrigger value="sources">{t("Источники")}</TabsTrigger>
          </TabsList>
          <TabsContent value="feed">
            <div className="news-layout">
              <div className="news-column">
                <div className="toolbar">
                  <div className="search">
                    <Search size={17} />
                    <input
                      aria-label={t("Поиск событий")}
                      placeholder={t("Найти событие или модель")}
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                    />
                  </div>
                  <Select value={category} onValueChange={setCategory}>
                    <SelectTrigger aria-label={t("Категория событий")}>
                      <SelectValue>{t(category)}</SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      {[
                        "Все события",
                        "Модели",
                        "Безопасность",
                        "Законы",
                        "Инциденты",
                        "Исследования",
                      ].map((c) => (
                        <SelectItem key={c} value={c}>
                          {t(c)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="feed-heading">
                  <span>{t("ПОСЛЕДНИЕ СОБЫТИЯ")}</span>
                  <span>
                    {filtered.length} {t("из")} {events.length}
                  </span>
                </div>
                {filtered.map((e) => {
                  const effective = weights[e.id] ?? 0,
                    limited = effective !== e.delta;
                  return (
                    <article className="news-item" key={e.id} id={anchor(e.id)}>
                      <div
                        className={
                          "event-mark " +
                          (effective < 0
                            ? "safe"
                            : effective === 0
                              ? "neutral"
                              : "")
                        }
                      >
                        {effective < 0 ? (
                          <ShieldCheck size={18} />
                        ) : (
                          <Activity size={18} />
                        )}
                      </div>
                      <div className="event-body">
                        <div className="meta">
                          <time>{date(e.date)}</time>
                          <span>·</span>
                          <span>{e.category}</span>
                          <span className={e.auto ? "auto" : "reviewed"}>
                            {e.auto
                              ? t("Автооценка · по заголовку")
                              : t("Редакционная оценка")}
                          </span>
                          {e.auto && (
                            <span className="original-language">
                              {t("Заголовок на языке источника")}
                            </span>
                          )}
                        </div>
                        <h2>
                          <a href={e.url} target="_blank" rel="noreferrer">
                            {e.title}
                            <ArrowUpRight size={17} />
                          </a>
                        </h2>
                        <p>{e.summary}</p>
                        <Change n={effective} language={language} />
                        {limited && (
                          <p className="limit-note">
                            {effective === 0
                              ? t("Сдвига нет: достигнуто ограничение модели.")
                              : t(
                                  "Вес учтён частично из-за ограничения модели.",
                                )}
                          </p>
                        )}
                        <details>
                          <summary>
                            {effective === 0
                              ? t("Почему дата не изменилась")
                              : t("Почему меняется дата")}{" "}
                            <ChevronDown size={16} />
                          </summary>
                          <div className="reason">
                            {e.reason}
                            <br />
                            <b>
                              {t("Исходный вес:")} {e.delta > 0 ? "+" : ""}
                              {number(e.delta)}
                              {t(". Учтённый вклад:")}{" "}
                              {effective > 0 ? "+" : ""}
                              {number(effective)} {t("балла.")}
                            </b>
                            <br />
                            {t(
                              "1 балл = 30 условных дней. Вклад рассчитан последовательно по датам событий с учётом ограничений.",
                            )}
                          </div>
                        </details>
                        <a
                          className="source"
                          href={e.url}
                          target="_blank"
                          rel="noreferrer"
                        >
                          {t("Читать источник:")} {t(e.source)}
                          <ExternalLink size={14} />
                        </a>
                      </div>
                    </article>
                  );
                })}
                {!filtered.length && (
                  <div className="empty">
                    <p>{t("Событий не найдено.")}</p>
                    <button
                      onClick={() => {
                        setQuery("");
                        setCategory("Все события");
                      }}
                    >
                      {t("Сбросить поиск и фильтр")}
                    </button>
                  </div>
                )}
              </div>
              <aside>
                <div className="digest">
                  <div className="eyebrow">{t("ДАЙДЖЕСТ ЛЕНТЫ")}</div>
                  <p className="digest-period">
                    {date(digest.start)} — {date(digest.end)}
                  </p>
                  <h2>
                    {digestShift > 0
                      ? t("Условная дата стала ближе.")
                      : digestShift < 0
                        ? t("Условная дата отдалилась.")
                        : t("Условная дата не изменилась.")}
                  </h2>
                  <p>
                    {t("Событий за период:")} {digest.events.length}.{" "}
                    {formatShift(digestShift, language)}{" "}
                    {t("Сводка пересчитывается вместе с загруженной лентой.")}
                  </p>
                  <div className="digest-rule" />
                  <div className="digest-counts">
                    <p>
                      <b>
                        {digest.events.filter((e) => weights[e.id] > 0).length}
                      </b>
                      {t("приближают дату")}
                    </p>
                    <p>
                      <b>
                        {digest.events.filter((e) => weights[e.id] < 0).length}
                      </b>
                      {t("отдаляют дату")}
                    </p>
                    <p>
                      <b>
                        {
                          digest.events.filter((e) => weights[e.id] === 0)
                            .length
                        }
                      </b>
                      {t("без влияния")}
                    </p>
                  </div>
                  <h3>{t("События с наибольшим вкладом")}</h3>
                  {digestDrivers.map((e) => (
                    <button
                      className="digest-event"
                      key={e.id}
                      onClick={() => showEvent(e.id)}
                    >
                      <span>{e.title}</span>
                      <Change n={weights[e.id]} language={language} />
                    </button>
                  ))}
                  {!digestDrivers.length && (
                    <p>
                      {t("В этом периоде нет событий с ненулевым вкладом.")}
                    </p>
                  )}
                  <small>
                    {t(
                      "Период заканчивается датой последней публикации в базе. Дайджест не получает отдельный вес. Это сводка оценок модели, не независимая экспертиза.",
                    )}
                  </small>
                </div>
                <div className="legend">
                  <span className="label">{t("КАК ЧИТАТЬ ЛЕНТУ")}</span>
                  <p className="orange">
                    {t("Приближает: времени до условной даты меньше.")}
                  </p>
                  <p className="green">
                    {t("Отдаляет: времени до условной даты больше.")}
                  </p>
                  <p className="muted">
                    {t(
                      "Источники подтверждают события. Направление и вес — интерпретация проекта.",
                    )}
                  </p>
                </div>
              </aside>
            </div>
          </TabsContent>
          <TabsContent value="history">
            <div className="section-heading">
              <div>
                <span className="eyebrow">{t("83 ГОДА РАЗВИТИЯ")}</span>
                <h2>{t("Как мы сюда пришли")}</h2>
              </div>
              <p>
                {t("Ключевые вехи, не исчерпывающая история.")}
                <br />
                {t("Архив даёт контекст и не добавляет баллы к индексу.")}
              </p>
            </div>
            <div className="timeline">
              {history.map((e, i) => (
                <article key={i}>
                  <time>{e.year}</time>
                  <div>
                    <h3>{t(e.title)}</h3>
                    <p>{t(e.text)}</p>
                    <a href={e.url} target="_blank" rel="noreferrer">
                      {t(e.source)}
                      <ArrowUpRight size={15} />
                    </a>
                  </div>
                </article>
              ))}
            </div>
          </TabsContent>
          <TabsContent value="method">
            <div className="section-heading">
              <div>
                <span className="eyebrow">{t("ОТКРЫТАЯ МОДЕЛЬ / V1.1")}</span>
                <h2>{t("Факты отдельно. Сценарий отдельно.")}</h2>
              </div>
            </div>
            <div className="method-grid">
              <article>
                <h3>{t("Что означают часы")}</h3>
                <p>
                  {t(
                    "Дату захвата мира AI научно рассчитать невозможно. Здесь «нулевой час» — художественный сценарий утраты значимого человеческого контроля. Это не часы Bulletin of the Atomic Scientists.",
                  )}
                </p>
                <p>
                  {t(
                    "Исходный индекс 55 выбран автором проекта условно. Он не выведен из истории AI и не означает 55% вероятности. У него нет научной калибровки.",
                  )}
                </p>
              </article>
              <article>
                <h3>{t("Как считается дата")}</h3>
                <code>
                  {t("I = clamp(55 + Σ событий + авто, 0, 99)")}
                  <br />
                  {t("Дата = 29.09.2026 + (100 − I) × 30 дней")}
                </code>
                <p>
                  {t(
                    "Положительный вес приближает дату, отрицательный отдаляет. Начальная дата фиксирована, поэтому перезагрузка не сбрасывает отсчёт. Движение секунд — только визуальный отсчёт; новых фактов оно не создаёт.",
                  )}
                </p>
              </article>
              <article>
                <h3>{t("Откуда берутся веса")}</h3>
                <p>
                  {t(
                    "У проверенной подборки веса от −2 до +2 баллов. Они учитывают доступность возможностей, злоупотребления и меры контроля. Причина раскрывается у каждого события. Это субъективная оценка проекта.",
                  )}
                </p>
                <p>
                  {t(
                    "Дайджест и историческая шкала повторно не учитываются. Релиз и отчёт о его безопасности разделены только при наличии разных сигналов. Карточки показывают вклад в хронологическом пересчёте: разницу индекса до и после добавления события с учётом всех лимитов. Внутри одной даты сначала идут редакционные события, затем автоматические; порядок фиксирован идентификатором. Новость, найденная с опозданием, может перераспределить вклад карточек. Сумма всех вкладов равна текущему индексу минус исходные 55 баллов.",
                  )}
                </p>
              </article>
              <article>
                <h3>{t("Что делает автоматическая лента")}</h3>
                <p>
                  {t(
                    "При открытии запрашиваются официальные RSS OpenAI и Google, новостные страницы Anthropic и Еврокомиссии. Сервер проверяет их не чаще раза в 15 минут. Новые материалы сохраняются; повторные URL и совпадающие нормализованные заголовки отбрасываются.",
                  )}
                </p>
                <p>
                  {t(
                    "Автоправило анализирует только заголовок: новый релиз +0,5; явно заявленная защитная мера −0,5; неоднозначные новости 0. Суммарный вклад автоматики ограничен ±5 баллами. Это грубая эвристика, она может ошибаться.",
                  )}
                </p>
              </article>
              <article>
                <h3>{t("Границы покрытия")}</h3>
                <p>
                  {t(
                    "Подборка не охватывает все новости мира. Редакционная подборка проверена на 29.09.2026. Автоматически загружаются новые публикации с этой даты; ленты могут пропускать события, особенно при изменении структуры сайтов. Автолента не заменяет чтение полного текста.",
                  )}
                </p>
                <p>
                  {t(
                    "Фоновое обновление при закрытом сайте не настроено. При сбоях остаются сохранённые события, а статус показывает недоступные источники.",
                  )}
                </p>
              </article>
              <article>
                <h3>{t("Что произойдёт в ноль")}</h3>
                <p>
                  {t(
                    "Отсчёт остановится с предложением пересмотреть сценарий. Никакого утверждения о реальном наступлении катастрофы не будет. Модель предназначена для обсуждения взаимосвязи развития и контроля AI.",
                  )}
                </p>
              </article>
            </div>
          </TabsContent>
          <TabsContent value="sources">
            <div className="section-heading">
              <div>
                <span className="eyebrow">{t("ПРОИСХОЖДЕНИЕ ДАННЫХ")}</span>
                <h2>{t("Можно проверить каждое событие")}</h2>
              </div>
              <p>
                {t("Редакционная проверка: 29 сентября 2026.")}
                <br />
                {t("Сведения производителей не равны независимым испытаниям.")}
              </p>
            </div>
            <div className="sources-grid">
              {[
                [
                  "OpenAI",
                  "https://openai.com/news/",
                  "Автоматический RSS + проверенная подборка",
                ],
                [
                  "Google AI",
                  "https://blog.google/technology/ai/",
                  "Автоматический RSS + проверенная подборка",
                ],
                [
                  "Anthropic",
                  "https://www.anthropic.com/news",
                  "Автоматическая новостная страница + подборка",
                ],
                [
                  "Еврокомиссия",
                  "https://digital-strategy.ec.europa.eu/en/policies/regulatory-framework-ai",
                  "Новости AI · автоматическая страница + подборка",
                ],
              ].map(([name, url, note]) => (
                <article key={name}>
                  <h3>
                    <a href={url} target="_blank" rel="noreferrer">
                      {t(name)}
                      <ArrowUpRight size={18} />
                    </a>
                  </h3>
                  <p>{t(note)}</p>
                  {sources.find((s) => s.id === name) && (
                    <small>
                      {t(sources.find((s) => s.id === name)?.status ?? "")} ·{" "}
                      {new Date(
                        sources.find((s) => s.id === name)!.checked,
                      ).toLocaleString(locales[language], {
                        timeZone: "Asia/Tbilisi",
                        day: "numeric",
                        month: "short",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}{" "}
                      {t("(Тбилиси)")}
                    </small>
                  )}
                </article>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </section>
      <footer>
        <span>{t("Будущее не предопределено.")}</span>
        <a href="#method" onClick={() => setView("method")}>
          <span>{t("Проект")} <b>GREEN ARGUS</b>{language === "en" ? " PROJECT" : ""} · {t("Независимые индексы ИИ")}</span>
        </a>
      </footer>
      {seconds === 0 && (
        <div role="status" className="expired">
          {t(
            "Условный горизонт достигнут. Требуется пересмотр модели, а не объявление катастрофы.",
          )}
        </div>
      )}
    </main>
  );
}
