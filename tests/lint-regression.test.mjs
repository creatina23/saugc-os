import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { mock, test } from "node:test";
import { setImmediate } from "node:timers/promises";
import { loadTypescript } from "./load-typescript.mjs";
import { hooks } from "./react-hooks.mjs";

for (const scenario of ["real", "vazio", "erro", "ausente"]) {
  test(`Clientes mantém origem e estado após leitura assíncrona: ${scenario}`, async () => {
    const h = hooks();
    const row = { id: "c1", name: "Cliente teste", company: "Empresa teste", email: "teste@example.invalid", phone: "", tier: null, status: null, mrr: "120", logo_initials: null, since: null };
    const result = { data: scenario === "real" ? [row] : [], error: scenario === "erro" ? { message: "Falha simulada" } : null };
    const { ClientesView } = loadTypescript("src/app/clientes/clientes-view.tsx", { modules: {
      react: h.react,
      "@/lib/supabase/client": { getSupabaseBrowser: () => scenario === "ausente" ? null : ({ from: () => ({ select: () => ({ order: async () => result }) }) }) },
    } });
    h.render(ClientesView);
    const cleanup = h.effects[0]();
    assert.equal(h.updates.length, 0, "efeito não atualiza estado antes da leitura");
    await setImmediate();
    assert.ok(h.updates.includes(scenario === "ausente" || scenario === "erro" ? "erro" : "pronto"));
    if (scenario === "real") {
      const clients = h.updates.find(Array.isArray);
      assert.equal(clients[0].mrr, 120);
      assert.equal(clients[0].tier, "Growth");
      assert.equal(clients[0].logoInitials, "CL");
    }
    cleanup();
  });
}

for (const scenario of ["demo", "real", "erro-total", "erro-parcial"]) {
  test(`Dashboard preserva estado da fonte: ${scenario}`, async () => {
    const h = hooks();
    const { DashboardView } = loadTypescript("src/app/dashboard-view.tsx", { modules: {
      react: h.react,
      "@/lib/supabase/client": { getSupabaseBrowser: () => scenario === "demo" ? null : ({ from: (table) => ({ select: async () => ({ data: [], error: scenario === "erro-total" || (scenario === "erro-parcial" && table === "clients") ? { message: "Falha simulada" } : null }) }) }) },
    } });
    h.render(DashboardView);
    const cleanup = h.effects[0]();
    assert.equal(h.updates.length, 0);
    await setImmediate();
    const panel = h.updates.find((v) => v && typeof v === "object" && "estado" in v);
    assert.equal(panel.estado, scenario === "demo" ? "demo" : scenario === "erro-total" ? "erro" : "pronto");
    if (scenario === "erro-parcial") assert.equal(panel.erros.clientes, "Falha simulada");
    cleanup();
  });
}

test("Workspace não sobrescreve seleção feita enquanto a consulta está pendente", async () => {
  const h = hooks(); let resolve;
  const response = new Promise((r) => { resolve = r; });
  const storage = { getItem: () => null, setItem: mock.fn(), removeItem: mock.fn() };
  const { useWorkspaceClient } = loadTypescript("src/lib/workspace-context.ts", {
    modules: { react: h.react, "@/lib/supabase/client": { getSupabaseBrowser: () => ({ from: () => ({ select: () => response }) }) } },
    globals: { localStorage: storage, window: { dispatchEvent() {} }, Event },
  });
  const workspace = h.render(useWorkspaceClient);
  const cleanup = h.effects[0]();
  const selected = { id: "escolhido", name: "Escolhido", company: "Empresa" };
  workspace.selectClient(selected);
  resolve({ data: [{ id: "primeiro", name: "Primeiro", company: null }], error: null });
  await setImmediate();
  assert.equal(h.render(useWorkspaceClient).activeClient.id, "escolhido");
  assert.equal(storage.setItem.mock.callCount(), 1);
  cleanup();
});

test("Workspace recupera seleção local inválida e mantém fallback demonstrativo", async () => {
  const h = hooks();
  const storage = { getItem: () => "{json inválido", setItem: mock.fn() };
  const { useWorkspaceClient } = loadTypescript("src/lib/workspace-context.ts", {
    modules: { react: h.react, "@/lib/supabase/client": { getSupabaseBrowser: () => null } },
    globals: { localStorage: storage, window: {} },
  });
  h.render(useWorkspaceClient); const cleanup = h.effects[0]();
  assert.equal(h.updates.length, 0);
  await setImmediate();
  assert.equal(h.render(useWorkspaceClient).activeClient.id, "c1");
  cleanup();
});

test("serviço de IA preserva erros de rede sem any e fallback para falha desconhecida", async () => {
  for (const thrown of [new Error("Falha simulada"), { message: "Falha simulada" }, null, "erro", {}]) {
    const { iaService } = loadTypescript("src/lib/services/ia-service.ts", { fetch: async () => { throw thrown; } });
    const result = await iaService.gerarTexto("Pedido teste");
    assert.equal(result.ok, false);
    assert.equal(result.erro, thrown && typeof thrown === "object" && "message" in thrown ? "Falha simulada" : "Erro de rede ao acionar a IA. Verifique sua conexão.");
    assert.equal((await iaService.statusMotores()).length, 4);
  }
});

const fixtures = JSON.parse(readFileSync(new URL("./fixtures/epistemico-regression.json", import.meta.url), "utf8"));
for (const fixture of fixtures) {
  test(`guardião mantém resultado anterior à limpeza de código morto: ${fixture.texto}`, () => {
    const guard = loadTypescript("src/lib/orquestrador/epistemico.ts");
    const achados = guard.varrerClaimsMateriais(fixture.texto, fixture.fonte);
    assert.deepEqual(JSON.parse(JSON.stringify(achados)), fixture.achados);
    assert.equal(guard.calcularVereditoEpistemico(achados), fixture.veredito);
  });
}

test("tooltip mede layout ao abrir, limita à viewport e fecha por Escape", () => {
  const h = hooks();
  const { TermoInfo } = loadTypescript("src/components/ui/termo-info.tsx", {
    modules: {
      react: h.react,
      "react-dom": { createPortal: (element) => element },
      "@/lib/glossario": { entradaDoGlossario: () => ({ termo: "ROAS", explicacao: "Explicação de teste" }) },
    },
    globals: {
      window: { innerWidth: 320, innerHeight: 600, addEventListener() {}, removeEventListener() {} },
      document: { body: {}, addEventListener() {}, removeEventListener() {} },
    },
  });
  const render = () => h.render(() => TermoInfo({ slug: "roas" }));
  let tree = render();
  tree.props.ref.current = { getBoundingClientRect: () => ({ left: 290, width: 20, top: 550, bottom: 570 }) };
  h.layouts.at(-1)();
  assert.equal(h.updates.length, 0, "tooltip fechado não força render extra");
  tree.props.onMouseEnter();
  tree = render();
  const cleanup = h.layouts.at(-1)();
  tree = render();
  const panel = tree.props.children[1];
  assert.equal(panel.props.style.left, 52);
  assert.equal(panel.props.style.top, 302);
  tree.props.children[0].props.onKeyDown({ key: "Escape" });
  tree = render();
  assert.equal(tree.props.children[1], false);
  cleanup();
});
