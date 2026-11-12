export type PoolCard = { passcode: number; name: string };

export type Mentions = { passcodes: number[]; unmatched: string[] };

export const FUZZY_MIN_LENGTH = 8;

export function cardKey(name: string): string {
  return name
    .toLowerCase()
    .replaceAll(/[‘’]/g, "'")
    .trim()
    .replace(/\(s\)$/, "")
    .replace(/'s?$/, "")
    .replaceAll(/[^a-z0-9]/g, "");
}

export function quotedNames(text: string): string[] {
  return [...text.matchAll(/["“]([^"“”]+)["”]/g)].flatMap(([, name]) =>
    name?.trim() ? [name.trim()] : [],
  );
}

export function mentionMatcher(cards: PoolCard[]): (text: string) => Mentions {
  const byKey = new Map<string, number>();
  for (const { passcode, name } of cards) {
    const key = cardKey(name);
    if (!byKey.has(key)) byKey.set(key, passcode);
  }
  const fuzzyKeys = [...byKey.keys()].filter((key) => key.length >= FUZZY_MIN_LENGTH);

  return (text) => {
    const passcodes = new Set<number>();
    const unmatched: string[] = [];
    for (const name of quotedNames(text)) {
      const key = cardKey(name);
      const passcode = byKey.get(key) ?? nearMatch(key);
      if (passcode === undefined) unmatched.push(name);
      else passcodes.add(passcode);
    }
    return { passcodes: [...passcodes], unmatched };
  };

  function nearMatch(key: string): number | undefined {
    if (key.length < FUZZY_MIN_LENGTH) return undefined;
    const near = fuzzyKeys.filter((candidate) => withinOneEdit(key, candidate));
    return near.length === 1 && near[0] !== undefined ? byKey.get(near[0]) : undefined;
  }
}

export function withinOneEdit(a: string, b: string): boolean {
  if (Math.abs(a.length - b.length) > 1) return false;
  const [short, long] = a.length <= b.length ? [a, b] : [b, a];
  let i = 0;
  while (i < short.length && short[i] === long[i]) i++;
  if (short.length === long.length) return short.slice(i + 1) === long.slice(i + 1);
  return short.slice(i) === long.slice(i + 1);
}
