import { spawn } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { createServer } from "node:net";
import { dirname } from "node:path";
import { fileURLToPath } from "node:url";

import { z } from "zod";

const host = "127.0.0.1";
const key = "CONVEX_URL";
const firstPort = 3210;
const portsFile = fileURLToPath(new URL("../../../.dev/ports.env", import.meta.url));
const localConfig = fileURLToPath(new URL("../.convex/local/default/config.json", import.meta.url));

function readPorts() {
  if (!existsSync(portsFile)) return [];
  return readFileSync(portsFile, "utf8")
    .split("\n")
    .filter((line) => line !== "");
}

function writePorts(lines: string[]) {
  mkdirSync(dirname(portsFile), { recursive: true });
  writeFileSync(portsFile, lines.map((line) => `${line}\n`).join(""));
}

function isFree(port: number) {
  return new Promise<boolean>((resolve) => {
    const server = createServer();
    server.once("error", () => resolve(false));
    server.listen(port, host, () => server.close(() => resolve(true)));
  });
}

async function freePair() {
  for (let port = firstPort; port < firstPort + 200; port += 2)
    if ((await isFree(port)) && (await isFree(port + 1))) return port;
  throw new Error(`no free port pair from ${firstPort}`);
}

async function answers(url: string) {
  try {
    return (await fetch(`${url}/version`)).ok;
  } catch {
    return false;
  }
}

const savedConfig = z.looseObject({});

function pinSavedPorts(cloud: number) {
  if (!existsSync(localConfig)) return;
  const config = savedConfig.parse(JSON.parse(readFileSync(localConfig, "utf8")));
  writeFileSync(localConfig, JSON.stringify({ ...config, ports: { cloud, site: cloud + 1 } }));
}

const cloudPort = await freePair();
pinSavedPorts(cloudPort);
const url = `http://${host}:${cloudPort}`;
const entry = `${key}=${url}`;

const child = spawn(
  "convex",
  ["dev", "--local-cloud-port", String(cloudPort), "--local-site-port", String(cloudPort + 1)],
  { stdio: "inherit", env: { ...process.env, CONVEX_AGENT_MODE: "anonymous" } },
);

let recorded = false;
const clear = () => {
  if (!recorded) return;
  const lines = readPorts();
  if (lines.includes(entry)) writePorts(lines.filter((line) => line !== entry));
  recorded = false;
};

const poll = setInterval(async () => {
  if (!(await answers(url))) return;
  clearInterval(poll);
  writePorts([...readPorts().filter((line) => !line.startsWith(`${key}=`)), entry]);
  recorded = true;
}, 500);

child.once("exit", (code) => {
  clearInterval(poll);
  clear();
  process.exit(code ?? 0);
});

for (const signal of ["SIGINT", "SIGTERM"] as const) process.on(signal, () => child.kill("SIGINT"));
