import assert from "node:assert/strict";
import { mock, test } from "node:test";
import { NextRequest } from "next/server.js";
import { loadTypescript } from "./load-typescript.mjs";

for (const url of ["/api/ia", "/api/imagem", "/api/actions/commercials/set-status", "/api/orquestrador"]) {
  test(`proxy deixa ${url} chegar ao gate sem redirect HTML`, async () => {
    const createServerClient = mock.fn(() => { throw new Error("Auth da API pertence ao handler"); });
    const { proxy } = loadTypescript("src/proxy.ts", {
      env: { NEXT_PUBLIC_SUPABASE_URL: "http://127.0.0.1:3199", NEXT_PUBLIC_SUPABASE_ANON_KEY: "ficticia" },
      modules: { "@supabase/ssr": { createServerClient } },
    });
    const response = await proxy(new NextRequest("http://localhost" + url));
    assert.equal(response.headers.get("x-middleware-next"), "1");
    assert.equal(response.headers.get("location"), null);
    assert.equal(createServerClient.mock.callCount(), 0);
  });
}

for (const page of ["/", "/configuracoes", "/ia-studio"]) {
  test(`página protegida ${page} continua redirecionando sem sessão`, async () => {
    const { proxy } = loadTypescript("src/proxy.ts", {
      env: { NEXT_PUBLIC_SUPABASE_URL: "http://127.0.0.1:3199", NEXT_PUBLIC_SUPABASE_ANON_KEY: "ficticia" },
      modules: { "@supabase/ssr": { createServerClient: () => ({ auth: { getUser: async () => ({ data: { user: null }, error: null }) } }) } },
    });
    const response = await proxy(new NextRequest("http://localhost" + page));
    assert.equal(response.status, 307);
    assert.equal(new URL(response.headers.get("location")).pathname, "/login");
  });
}
