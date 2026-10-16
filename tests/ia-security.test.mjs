import assert from "node:assert/strict";
import { mock, test } from "node:test";
import { loadTypescript } from "./load-typescript.mjs";

const user = { id: "usuario-de-teste" };
const configuredEnv = {
  CLOUDFLARE_ACCOUNT_ID: "conta-ficticia",
  CLOUDFLARE_API_TOKEN: "token-ficticio-apenas-para-teste",
};

function setup(entry, { backend = true, getUser = async () => ({ data: { user }, error: null }), factoryError } = {}) {
  const events = [];
  const getUserMock = mock.fn(async () => {
    events.push("auth");
    return getUser();
  });
  const provider = mock.fn(async () => {
    events.push("provider");
    return { ok: true, texto: "Roteiro de teste", motor: "motor-de-teste" };
  });
  const fetch = mock.fn(async () => {
    events.push("provider");
    return Response.json({ result: { image: "aW1hZ2VtLWRlLXRlc3Rl" } });
  });
  const factory = mock.fn(async () => {
    if (factoryError) throw factoryError;
    return backend ? { auth: { getUser: getUserMock } } : null;
  });
  const route = loadTypescript(entry, {
    env: configuredEnv,
    fetch,
    modules: {
      "@/lib/supabase/server": { getSupabaseServer: factory },
      "@/lib/ia/cadeia-texto": {
        gerarTextoCascata: provider,
        motoresArmados: () => [{ id: "motor-de-teste", armado: true }],
        detalheSanitizadoUltimoErro: () => null,
      },
    },
  });
  return { route, provider, fetch, events, getUserMock, factory };
}

const denied = [
  { name: "auth indisponível prevalece sobre user ausente", options: { getUser: async () => ({ data: { user: null }, error: { status: 500 } }) }, status: 503 },
  { name: "sem sessão", options: { getUser: async () => ({ data: { user: null }, error: null }) }, status: 401 },
  { name: "backend ausente", options: { backend: false }, status: 503 },
  { name: "serviço de autenticação lança exceção", options: { getUser: async () => { throw new Error("detalhe-interno-nao-publicavel"); } }, status: 503 },
  { name: "serviço retorna erro mesmo com objeto user", options: { getUser: async () => ({ data: { user }, error: { status: 500, message: "detalhe-interno-nao-publicavel" } }) }, status: 503 },
  { name: "sessão expirada", options: { getUser: async () => ({ data: { user: null }, error: { status: 401 } }) }, status: 401 },
  { name: "cookie ausente", options: { getUser: async () => ({ data: { user: null }, error: { name: "AuthSessionMissingError", status: 400 } }) }, status: 401 },
  { name: "falha ao criar backend", options: { factoryError: new Error("detalhe-interno-nao-publicavel") }, status: 503 },
];

for (const endpoint of ["ia", "imagem"]) {
  const entry = `src/app/api/${endpoint}/route.ts`;
  for (const method of ["GET", "POST"]) {
    for (const scenario of denied) {
      test(`${method} /api/${endpoint}: ${scenario.name} nega antes de provedores e payload`, async () => {
        const { route, provider, fetch, getUserMock } = setup(entry, scenario.options);
        const json = mock.fn(() => { throw new Error("Não deve ler corpo sem autenticação"); });
        const response = await route[method]({ json });
        assert.equal(response.status, scenario.status);
        const payload = await response.json();
        assert.equal(typeof payload.erro, "string");
        assert.equal(JSON.stringify(payload).includes("detalhe-interno-nao-publicavel"), false);
        assert.equal(provider.mock.callCount(), 0);
        assert.equal(fetch.mock.callCount(), 0);
        assert.equal(json.mock.callCount(), 0);
        if (scenario.options.backend === false) assert.equal(getUserMock.mock.callCount(), 0);
      });
    }
    test(`${method} /api/${endpoint}: sessão válida preserva contrato e autentica antes do provedor`, async () => {
      const { route, provider, fetch, events, getUserMock } = setup(entry);
      const request = new Request(`http://localhost/api/${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: "Um produto em fundo branco" }),
      });
      const response = await route[method](request);
      assert.equal(response.status, 200);
      const payload = await response.json();
      assert.equal(getUserMock.mock.callCount(), 1);
      if (method === "GET") {
        assert.ok(Array.isArray(payload.motores));
        for (const motor of payload.motores) {
          assert.deepEqual(Object.keys(motor).sort(), ["armado", "id"]);
          assert.equal(typeof motor.armado, "boolean");
        }
        assert.equal(provider.mock.callCount(), 0);
        assert.equal(fetch.mock.callCount(), 0);
      } else {
        assert.deepEqual(events, ["auth", "provider"]);
        if (endpoint === "ia") assert.deepEqual(payload, { texto: "Roteiro de teste", motor: "motor-de-teste" });
        else assert.ok(JSON.stringify(payload).includes("aW1hZ2VtLWRlLXRlc3Rl"));
      }
      for (const value of Object.values(configuredEnv)) assert.equal(JSON.stringify(payload).includes(value), false);
    });
  }
}

test("factory real do Supabase sem configuração não lê cookies nem cria cliente", async () => {
  const cookies = mock.fn(() => { throw new Error("Não deve consultar cookies"); });
  const createServerClient = mock.fn(() => { throw new Error("Não deve criar cliente"); });
  const { getSupabaseServer } = loadTypescript("src/lib/supabase/server.ts", {
    modules: { "next/headers": { cookies }, "@supabase/ssr": { createServerClient } },
  });
  assert.equal(await getSupabaseServer(), null);
  assert.equal(cookies.mock.callCount(), 0);
  assert.equal(createServerClient.mock.callCount(), 0);
});

test("gate válido devolve somente a identidade confirmada pelo serviço", async () => {
  const { route: gate, events } = setup("src/lib/actions/gate.ts");
  const result = await gate.verificarSessao();
  assert.equal(result.autorizada, true);
  assert.equal(result.user.id, user.id);
  assert.deepEqual(events, ["auth"]);
});
