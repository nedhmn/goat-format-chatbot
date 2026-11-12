interface ImportMeta {
  glob(pattern: string): Record<string, () => Promise<object>>;
}
