import { test, expect, sessionCookie } from "./fixtures";

for (const endpoint of ["/api/ia", "/api/imagem", "/api/actions/commercials/set-status", "/api/orquestrador"]) {
  for (const mode of ["missing", "invalid", "unavailable"] as const) {
    test(`${endpoint}: ${mode} → ${mode === "unavailable" ? 503 : 401} JSON antes do payload`, async ({ context }) => {
      if (mode !== "missing") await context.addCookies([sessionCookie(mode)]);
      const before = await (await context.request.get("http://127.0.0.1:3199/__stats")).json();
      const response = await context.request.post(endpoint, { data: "JSON inválido", headers: { "Content-Type": "application/json" }, maxRedirects: 0 });
      expect(response.status()).toBe(mode === "unavailable" ? 503 : 401);
      expect(response.headers()["content-type"]).toContain("application/json");
      expect(response.headers().location).toBeUndefined();
      expect(typeof (await response.json()).erro).toBe("string");
      const after = await (await context.request.get("http://127.0.0.1:3199/__stats")).json();
      expect(after.data).toBe(before.data);
      expect(after.blocked).toBe(0);
      if (mode === "missing") expect(after.auth).toBe(before.auth);
      else expect(after.auth).toBeGreaterThan(before.auth);
    });
  }
}

for (const endpoint of ["/api/ia", "/api/imagem"]) {
  test(`GET ${endpoint}: sem sessão não redireciona`, async ({ context }) => {
    const response = await context.request.get(endpoint, { maxRedirects: 0 });
    expect(response.status()).toBe(401);
    expect(typeof (await response.json()).erro).toBe("string");
  });
  test(`GET ${endpoint}: sessão validada pelo serviço permite apenas status`, async ({ context }) => {
    await context.addCookies([sessionCookie("valid")]);
    const response = await context.request.get(endpoint);
    expect(response.status()).toBe(200);
    for (const motor of (await response.json()).motores) {
      expect(Object.keys(motor).sort()).toEqual(["armado", "id"]);
      expect(motor.armado).toBe(false);
    }
  });
}

test("sessão válida chega à validação do payload sem executar provedores", async ({ context }) => {
  await context.addCookies([sessionCookie("valid")]);
  for (const endpoint of ["/api/ia", "/api/imagem", "/api/actions/commercials/set-status"]) {
    const response = await context.request.post(endpoint, { data: "JSON inválido", headers: { "Content-Type": "application/json" } });
    expect(response.status()).toBe(400);
  }
  const stats = await (await context.request.get("http://127.0.0.1:3199/__stats")).json();
  expect(stats.data).toBe(0);
  expect(stats.blocked).toBe(0);
});

for (const pathname of ["/", "/configuracoes", "/ia-studio"]) {
  test(`HTML ${pathname}: sem sessão mantém redirect para login`, async ({ context }) => {
    const response = await context.request.get(pathname, { maxRedirects: 0 });
    expect(response.status()).toBe(307);
    expect(response.headers().location).toMatch(/\/login$/);
  });
}
