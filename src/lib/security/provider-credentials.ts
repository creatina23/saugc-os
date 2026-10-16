import type { SupabaseClient } from "@supabase/supabase-js";

/** Remove a entrada inteira sem getItem, parse, cópia ou leitura de valores. */
export function limparCredenciaisDoNavegador(
  obterStorage: () => Pick<Storage, "removeItem"> = () => window.localStorage
): boolean {
  try {
    obterStorage().removeItem("anuncia_api_keys");
    return true;
  } catch {
    return false;
  }
}

/** Sobrescreve somente o campo legado. Não consulta nem propaga seu conteúdo.
 *  A atualização parcial preserva perfil, workspace e notificações.
 *  Isso não revoga chaves nos provedores nem invalida cópias/sessões anteriores. */
export async function neutralizarCredenciaisDoUsuario(
  auth: Pick<SupabaseClient["auth"], "updateUser">
): Promise<boolean> {
  try {
    const { error } = await auth.updateUser({ data: { api_keys: null } });
    return !error;
  } catch {
    return false;
  }
}
