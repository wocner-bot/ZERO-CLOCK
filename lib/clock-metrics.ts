/** Positive days gained from effective de-escalating events in the current UTC year. */
export function yearlyReversalDays(
  events: { id: string; date: string }[],
  weights: Record<string, number>,
  today: string,
): number {
  const start = `${today.slice(0, 4)}-01-01`;
  return events.reduce((days, event) => {
    if (event.date < start || event.date > today) return days;
    return days + Math.max(0, -(weights[event.id] ?? 0)) * 30;
  }, 0);
}
