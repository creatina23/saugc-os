// Camada de serviços — módulo CONFIGURAÇÕES.
// Reúne workspaces, abas de configuração e itens de navegação do menu.

import { navItems, settingsTabs, workspaces } from "@/lib/mock-data";

export const configuracoesService = {
  /** Lista os workspaces disponíveis. */
  getWorkspaces: (): typeof workspaces => workspaces,

  /** Busca um workspace pelo id (ex.: "studio"). */
  getWorkspaceById: (id: string) =>
    workspaces.find((workspace) => workspace.id === id),

  /** Lista as abas da página de Configurações. */
  getSettingsTabs: (): typeof settingsTabs => settingsTabs,

  /** Lista os itens de navegação do menu lateral. */
  getNavItems: (): typeof navItems => navItems,
};