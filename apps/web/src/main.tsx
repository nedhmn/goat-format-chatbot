import "@goat-format-chatbot/design-system/styles.css";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

const root = document.querySelector("#root");

if (root)
  createRoot(root).render(
    <StrictMode>
      <main className="mx-auto max-w-layout px-4 py-16">
        <h1 className="font-heading text-3xl text-text-primary">Goat Format Chatbot</h1>
      </main>
    </StrictMode>,
  );
