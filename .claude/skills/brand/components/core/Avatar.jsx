import React from "react";

const sizes = { sm: 20, md: 28, lg: 40 };

export function Avatar({ initials, src, alt = "", size = "sm", style }) {
  const d = sizes[size] || sizes.sm;
  return (
    <span
      style={{
        width: d,
        height: d,
        borderRadius: "var(--radius-pill)",
        background: "var(--paper-4)",
        color: "var(--color-text-muted)",
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        font: "var(--weight-regular) " + Math.round(d * 0.4) + "px/1 var(--font-ui)",
        overflow: "hidden",
        flex: "0 0 auto",
        ...style,
      }}
    >
      {src ? (
        <img src={src} alt={alt} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
      ) : (
        initials
      )}
    </span>
  );
}
