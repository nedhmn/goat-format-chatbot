import { Link, Outlet, createRootRoute } from "@tanstack/react-router";

function RootLayout() {
  return (
    <div className="mx-auto flex h-dvh w-full max-w-layout flex-col px-4">
      <header className="flex h-14 shrink-0 items-center border-b border-border">
        <Link to="/" className="font-heading text-lg text-text-primary no-underline">
          Goat Format Chatbot
        </Link>
      </header>
      <main className="flex min-h-0 flex-1 flex-col">
        <Outlet />
      </main>
    </div>
  );
}

export const Route = createRootRoute({ component: RootLayout });
