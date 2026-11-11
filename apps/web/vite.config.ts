import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname } from "node:path";
import { fileURLToPath } from "node:url";

import { defineConfig, type Plugin, type PreviewServer, type ViteDevServer } from "vite";

const host = "127.0.0.1";
const portsFile = fileURLToPath(new URL("../../.dev/ports.env", import.meta.url));

function writePorts(lines: string[]) {
  mkdirSync(dirname(portsFile), { recursive: true });
  writeFileSync(portsFile, lines.map((line) => `${line}\n`).join(""));
}

function readPorts() {
  if (!existsSync(portsFile)) return [];
  return readFileSync(portsFile, "utf8")
    .split("\n")
    .filter((line) => line !== "");
}

function recordUrl(key: string, server: ViteDevServer | PreviewServer) {
  const { httpServer } = server;
  if (!httpServer) return;
  let entry: string | undefined;
  const clear = () => {
    const lines = readPorts();
    if (entry !== undefined && lines.includes(entry))
      writePorts(lines.filter((line) => line !== entry));
  };
  httpServer.once("listening", () => {
    setImmediate(() => {
      const url = server.resolvedUrls?.local[0];
      if (url === undefined) return;
      entry = `${key}=${url}`;
      writePorts([...readPorts().filter((line) => !line.startsWith(`${key}=`)), entry]);
    });
  });
  httpServer.once("close", clear);
  process.once("exit", clear);
  for (const signal of ["SIGINT", "SIGTERM"] as const)
    process.once(signal, () => {
      clear();
      process.kill(process.pid, signal);
    });
}

function devPorts(): Plugin {
  return {
    name: "dev-ports",
    configureServer: (server) => recordUrl("WEB_DEV_URL", server),
    configurePreviewServer: (server) => recordUrl("WEB_PREVIEW_URL", server),
  };
}

export default defineConfig({
  base: "/yugioh-rulings-chatbot/",
  plugins: [devPorts()],
  server: { host },
  preview: { host },
});
