// Guia Vivo — textos do painel "Como usar esta tela" (botão no topo das páginas).
// ------------------------------------------------------------------
// Conteúdo 100% PT-BR (Lei da Língua). Cada rota tem: resumo de 1 linha +
// passos numerados na ordem em que a pessoa usa a tela na vida real.
// Aqui moram SÓ os textos — quem desenha o painel é o components/layout/guia.tsx.

export type PassoGuia = {
  titulo: string;
  texto: string;
};

export type GuiaDaPagina = {
  pagina: string;
  resumo: string;
  passos: PassoGuia[];
};

const guiaDashboard: GuiaDaPagina = {
  pagina: "Dashboard",
  resumo: "Sua central de comando: os números reais da operação, lidos do banco na hora.",
  passos: [
    {
      titulo: "Os 4 cartões do topo",
      texto:
        "Receita do mês (soma dos planos mensais dos clientes), total de Conversões, Campanhas ativas e ROI médio. Nada aqui é decorativo: tudo é conta feita no seu banco de dados na hora.",
    },
    {
      titulo: "Receita por cliente",
      texto:
        "As barras mostram quem sustenta o seu mês (os 6 maiores planos). Cliente sumiu do gráfico? O plano mensal dele está zerado no cadastro.",
    },
    {
      titulo: "Desempenho por canal",
      texto:
        "Investimento e conversões agrupados por rede. Serve pra enxergar em 5 segundos onde o dinheiro está trabalhando melhor.",
    },
    {
      titulo: "Funil de negócios",
      texto:
        "Vem direto do CRM: quantos negócios estão abertos, em quais etapas e o ticket médio. Fechou contrato? Ele sai daqui sozinho.",
    },
    {
      titulo: "Atividades recentes",
      texto:
        "Clientes e campanhas recém-criados, em ordem de chegada. Sua conferência rápida do dia.",
    },
    {
      titulo: "Botões de ação",
      texto:
        "Use os atalhos no topo da página pra criar campanha ou gerar algo com IA sem caçar no menu.",
    },
  ],
};

const guiaClientes: GuiaDaPagina = {
  pagina: "Clientes",
  resumo: "Sua carteira de clientes: quem paga, quanto paga e em que momento está.",
  passos: [
    {
      titulo: "Cadastrar",
      texto:
        "Botão “Novo Cliente”: nome, empresa, contato e plano mensal. O valor do plano alimenta a “Receita do mês” do Dashboard automaticamente.",
    },
    {
      titulo: "Cartões de resumo",
      texto: "Os totais da carteira ficam sempre visíveis no topo da página.",
    },
    {
      titulo: "Buscar e filtrar",
      texto:
        "Busque por nome ou empresa e filtre por status. A lista responde na hora, sem botão de procurar.",
    },
    {
      titulo: "Editar",
      texto:
        "Abra o cliente pra corrigir dados e manter o plano mensal sempre em dia.",
    },
    {
      titulo: "Excluir com respeito",
      texto:
        "A lixeira pede confirmação (“essa ação não tem volta”) e apaga de verdade do banco — some da tela na hora.",
    },
  ],
};

const guiaCampanhas: GuiaDaPagina = {
  pagina: "Campanhas",
  resumo: "Cada campanha com as métricas no DNA — e um diretor de IA lendo os números com você.",
  passos: [
    {
      titulo: "Criar campanha",
      texto:
        "“Nova Campanha”: nome, cliente, rede, orçamento e estágio. Salvou, já está valendo no seu painel.",
    },
    {
      titulo: "Lançar os números",
      texto:
        "Investido, impressões, cliques, conversões e receita. O CTR sai sozinho; a meta de ROAS liga o semáforo (verde = meta batida).",
    },
    {
      titulo: "Diretor de Tráfego IA",
      texto:
        "O botão de análise: ele lê as métricas da campanha e devolve diagnóstico, semáforo e as 3 ações de hoje. É o cérebro do AnuncIA trabalhando.",
    },
    {
      titulo: "Guardar o relatório",
      texto:
        "“Salvar relatório na Biblioteca” transforma a análise em documento permanente — histórico de decisões do cliente.",
    },
    {
      titulo: "Rotina profissional",
      texto:
        "Atualize os números 1 vez ao dia. O Dashboard e o Diretor leem sempre o retrato mais novo.",
    },
  ],
};

