// ============================================================
// SAUGC OS — Camada de Serviços
// ------------------------------------------------------------
// Porta de entrada oficial para TODOS os dados do sistema.
//
// Hoje: os services leem dos mocks (src/lib/mock-data.ts).
// Futuro: quando o Supabase entrar, só os arquivos *.service.ts
// mudam — as telas continuam importando daqui, sem alteração.
//
// Uso:  import { clientesService } from "@/lib/services";
//       const clientes = clientesService.list();
// ============================================================

export { clientesService } from "./clientes.service";
export { campanhasService } from "./campanhas.service";
export { briefingsService } from "./briefings.service";
export { comerciaisService, commercialStatusOrder } from "./comerciais.service";
export { assetsService } from "./assets.service";
export { bibliotecaService } from "./biblioteca.service";
export { promptsService } from "./prompts.service";
export { iaService } from "./ia.service";
export { configuracoesService } from "./configuracoes.service";
export { dashboardService } from "./dashboard.service";
export { crmService, dealStageOrder } from "./crm.service";
export { notificacoesService } from "./notificacoes.service";