import assert from "node:assert/strict";
import { test } from "node:test";
import { loadTypescript } from "./load-typescript.mjs";

test("T10: editar preserva conteúdo e não envia identidade nem transfere proprietário", () => {
  const { camposParaAtualizacao } = loadTypescript("src/lib/supabase/editable-fields.ts");
  const original = Object.freeze({ id: "registro-A", user_id: "usuario-A", created_at: "2030-01-01", title: "Novo título", deadline: null, tags: ["MVP"] });
  const changed = camposParaAtualizacao(original);
  assert.deepEqual(Object.keys(changed).sort(), ["deadline", "tags", "title"]);
  assert.equal(changed.title, original.title);
  assert.equal(changed.deadline, null);
  assert.equal(changed.tags, original.tags);
  assert.equal(original.user_id, "usuario-A");
});

test("T10: datas ISO preservam o dia do runtime nas viradas de ano e ano bissexto", () => {
  const { dataIsoDoServidor } = loadTypescript("src/lib/date-only.ts");
  const prior = process.env.TZ;
  try {
    for (const [zone, day] of [["UTC", "2030-01-01"], ["America/Sao_Paulo", "2029-12-31"], ["Asia/Tokyo", "2030-01-01"]]) {
      process.env.TZ = zone;
      assert.equal(dataIsoDoServidor(new Date("2030-01-01T01:00:00Z")), day);
      assert.equal(dataIsoDoServidor(new Date("2028-02-29T12:00:00Z")), "2028-02-29");
    }
    assert.throws(() => dataIsoDoServidor(new Date("invalida")));
    assert.throws(() => dataIsoDoServidor(new Date("+010000-01-01T12:00:00Z")));
    assert.throws(() => dataIsoDoServidor(new Date("0000-01-01T12:00:00Z")));
  } finally {
    if (prior === undefined) delete process.env.TZ;
    else process.env.TZ = prior;
  }
});

test("T10: sete formatos aceitos até 50 MiB; limite mais um byte é recusado", () => {
  const { MIME_MIDIAS, MAX_MIDIA_BYTES, validarMidia } = loadTypescript("src/lib/upload-rules.ts");
  const expected = ["image/png", "image/jpeg", "image/webp", "image/gif", "video/mp4", "video/quicktime", "video/webm"];
  assert.equal([...MIME_MIDIAS].join(","), expected.join(","));
  assert.equal(MAX_MIDIA_BYTES, 52428800);
  for (const type of expected) {
    assert.equal(validarMidia({ type, size: MAX_MIDIA_BYTES }), null);
    assert.equal(validarMidia({ type: type.toUpperCase(), size: 1 }), null);
    assert.ok(validarMidia({ type, size: MAX_MIDIA_BYTES + 1 }));
  }
});

test("T10: formatos ativos e tamanhos inválidos são recusados antes do upload", () => {
  const { validarMidia } = loadTypescript("src/lib/upload-rules.ts");
  for (const type of ["", "image/svg+xml", "text/html", "application/javascript", "application/pdf", "image/avif"]) {
    assert.ok(validarMidia({ type, size: 1 }));
  }
  for (const size of [-1, NaN, Infinity, 0.5, Number.MAX_SAFE_INTEGER + 1]) {
    assert.ok(validarMidia({ type: "image/png", size }));
  }
});
