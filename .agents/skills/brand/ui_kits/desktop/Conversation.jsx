import React from "react";

import { ToolCallLine } from "../../components/agent/ToolCallLine.jsx";
import { Button } from "../../components/core/Button.jsx";
import { Input } from "../../components/core/Input.jsx";

export function Conversation({ task, extra, onSend }) {
  const [draft, setDraft] = React.useState("");
  const send = () => {
    if (!draft.trim()) return;
    onSend(draft.trim());
    setDraft("");
  };
  return (
    <section
      style={{
        borderRight: "1px solid var(--color-border)",
        display: "flex",
        flexDirection: "column",
        minHeight: 0,
      }}
    >
      <div
        style={{
          padding: "11px 14px",
          borderBottom: "1px solid var(--color-border)",
          font: "var(--weight-regular) 14px/21px var(--font-ui)",
        }}
      >
        {task.title}
      </div>
      <div
        style={{
          flex: 1,
          overflowY: "auto",
          padding: "12px 14px",
          display: "grid",
          gap: 10,
          alignContent: "start",
        }}
      >
        <div
          style={{
            background: "var(--color-bg-elevated)",
            border: "1px solid var(--color-border)",
            borderRadius: "var(--radius-md)",
            padding: "10px 12px",
            font: "var(--weight-regular) 14px/20px var(--font-ui)",
          }}
        >
          {task.prompt}
        </div>
        <div style={{ display: "grid", gap: 1 }}>
          {task.steps.map((s, i) => (
            <ToolCallLine key={i} {...s} />
          ))}
        </div>
        <div style={{ font: "var(--weight-regular) 14px/20px var(--font-ui)" }}>{task.say}</div>
        <div style={{ font: "var(--weight-regular) 14px/20px var(--font-ui)" }}>{task.done}</div>
        {extra.map((m, i) => (
          <React.Fragment key={i}>
            <div
              style={{
                background: "var(--color-bg-elevated)",
                border: "1px solid var(--color-border)",
                borderRadius: "var(--radius-md)",
                padding: "10px 12px",
                font: "var(--weight-regular) 14px/20px var(--font-ui)",
              }}
            >
              {m.prompt}
            </div>
            {m.pending ? (
              <ToolCallLine verb="Thought" duration="…" />
            ) : (
              <React.Fragment>
                <div style={{ display: "grid", gap: 1 }}>
                  <ToolCallLine verb="Searched" target="Ash Blossom & Joyous Spring" />
                  <ToolCallLine verb="Thought" duration="3s" />
                </div>
                <div style={{ font: "var(--weight-regular) 14px/20px var(--font-ui)" }}>
                  Answered. One ruling cited.
                </div>
              </React.Fragment>
            )}
          </React.Fragment>
        ))}
      </div>
      <div
        style={{ borderTop: "1px solid var(--color-border)", padding: 10, display: "grid", gap: 8 }}
      >
        <Input
          multiline
          rows={2}
          value={draft}
          placeholder="Ask a ruling question…"
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) send();
          }}
        />
        <div style={{ display: "flex", justifyContent: "flex-end" }}>
          <Button size="sm" onClick={send} trailing="→">
            Send
          </Button>
        </div>
      </div>
    </section>
  );
}
