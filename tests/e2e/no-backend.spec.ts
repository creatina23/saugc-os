import { test, expect } from "./fixtures";

for (const endpoint of ["/api/ia", "/api/imagem", "/api/actions/commercials/set-status", "/api/orquestrador"]) {
  for (const method of endpoint === "/api/ia" || endpoint === "/api/imagem" ? ["GET", "POST"] : ["POST"]) {
    test(`${method} ${endpoint}: backend ausente prevalece sobre sessão e JSON inválido`, async ({ request }) => {
      const before = await (await request.get("http://127.0.0.1:3199/__stats")).json();
      const response = await request.fetch(endpoint, { method, maxRedirects: 0, ...(method === "POST" ? { data: "JSON inválido", headers: { "Content-Type": "application/json" } } : {}) });
      expect(response.status()).toBe(503);
      expect(response.headers()["content-type"]).toContain("application/json");
      expect(response.headers().location).toBeUndefined();
      expect(typeof (await response.json()).erro).toBe("string");
      const after = await (await request.get("http://127.0.0.1:3199/__stats")).json();
      expect(after).toEqual(before);
    });
  }
}

test("limpeza exige confirmação, não lê/exibe segredos e não finge limpeza remota", async ({ page }) => {
  await page.goto("/configuracoes", { waitUntil: "networkidle" });
  const skip = page.getByRole("button", { name: "Pular tour", exact: true });
  if (await skip.isVisible()) await skip.click();
  await page.evaluate(() => localStorage.setItem("anuncia_api_keys", "MARCADOR_FICTICIO"));
  await page.reload({ waitUntil: "networkidle" });
  expect(await page.evaluate(() => localStorage.getItem("anuncia_api_keys"))).toBe("MARCADOR_FICTICIO");
  await page.getByRole("tab", { name: "Integrações API", exact: true }).click();
  await expect(page.locator("body")).not.toContainText("MARCADOR_FICTICIO");
  expect(await page.locator("input[type=password]").count()).toBe(0);
  const button = page.getByRole("button", { name: "Revisar e confirmar limpeza da conta" });
  page.once("dialog", (dialog) => dialog.dismiss());
  await button.click();
  expect(await page.evaluate(() => localStorage.getItem("anuncia_api_keys"))).toBe("MARCADOR_FICTICIO");
  page.once("dialog", (dialog) => dialog.accept());
  await button.click();
  expect(await page.evaluate(() => localStorage.getItem("anuncia_api_keys"))).toBeNull();
  await expect(page.locator("body")).not.toContainText("campo de credenciais da sua conta foi neutralizado");
});
