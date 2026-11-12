import React from "react";

const tones = {
  neutral: { bg: "var(--color-bg-hover)", fg: "var(--color-text-primary)" },
  accent: { bg: "var(--color-accent-bg)", fg: "var(--color-accent)" },
  success: { bg: "var(--color-success-bg)", fg: "var(--color-success)" },
  error: { bg: "var(--color-error-bg)", fg: "var(--color-error)" },
  outline: {
    bg: "transparent",
    fg: "var(--color-text-muted)",
    border: "1px solid var(--color-border-bright)",
  },
};

export function Badge({ tone = "neutral", mono = false, children, style }) {
  const t = tones[tone] || tones.neutral;
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        background: t.bg,
        color: t.fg,
        border: t.border || "1px solid transparent",
        borderRadius: "var(--radius-sm)",
        padding: "2px 7px 3px",
        font: mono ? "var(--type-code)" : "var(--weight-regular) 13px/17px var(--font-ui)",
        letterSpacing: mono ? 0 : ".1px",
        ...style,
      }}
    >
      {children}
    </span>
  );
}
