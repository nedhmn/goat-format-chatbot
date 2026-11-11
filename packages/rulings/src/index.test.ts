import { expect, test } from "vitest";

import { title } from "./index.ts";

test("exports the title", () => {
  expect(title).toBe("Yu-Gi-Oh! Rulings Chatbot");
});
