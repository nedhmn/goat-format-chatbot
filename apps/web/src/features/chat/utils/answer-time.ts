const timeOnly = new Intl.DateTimeFormat(undefined, { timeStyle: "short" });
const dayAndTime = new Intl.DateTimeFormat(undefined, {
  month: "short",
  day: "numeric",
  hour: "numeric",
  minute: "2-digit",
});
const dateAndTime = new Intl.DateTimeFormat(undefined, {
  month: "short",
  day: "numeric",
  year: "numeric",
  hour: "numeric",
  minute: "2-digit",
});
const full = new Intl.DateTimeFormat(undefined, { dateStyle: "full", timeStyle: "short" });

function sameDay(a: Date, b: Date): boolean {
  return a.toDateString() === b.toDateString();
}

export function answerTime(sent: Date, now: Date): string {
  if (sameDay(sent, now)) return timeOnly.format(sent);
  if (sent.getFullYear() === now.getFullYear()) return dayAndTime.format(sent);
  return dateAndTime.format(sent);
}

export function fullTime(sent: Date): string {
  return full.format(sent);
}
