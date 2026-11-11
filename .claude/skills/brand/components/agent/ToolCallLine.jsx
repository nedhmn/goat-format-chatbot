import React from "react";

export function ToolCallLine({ verb, target, duration, style }) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "baseline",
        gap: 7,
        font: "var(--weight-regular) 14px/22px var(--font-ui)",
        letterSpacing: ".08px",
        color: "var(--color-text-primary)",
        ...style,
      }}
    >
      <span>{verb}</span>
      {target ? <span style={{ color: "var(--color-text-faint)" }}>{target}</span> : null}
      {duration ? <span style={{ color: "var(--color-text-faint)" }}>{duration}</span> : null}
    </div>
  );
}
