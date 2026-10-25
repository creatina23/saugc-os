// Remove campos gerenciados de payloads UPDATE. Isto nao substitui RLS/grants.
export function camposParaAtualizacao<T extends object>(registro: T): Omit<T, "id" | "user_id" | "created_at"> {
  const campos = { ...registro };
  Reflect.deleteProperty(campos, "id");
  Reflect.deleteProperty(campos, "user_id");
  Reflect.deleteProperty(campos, "created_at");
  return campos;
}
