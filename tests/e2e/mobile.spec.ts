import { test, expect } from "./fixtures";

for (const width of [320, 375, 390, 414, 768, 1280]) {
  for (const pathname of ["/", "/configuracoes", "/ia-studio"]) {
    test(`${pathname}: documento contido em ${width}px`, async ({ page }, testInfo) => {
      await page.setViewportSize({ width, height: 900 });
      const errors: string[] = [];
      page.on("pageerror", (error) => errors.push(error.message));
      const response = await page.goto(pathname, { waitUntil: "networkidle" });
      expect(response?.status()).toBe(200);
      const skip = page.getByRole("button", { name: "Pular tour", exact: true });
      if (await skip.isVisible()) await skip.click();
      await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
      const metrics = await page.evaluate(() => ({
        viewport: innerWidth, document: document.documentElement.scrollWidth,
        body: document.body.scrollWidth,
      }));
      await testInfo.attach("larguras.json", { body: JSON.stringify({ pathname, ...metrics }), contentType: "application/json" });
      expect(metrics.document).toBeLessThanOrEqual(width);
      expect(metrics.body).toBeLessThanOrEqual(width);
      expect(errors).toEqual([]);

      if (pathname === "/configuracoes") {
        await page.getByRole("tab", { name: "Geral", exact: true }).focus();
        await page.keyboard.press("End");
        const last = page.getByRole("tab", { name: "Integrações API", exact: true });
        await expect(last).toBeFocused();
        await page.keyboard.press("Enter");
        await expect(last).toHaveAttribute("aria-selected", "true");
        await expect(page.getByRole("button", { name: "Revisar e confirmar limpeza da conta" })).toBeVisible();
        expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(width);
      }
      if (pathname === "/ia-studio") {
        await page.getByRole("button", { name: "Engenheiro de Prompts Visuais", exact: true }).click();
        expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(width);
      }
      if (width === 1280) await expect(page.getByRole("button", { name: "Recolher menu" })).toBeVisible();
    });
  }
}
