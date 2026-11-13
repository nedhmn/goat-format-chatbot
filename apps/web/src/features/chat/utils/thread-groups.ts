export type Dated = { activeAt: number };

export type ThreadGroup<Thread extends Dated> = { label: string; threads: Thread[] };

const DAY = 86_400_000;

const month = new Intl.DateTimeFormat(undefined, { month: "long" });

const monthAndYear = new Intl.DateTimeFormat(undefined, { month: "long", year: "numeric" });

function startOfDay(time: Date): number {
  return new Date(time.getFullYear(), time.getMonth(), time.getDate()).getTime();
}

function groupLabel(active: Date, now: Date): string {
  const daysAgo = Math.round((startOfDay(now) - startOfDay(active)) / DAY);
  if (daysAgo <= 0) return "Today";
  if (daysAgo === 1) return "Yesterday";
  if (daysAgo <= 7) return "Previous 7 days";
  if (daysAgo <= 30) return "Previous 30 days";
  if (active.getFullYear() === now.getFullYear()) return month.format(active);
  return monthAndYear.format(active);
}

export function groupByActivity<Thread extends Dated>(
  threads: Thread[],
  now: Date,
): ThreadGroup<Thread>[] {
  const groups: ThreadGroup<Thread>[] = [];
  for (const thread of threads) {
    const label = groupLabel(new Date(thread.activeAt), now);
    const last = groups.at(-1);
    if (last?.label === label) last.threads.push(thread);
    else groups.push({ label, threads: [thread] });
  }
  return groups;
}
