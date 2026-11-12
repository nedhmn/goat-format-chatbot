import "@goat-format-chatbot/design-system/styles.css";
import { RouterProvider } from "@tanstack/react-router";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

import { AppProvider } from "@/app/provider";
import { router } from "@/app/router";

const root = document.querySelector("#root");

if (root)
  createRoot(root).render(
    <StrictMode>
      <AppProvider>
        <RouterProvider router={router} />
      </AppProvider>
    </StrictMode>,
  );
