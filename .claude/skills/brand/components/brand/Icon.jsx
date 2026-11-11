import React from "react";

export function Icon({ icon: Glyph, size = 16, color = "currentColor", label, style }) {
  if (!Glyph) return null;
  return (
    <Glyph
      size={size}
      color={color}
      role={label ? "img" : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
      style={{ flex: "0 0 auto", display: "block", ...style }}
    />
  );
}