const guiaBriefings: GuiaDaPagina = {
  pagina: "Briefings",
  resumo: "O pedido do anúncio, organizado — é aqui que o roteiro nasce.",
  passos: [
    {
      titulo: "Novo briefing",
      texto:
        "Título, cliente, criador, etiquetas, prazo e — o mais importante — os detalhes do pedido: produto, público e promessa.",
    },
    {
      titulo: "Detalhe rico = roteiro bom",
      texto:
        "Quanto mais contexto nos detalhes, melhor a IA trabalha no próximo passo.",
    },
    {
      titulo: "✨ Roteirista IA",
      texto:
        "Ele lê o briefing inteiro e entrega um roteiro em cenas, pronto pra produzir e editável na hora.",
    },
    {
      titulo: "Mandar pro quadro",
      texto:
        "“Salvar como criativo no quadro” grava o roteiro em Comerciais como cartão novo — a produção começa lá.",
    },
    {
      titulo: "Acompanhar",
      texto:
        "Cada briefing tem código próprio (BRF-0000), status e prazo por extenso.",
    },
  ],
};

const guiaComerciais: GuiaDaPagina = {
  pagina: "Comerciais",
  resumo: "O quadro de produção: do rascunho ao anúncio aprovado.",
  passos: [
    {
      titulo: "As 4 colunas",
      texto:
        "Rascunho → Produção → Revisão → Aprovado. Cada cartão é um anúncio em andamento.",
    },
    {
      titulo: "Mover de etapa",
      texto:
        "As setas ‹ › empurram o cartão pra frente ou pra trás — e a mudança grava sozinha no banco.",
    },
    {
      titulo: "Editar",
      texto:
        "Clique no cartão pra abrir roteiro, formato, prazo e responsável.",
    },
    {
      titulo: "De onde nascem os cartões",
      texto:
        "Dois caminhos: pelo Briefing (o Roteirista IA salva aqui) ou criando manualmente.",
    },
  ],
};

const guiaCrm: GuiaDaPagina = {
  pagina: "Funil de Vendas (CRM)",
  resumo: "Cada oportunidade andando de etapa até o contrato fechado.",
  passos: [
    {
      titulo: "Novo negócio",
      texto:
        "Nome, empresa, valor estimado, chance de fechar e responsável. Ele nasce na primeira etapa, “Qualificação”.",
    },
    {
      titulo: "Os 4 medidores",
      texto:
        "Total no funil, Previsão de Ganhos (valor × chance), negócios em aberto e ticket médio. Passe o mouse em cada cartão pra ver a conta.",
    },
    {
      titulo: "Andar com o negócio",
      texto:
        "As setas ← → mudam a etapa e gravam sozinhas. Marcou reunião? Avança. Esfriou? Volta.",
    },
    {
      titulo: "A chance manda na previsão",
      texto:
        "Atualize a porcentagem conforme a conversa esquenta; a Previsão de Ganhos reflete na hora.",
    },
    {
      titulo: "No celular",
      texto:
        "O funil vira um trilho: deslize pro lado e cada etapa trava na tela.",
    },
  ],
};

const guiaMidias: GuiaDaPagina = {
  pagina: "Mídias",
  resumo: "Sua biblioteca de arquivos de produção, guardada na sua nuvem privada.",
  passos: [
    {
      titulo: "Enviar",
      texto:
        "“Enviar Mídia”: vídeos e imagens de até 50 MB. O arquivo cai na SUA pasta privada — ninguém mais enxerga.",
    },
    {
      titulo: "Organizar",
      texto:
        "Categoria (anúncios em vídeo, hooks, cenas de apoio, fotos de produto), etiquetas separadas por vírgula e o cliente dono do material.",
    },
    {
      titulo: "Achar",
      texto:
        "Busque por nome, cliente ou etiqueta; os filtros de categoria já mostram a contagem.",
    },
    {
      titulo: "Baixar com segurança",
      texto:
        "“Baixar arquivo” gera um link temporário (vence em minutos) direto da sua pasta.",
    },
    {
      titulo: "Excluir",
      texto:
        "A lixeira apaga o arquivo da nuvem e o registro da tela. Não tem volta.",
    },
  ],
};

const guiaBiblioteca: GuiaDaPagina = {
  pagina: "Biblioteca",
  resumo: "O baú permanente da equipe: tudo que presta, guardado e pronto pra reuso.",
  passos: [
    {
      titulo: "O que mora aqui",
      texto:
        "Hooks, modelos de roteiro e guias — escritos por você ou presentes da IA.",
    },
    {
      titulo: "As abas",
      texto:
        "O conteúdo fica organizado por categoria: hooks de anúncio, modelos de roteiro, guias do criador e guias de estratégia.",
    },
    {
      titulo: "Chega de 3 jeitos",
      texto:
        "Criado manualmente, salvo pelo IA Studio ou gravado pelo Diretor de Tráfego (relatórios de campanha).",
    },
    {
      titulo: "Usar de novo",
      texto:
        "Abra o item, veja o conteúdo completo e clique em Copiar. Um bom hook serve pra 10 clientes.",
    },
  ],
};

