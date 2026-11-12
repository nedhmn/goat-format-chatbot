import React from "react";

export function Card({
  variant = "elevated",
  interactive = false,
  padding = 16,
  onClick,
  children,
  style,
}) {
  const [hover, setHover] = React.useState(false);
  const fills = {
    elevated: { background: "var(--color-bg-elevated)", border: "1px solid var(--color-border)" },
    outlined: { background: "var(--color-bg)", border: "1px solid var(--color-border-bright)" },
    plain: { background: "transparent", border: "1px solid transparent" },
  };
  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        borderRadius: "var(--radius-lg)",
        padding,
        boxSizing: "border-box",
        transition: "var(--motion-hover)",
        cursor: interactive ? "pointer" : "default",
        ...fills[variant],
        ...(interactive && hover ? { background: "var(--color-bg-hover)" } : null),
        ...style,
      }}
    >
      {children}
    </div>
  );
}
