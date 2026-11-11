import React from "react";

export function Input({
  value,
  defaultValue,
  placeholder,
  mono = false,
  multiline = false,
  rows = 2,
  disabled,
  onChange,
  onKeyDown,
  style,
}) {
  const [focus, setFocus] = React.useState(false);
  const s = {
    width: "100%",
    boxSizing: "border-box",
    background: "var(--color-bg-elevated)",
    color: "var(--color-text-primary)",
    border: "1px solid " + (focus ? "var(--color-border-bright)" : "var(--color-border)"),
    borderRadius: "var(--radius-md)",
    padding: "9px 11px",
    font: mono ? "var(--type-code)" : "var(--weight-regular) 14px/21px var(--font-ui)",
    outline: "none",
    resize: "none",
    transition: "var(--motion-hover)",
    boxShadow: focus ? "0 0 0 3px var(--color-accent-bg)" : "none",
    opacity: disabled ? 0.4 : 1,
  };
  const p = {
    value,
    defaultValue,
    placeholder,
    disabled,
    onChange,
    onKeyDown,
    onFocus: () => setFocus(true),
    onBlur: () => setFocus(false),
    style: { ...s, ...style },
  };
  return multiline ? <textarea rows={rows} {...p} /> : <input {...p} />;
}
