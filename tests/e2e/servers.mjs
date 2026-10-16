import { spawn } from "node:child_process";
import { existsSync, readdirSync } from "node:fs";
import { createServer } from "node:http";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "../..");
if (!existsSync(path.join(root, ".next/BUILD_ID"))) throw new Error("Execute npm run build -- --webpack antes dos testes E2E.");
// Não deixa o Next carregar arquivos de configuração que possam conter segredos.
if (readdirSync(root).some((name) => /^\.env(?:\.|$)/.test(name))) {
  throw new Error("E2E requer checkout isolado sem arquivos .env; nenhum valor foi lido.");
}

const stats = { auth: 0, data: 0, blocked: 0 };
const ready = new Set();
const user = { id: "11111111-1111-4111-8111-111111111111", aud: "authenticated", role: "authenticated", email: "teste@example.invalid", created_at: "2026-01-01T00:00:00Z", user_metadata: {} };
const auth = createServer((req, res) => {
  res.setHeader("Content-Type", "application/json");
  if (req.url === "/__ready") { res.statusCode = ready.size === 2 ? 200 : 503; return res.end("{}"); }
  if (req.url === "/__stats") return res.end(JSON.stringify(stats));
  if (req.url?.startsWith("/auth/v1/user")) {
    stats.auth++;
    let mode;
    try { mode = JSON.parse(Buffer.from((req.headers.authorization ?? "").split(".")[1], "base64url").toString()).test_mode; } catch { mode = "invalid"; }
    if (mode === "valid") return res.end(JSON.stringify(user));
    res.statusCode = mode === "unavailable" ? 500 : 401;
    return res.end(JSON.stringify({ message: "Resposta sintética de autenticação", code: mode === "unavailable" ? "unexpected_failure" : "bad_jwt" }));
  }
  stats.data++;
  res.statusCode = 500;
  res.end(JSON.stringify({ message: "Nenhum acesso a dados é permitido nesta suíte" }));
});

const children = [];
function stop() { for (const child of children) child.kill("SIGTERM"); auth.close(() => process.exit(0)); }
process.on("SIGTERM", stop);
process.on("SIGINT", stop);
auth.listen(3199, "127.0.0.1", () => {
  for (const [mode, port] of [["absent", 3187], ["configured", 3188]]) {
    const child = spawn(process.execPath, ["--require", path.join(root, "tests/e2e/network-guard.cjs"), path.join(root, "node_modules/next/dist/bin/next"), "start", "--hostname", "127.0.0.1", "--port", String(port)], {
      cwd: root,
      env: {
        PATH: process.env.PATH, NODE_ENV: "production", NEXT_TELEMETRY_DISABLED: "1",
        NEXT_PUBLIC_SUPABASE_URL: mode === "configured" ? "http://127.0.0.1:3199" : "",
        NEXT_PUBLIC_SUPABASE_ANON_KEY: mode === "configured" ? "chave-ficticia-sem-valor-real" : "",
      },
      stdio: ["ignore", "pipe", "pipe", "ipc"],
    });
    children.push(child);
    child.stdout.on("data", (chunk) => { if (chunk.toString().includes("Ready")) ready.add(mode); });
    child.stderr.on("data", (chunk) => process.stderr.write(chunk));
    child.on("message", (message) => { if (message?.type === "blocked-external-request") stats.blocked++; });
    child.on("error", () => { console.error("Falha ao iniciar servidor E2E local"); stop(); });
    child.on("exit", (code) => { if (code) { console.error("Servidor E2E encerrou com falha"); stop(); } });
  }
});
