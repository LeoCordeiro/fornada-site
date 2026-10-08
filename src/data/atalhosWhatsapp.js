// Mensagens prontas dos atalhos de WhatsApp. As dos formulários são montadas em lib/whatsapp.js.
// O nome da página fica no texto (está visível para a pessoa antes de enviar e não é dado pessoal).

/** Nome da página para "(página: X)". Chave = path da rota. */
export const NOME_DA_PAGINA = {
  '/': 'Início',
  '/para-comercios': 'Para comércios',
  '/produtos': 'Produtos',
  '/como-funciona': 'Como funciona',
  '/seja-produtor': 'Seja produtor parceiro',
  '/qualidade': 'Qualidade',
  '/sobre': 'Sobre',
  '/contato': 'Contato',
  '/privacidade': 'Política de privacidade',
  '/termos': 'Termos de uso',
  '/repasse': 'Política de repasse e intermediação',
}
export const nomeDaPagina = (path) => NOME_DA_PAGINA[path] ?? 'Página não encontrada'

export const ATALHOS = {
  /** Botão fixo; "Falar no WhatsApp" (Contato, 404) */
  falar: (pagina) => `Olá! Vim pelo site da Fornada Conecta (página: ${pagina}).`,
  /** "Pedir orçamento no WhatsApp" (Home, Produtos) — categoria ativa ou "todas" */
  orcamento: (categoria = 'todas') => `[PEDIDO] Olá! Vi os produtos no site e quero um orçamento. Categoria: ${categoria}.`,
  /** "Perguntar no WhatsApp" (vazio do filtro) */
  categoriaVazia: (categoria) => `[PEDIDO] Olá! Procurei ${categoria} no site e não achei. Vocês têm?`,
  /** "Perguntar sobre a assinatura" (Para comércios) */
  assinatura: () => '[PEDIDO] Olá! Vim pelo site e quero saber da assinatura de fornada.',
  /** "Perguntar no WhatsApp" (fim do FAQ) */
  duvidaFaq: () => 'Olá! Vim pelo site da Fornada Conecta (página: Como funciona) e fiquei com uma dúvida.',
  /** "Avisar pelo WhatsApp" (Qualidade) */
  problemaPedido: () => 'Olá! Quero avisar sobre um problema num pedido.',
  /** "Falar sobre seus dados" (Política) */
  dados: () => 'Olá! Quero falar sobre meus dados pessoais (LGPD).',
}
