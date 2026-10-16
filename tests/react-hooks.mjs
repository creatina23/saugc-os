import * as React from "react";

/** Harness de efeitos para testar sincronização sem navegador ou serviços reais. */
export function hooks() {
  const effects = [], layouts = [], updates = [], states = [], refs = [];
  let cursor = 0, refCursor = 0;
  return {
    effects, layouts, updates,
    render(component) { cursor = 0; refCursor = 0; return component(); },
    react: {
      ...React,
      useEffect: (fn) => effects.push(fn),
      useLayoutEffect: (fn) => layouts.push(fn),
      useCallback: (fn) => fn,
      useMemo: (fn) => fn(),
      useId: () => "id-teste",
      useRef: (current) => { const slot = refCursor++; return refs[slot] ?? (refs[slot] = { current }); },
      useState(initial) {
        const slot = cursor++;
        if (slot >= states.length) states.push(typeof initial === "function" ? initial() : initial);
        return [states[slot], (value) => { states[slot] = typeof value === "function" ? value(states[slot]) : value; updates.push(states[slot]); }];
      },
    },
  };
}
