import assert from "node:assert/strict";
import { test } from "node:test";
import { setImmediate } from "node:timers/promises";
import { loadTypescript } from "./load-typescript.mjs";
import { hooks } from "./react-hooks.mjs";

function find(node, predicate) {
  if (Array.isArray(node)) return node.map((n) => find(n, predicate)).find(Boolean);
  if (!node?.props) return;
  return predicate(node) ? node : find(node.props.children, predicate);
}

const row = { id: "11111111-1111-4111-8111-111111111111", title: "Negócio sintético", client_name: "Empresa fictícia", value: 100, stage: "Qualificação", probability: 50, owner: "Usuário A" };

for (const scenario of ["leitura-recusada", "rede", "sem-backend"]) {
  test(`CRM carga ${scenario}: distingue erro de demonstração`, async () => {
    const h = hooks();
    let demoCalls = 0;
    const { CrmView } = loadTypescript("src/app/crm/crm-view.tsx", {
      modules: {
        react: h.react,
        "@/lib/services": { crmService: { listDeals: () => { demoCalls++; return []; } }, dealStageOrder: ["Qualificação", "Proposta Enviada", "Negociação", "Contrato Fechado"] },
        "@/lib/supabase/client": { getSupabaseBrowser: () => scenario === "sem-backend" ? null : { from: () => ({ select: () => ({ order: async () => {
          if (scenario === "rede") throw new Error("Rede sintética indisponível");
          return { data: null, error: { code: "42501" } };
        } }) }) } },
      },
      globals: { window: { localStorage: { getItem: () => null } } },
    });
    h.render(CrmView);
    const cleanup = h.effects[0]();
    await setImmediate();
    await setImmediate();
    const tree = h.render(CrmView);
    assert.equal(Boolean(find(tree, (n) => n.props.role === "alert")), scenario !== "sem-backend");
    assert.equal(demoCalls, scenario === "sem-backend" ? 1 : 0);
    cleanup();
  });
}

for (const operation of ["mover", "excluir"]) {
  for (const scenario of ["erro", "zero-linhas", "outra-linha", "estado-divergente", "rede", "sucesso"]) {
    test(`CRM ${operation}: ${scenario} exige confirmação do banco`, async () => {
      const h = hooks();
      let resolve;
      const pending = new Promise((r) => { resolve = r; });
      const calls = [];
      const response = scenario === "erro" ? { data: null, error: { code: "42501" } }
        : { data: scenario === "zero-linhas" ? [] : [{ id: scenario === "outra-linha" ? "outro" : row.id, stage: scenario === "estado-divergente" ? "Qualificação" : "Proposta Enviada" }], error: null };
      const mutation = {
        eq: (column, value) => { calls.push([column, value]); return mutation; },
        select: () => mutation,
        then: (ok, fail) => pending.then(() => {
          if (scenario === "rede") throw new Error("Falha sintética de rede");
          return response;
        }).then(ok, fail),
      };
      const supabase = { from: (table) => {
        assert.equal(table, "deals");
        return {
          select: () => ({ order: async () => ({ data: [row], error: null }) }),
          update: (payload) => { assert.deepEqual(JSON.parse(JSON.stringify(payload)), { stage: "Proposta Enviada" }); return mutation; },
          delete: () => mutation,
        };
      } };
      const { CrmView } = loadTypescript("src/app/crm/crm-view.tsx", {
        modules: { react: h.react, "@/lib/services": { crmService: { listDeals: () => [] }, dealStageOrder: ["Qualificação", "Proposta Enviada", "Negociação", "Contrato Fechado"] }, "@/lib/supabase/client": { getSupabaseBrowser: () => supabase } },
        globals: { window: { localStorage: { getItem: () => null } } },
      });
      h.render(CrmView);
      const cleanup = h.effects[0]();
      await setImmediate();
      h.updates.length = 0;
      const label = `${operation === "mover" ? "Avançar" : "Excluir"} ${row.title}${operation === "mover" ? " uma etapa" : ""}`;
      const button = find(h.render(CrmView), (n) => n.props["aria-label"] === label);
      assert.ok(button);
      button.props.onClick();
      assert.equal(h.updates.filter(Array.isArray).length, 0, "não alterar negócios enquanto o banco está pendente");
      assert.equal(find(h.render(CrmView), (n) => n.props["aria-label"] === label).props.disabled, true);
      button.props.onClick(); // Mesmo handler antigo: trava também deve impedir clique duplicado.
      resolve();
      await setImmediate();
      await setImmediate();
      const accepted = scenario === "sucesso" || (operation === "excluir" && scenario === "estado-divergente");
      const changes = h.updates.filter(Array.isArray);
      assert.equal(changes.length, accepted ? 1 : 0, "somente resposta confirmada altera os negócios");
      assert.deepEqual(calls, [["id", row.id]]);
      const alert = find(h.render(CrmView), (n) => n.props.role === "alert");
      assert.equal(Boolean(alert), !accepted, "falha precisa ficar visível fora do modal");
      if (accepted) {
        assert.equal(changes[0].length, operation === "excluir" ? 0 : 1);
        if (operation === "mover") assert.equal(changes[0][0].stage, "Proposta Enviada");
      }
      cleanup();
    });
  }
}
