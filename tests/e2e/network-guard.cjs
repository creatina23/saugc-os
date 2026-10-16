// Somente para o processo Next iniciado pela suíte E2E. Nunca é importado pelo app.
const originalFetch = globalThis.fetch;
globalThis.fetch = (input, options) => {
  const raw = typeof input === "string" || input instanceof URL ? input : input.url;
  const url = new URL(raw);
  if (url.origin !== "http://127.0.0.1:3199") {
    if (process.send) process.send({ type: "blocked-external-request" });
    return Promise.reject(new Error("Requisição externa bloqueada no ambiente E2E"));
  }
  return originalFetch(input, options);
};
