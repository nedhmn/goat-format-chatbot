import { createRouter } from "@tanstack/react-router";

import { routeTree } from "./route-tree.gen";

export const router = createRouter({ routeTree, basepath: import.meta.env.BASE_URL });

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}