const guiaPrompts: GuiaDaPagina = {
  pagina: "Prompts",
  resumo: "Suas receitas de comando prontas pra IA — com variáveis de encaixe.",
  passos: [
    {
      titulo: "Novo comando",
      texto:
        "“Novo Prompt”: escreva a receita e marque as partes variáveis {assim}. Elas aparecem destacadas.",
    },
    {
      titulo: "Copiar e usar",
      texto:
        "O botão Copiar leva o texto inteiro pronto pra colar em qualquer IA.",
    },
    {
      titulo: "Organizar",
      texto:
        "Edite no próprio cartão e filtre por modelo (Gemini e os futuros motores).",
    },
    {
      titulo: "Boa prática",
      texto:
        "Comando bom = contexto + tarefa + formato de saída. Salvou um que funcionou? Ele fica aqui te esperando.",
    },
  ],
};

const guiaIaStudio: GuiaDaPagina = {
  pagina: "IA Studio",
  resumo: "O parquinho dos agentes: 5 especialistas trabalhando com o motor real de IA.",
  passos: [
    {
      titulo: "Escolha o especialista",
      texto:
        "Estratégia, textos de anúncio, roteiros com criadores, comandos para imagem e vídeo, análise de criativos. Cada um pensa do seu jeito.",
    },
    {
      titulo: "Descreva a tarefa",
      texto:
        "Contexto é ouro: diga cliente, produto, público e o que você quer de saída.",
    },
    {
      titulo: "Afine os controles",
      texto:
        "Temperatura: 0 = mais certeira, 1 = mais criativa. Máx. de tokens: roteiro longo? Aumente pra não cortar no meio.",
    },
    {
      titulo: "Gerar resposta",
      texto:
        "A saída é 100% real, escrita na hora pelo motor conectado (Gemini de fábrica).",
    },
    {
      titulo: "Não perca o ouro",
      texto:
        "O histórico vive só nesta sessão. Gostou do resultado? “Salvar na biblioteca” guarda pra sempre.",
    },
  ],
};

const guiaConfiguracoes: GuiaDaPagina = {
  pagina: "Configurações",
  resumo: "Sua conta, sua marca e as chaves da casa.",
  passos: [
    {
      titulo: "Perfil",
      texto:
        "Seu nome e sua foto (PNG, JPG ou WebP até 2 MB). A foto aparece na lateral e no topo na hora.",
    },
    {
      titulo: "Geral",
      texto: "O nome do seu espaço de trabalho, como aparece pra você.",
    },
    {
      titulo: "Notificações",
      texto:
        "Os interruptores gravam sozinhos quando você mexe — nada de botão escondido.",
    },
    {
      titulo: "Senha",
      texto: "Troque quando quiser; sua sessão continua valendo.",
    },
    {
      titulo: "Sincero por contrato",
      texto:
        "O que está marcado “Em breve” ainda não existe (equipe, faturamento, integrações). Quando chegar, chega funcionando.",
    },
  ],
};

// Ordem = menu. O Dashboard ("/") tem tratamento próprio na função guiaDe.
export const guiasPorRota: { prefixo: string; guia: GuiaDaPagina }[] = [
  { prefixo: "/clientes", guia: guiaClientes },
  { prefixo: "/campanhas", guia: guiaCampanhas },
  { prefixo: "/briefings", guia: guiaBriefings },
  { prefixo: "/comerciais", guia: guiaComerciais },
  { prefixo: "/crm", guia: guiaCrm },
  { prefixo: "/assets", guia: guiaMidias },
  { prefixo: "/biblioteca", guia: guiaBiblioteca },
  { prefixo: "/prompts", guia: guiaPrompts },
  { prefixo: "/ia-studio", guia: guiaIaStudio },
  { prefixo: "/configuracoes", guia: guiaConfiguracoes },
];

// Atalhos que valem no app inteiro — aparecem no rodapé de todos os guias
export const atalhosGerais: string[] = [
  "Ctrl+K abre a busca global: páginas, clientes e tudo mais.",
  "O botão “Novo” no topo cria cliente, campanha ou comando em 1 clique.",
  "“Recolher menu”, na lateral, deixa a tela maior pra trabalhar.",
  "Selo de status no topo: 🟢 Operacional = tudo ligado · 🟠 Modo demonstração = sem banco conectado.",
];

// Descobre o guia certo pro endereço atual; desconhecido = Dashboard
export function guiaDe(caminho: string): GuiaDaPagina {
  if (caminho === "/") return guiaDashboard;
  const entrada = guiasPorRota.find((item) => caminho.startsWith(item.prefixo));
  return entrada?.guia ?? guiaDashboard;
}