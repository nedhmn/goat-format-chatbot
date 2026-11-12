import React from "react";

export function Code({ block = false, children, style }) {
  if (!block)
    return (
      <code
        style={{
          font: "var(--type-code)",
          background: "var(--color-code-bg)",
          color: "var(--color-code-text)",
          borderRadius: "var(--radius-sm)",
          padding: "1px 5px 2px",
          ...style,
        }}
      >
        {children}
      </code>
    );
  return (
    <pre
      style={{
        font: "var(--type-code)",
        background: "var(--color-code-bg)",
        color: "var(--color-code-text)",
        border: "1px solid var(--color-border)",
        borderRadius: "var(--radius-md)",
        padding: "12px 14px",
        margin: 0,
        overflowX: "auto",
        ...style,
      }}
    >
      <code>{children}</code>
    </pre>
  );
}
