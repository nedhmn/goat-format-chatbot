import React from "react";

const base = {
  font: "var(--weight-regular) 14px/14px var(--font-ui)",
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  gap: 8,
  cursor: "pointer",
  transition: "var(--motion-hover)",
  whiteSpace: "nowrap",
  boxSizing: "border-box",
  textDecoration: "none",
};

const sizes = {
  sm: { padding: "5.6px 10.5px 5.88px", fontSize: 14 },
  md: { padding: "9px 18px 9.5px", fontSize: 14 },
  lg: { padding: "13px 24px 13.5px", fontSize: 16 },
};

const variants = {
  primary: {
    background: "var(--ink)",
    color: "var(--paper)",
    border: "1px solid var(--ink)",
    borderRadius: "var(--radius-pill)",
  },
  secondary: {
    background: "var(--color-bg-hover)",
    color: "var(--color-text-primary)",
    border: "1px solid transparent",
    borderRadius: "var(--radius-pill)",
  },
  outline: {
    background: "transparent",
    color: "var(--color-text-primary)",
    border: "1px solid var(--color-border-bright)",
    borderRadius: "var(--radius-pill)",
  },
  ghost: {
    background: "transparent",
    color: "var(--color-text-primary)",
    border: "1px solid transparent",
    borderRadius: "var(--radius-none)",
  },
};

const hovers = {
  primary: { background: "#3a382f" },
  secondary: { background: "var(--paper-4)" },
  outline: { background: "var(--color-bg-hover)" },
  ghost: { background: "var(--color-bg-hover)" },
};

export function Button({
  variant = "primary",
  size = "sm",
  disabled = false,
  href,
  trailing,
  leading,
  onClick,
  children,
  style,
  ...rest
}) {
  const [hover, setHover] = React.useState(false);
  const Tag = href ? "a" : "button";
  const s = {
    ...base,
    ...sizes[size],
    ...variants[variant],
    ...(hover && !disabled ? hovers[variant] : null),
    ...(disabled ? { opacity: 0.4, cursor: "not-allowed" } : null),
    ...style,
  };
  return (
    <Tag
      href={href}
      onClick={disabled ? undefined : onClick}
      disabled={Tag === "button" ? disabled : undefined}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={s}
      {...rest}
    >
      {leading}
      {children}
      {trailing ? <span style={{ opacity: 0.9 }}>{trailing}</span> : null}
    </Tag>
  );
}
