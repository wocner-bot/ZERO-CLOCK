import { translate, locales, type Language } from "@/lib/i18n";

type Props = {
  language: Language;
  digits: number[];
  target: number;
  index: number;
  movement: number;
  closerEvents: number;
  reversedDays: number;
};

export function DystopiaHero({ language, digits, target, index, movement, closerEvents, reversedDays }: Props) {
  const t = (key: string, ...values: (string | number)[]) => translate(language, key, ...values);
  const number = (n: number) => new Intl.NumberFormat(locales[language], { maximumFractionDigits: 1 }).format(n);
  const date = new Date(target).toLocaleDateString(locales[language], { month: "short", day: "numeric", year: "numeric", timeZone: "UTC" });
  return (
    <section className="dystopia-hero" id="monitor" aria-labelledby="clock-title">
      <div className="hero-intro">
        <h1 id="clock-title">DYSTOPIA CLOCK</h1>
        <p className="hero-kicker">GREEN ARGUS AI WATCH</p>
        <p className="hero-tagline">{t("Время до порабощения человечества ИИ.")} <span>{t("Если мы не повернём время вспять.")}</span></p>
      </div>
      <div className="glass-countdown" role="timer" aria-live="off" aria-label={t("До условной даты {0} дней {1} часов {2} минут {3} секунд", ...digits)}>
        {digits.map((value, index) => (
          <div className="glass-group" key={index}>
            <div className="glass-bank" aria-hidden="true">
              {String(value).padStart(index === 0 ? 4 : 2, "0").split("").map((char, position) => (
                <span className="glass-tube" key={position}><span className="glass-numeral">{char}</span></span>
              ))}
            </div>
            <span className="glass-unit">{t(["ДНЕЙ", "ЧАСОВ", "МИНУТ", "СЕКУНД"][index])}</span>
          </div>
        ))}
      </div>
      <div className="hero-metrics">
        <div className="hero-metric">
          <span className="metric-label">{t("СЦЕНАРНАЯ ДАТА")}</span>
          <strong>{date}</strong>
          <small>{t("UTC · точка модели, не прогноз")}</small>
        </div>
        <div className="hero-metric">
          <span className="metric-label">{t("ИНДЕКС ДИСТОПИИ")}</span>
          <strong>{number(index)} <em>/ 100</em></strong>
          <small>{t("выше = ближе")}</small>
        </div>
        <div className="hero-metric">
          <span className="metric-label">{t("ЗА ПОСЛЕДНИЕ 7 ДНЕЙ")}</span>
          <strong className={movement > 0 ? "metric-amber" : movement < 0 ? "metric-green" : ""}>
            {movement > 0 ? "−" : movement < 0 ? "+" : ""}{t("{0} дн.", number(Math.abs(movement * 30)))}
          </strong>
          <small>{t("Событий, приблизивших дату: {0}", closerEvents)}</small>
        </div>
        <div className="hero-metric">
          <span className="metric-label">{t("ОТОДВИНУТО ЗА ЭТОТ ГОД")}</span>
          <strong className="metric-green">+{t("{0} дн.", number(reversedDays))}</strong>
          <small>{t("регулирование, проверки, надзор")}</small>
        </div>
      </div>
    </section>
  );
}
