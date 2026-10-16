import { test as base, expect } from "@playwright/test";

export const test = base.extend<{ noExternalRequests: void }>({
  noExternalRequests: [async ({ context }, use) => {
    const attempts: string[] = [];
    await context.route("**/*", (route) => {
      const url = new URL(route.request().url());
      if (["http://127.0.0.1:3187", "http://127.0.0.1:3188"].includes(url.origin) || url.protocol === "data:") return route.continue();
      attempts.push(url.origin);
      return route.abort();
    });
    await use();
    expect(attempts, "nenhuma requisição externa da página").toEqual([]);
  }, { auto: true }],
});
export { expect };

export function sessionCookie(mode: "valid" | "invalid" | "unavailable") {
  const exp = Math.floor(Date.now() / 1000) + 3600;
  const part = (value: object) => Buffer.from(JSON.stringify(value)).toString("base64url");
  const token = `${part({ alg: "HS256", typ: "JWT" })}.${part({ sub: "11111111-1111-4111-8111-111111111111", aud: "authenticated", role: "authenticated", exp, test_mode: mode })}.assinatura-ficticia`;
  return {
    name: "sb-127-auth-token",
    value: "base64-" + Buffer.from(JSON.stringify({ access_token: token, refresh_token: "refresh-ficticio", expires_at: exp, token_type: "bearer", user: { id: "nao-confiar-no-cookie" } })).toString("base64url"),
    domain: "127.0.0.1", path: "/",
  };
}
