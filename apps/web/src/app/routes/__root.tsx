import { Outlet, createRootRoute } from "@tanstack/react-router";

function RootLayout() {
  return (
    <main className="mx-auto max-w-layout px-4 py-16">
      <Outlet />
    </main>
  );
}

export const Route = createRootRoute({ component: RootLayout });
