// Portão de produção. JS puro, sem import de node: o vite.config usa no build,
// e o site.js usa em dev para listar no console (verificarPendencias). Detecção por FORMATO, nunca comparando com o
// literal da sentinela: quando o cliente mandar os dados, o literal some do src e do dist.

export const WHATSAPP_RE = /^55\d{10,11}$/
export const EMAIL_RE = /^[^@\s]+@[^@\s]+\.[^@\s]+$/
export const DATA_RE = /^\d{4}-\d{2}-\d{2}$/
// O que não pode existir no dist de produção: a sentinela de contato em
// MAIÚSCULAS exatas (55PREENCHER, e-mail PREENCHER) e todo marcador que abre colchete — "[a preencher]" e os do
// texto legal verbatim: "[a preencher na publicação]", "[a preencher: nome do provedor]", "[a preencher com o
// cliente: …]". Sem flag `i`: o botão "Preencher o cadastro" é texto legítimo e não pode travar a produção.
export const SENTINELA_RE = /PREENCHER|\[a preencher/

export const whatsappValido = (n) => WHATSAPP_RE.test(String(n ?? ''))
export const emailValido = (e) => EMAIL_RE.test(String(e ?? ''))
/** AAAA-MM-DD de um dia que existe: 2026-13-45 e 2026-02-30 não passam (o formato sozinho deixava). */
export function dataValida(v) {
  const t = String(v ?? '')
  if (!DATA_RE.test(t)) return false
  const d = new Date(`${t}T00:00:00Z`)
  return !Number.isNaN(d.getTime()) && d.toISOString().slice(0, 10) === t
}

// Cada pendência tem dois textos: o do CLIENTE (a lista da faixa da prévia, que ele aprova) e o TÉCNICO
// (mensagem do portão do build e console de dev: nome do campo, formato).
const PENDENCIAS = [
  { falta: (s) => !whatsappValido(s.whatsapp), cliente: 'Número de WhatsApp da empresa', tecnico: 'WhatsApp da empresa (SITE.whatsapp fora de 55 + DDD + número)' },
  { falta: (s) => !emailValido(s.email), cliente: 'E-mail de contato', tecnico: 'E-mail da empresa (SITE.email fora de nome@dominio.tld) — e-mail também bloqueia' },
  { falta: (s) => !dataValida(s.vigenciaDocs), cliente: 'Data em que a política de privacidade e os termos de uso passam a valer', tecnico: 'Data de vigência da Política e dos Termos (SITE.vigenciaDocs, AAAA-MM-DD)' },
  { falta: (s) => s.docsRevisados !== true, cliente: 'Revisão jurídica da política de privacidade e dos termos de uso', tecnico: 'Revisão jurídica da Política e dos Termos (SITE.docsRevisados = true; a faixa "Minuta" estaria no ar)' },
]

/** O que ainda falta (dado da empresa ou revisão jurídica) para publicar, no texto técnico. [] = pode ir para produção. */
export const listarPendencias = (site) => PENDENCIAS.filter((p) => p.falta(site)).map((p) => p.tecnico)
/** As mesmas pendências no texto de quem aprova a prévia: sem nome de campo nem formato. */
export const listarPendenciasCliente = (site) => PENDENCIAS.filter((p) => p.falta(site)).map((p) => p.cliente)

/** Varre arquivos já lidos ({ nome, conteudo }) e devolve onde a sentinela apareceu. */
export function acharSentinelas(arquivos) {
  const achados = []
  for (const { nome, conteudo } of arquivos) {
    const m = SENTINELA_RE.exec(conteudo)
    if (m) achados.push(`${nome} (…${conteudo.slice(Math.max(0, m.index - 40), m.index + 40).replace(/\s+/g, ' ')}…)`)
  }
  return achados
}

export const mensagemPortao = (falta) =>
  `Contato pendente: build de produção bloqueado.\n - ${falta.join('\n - ')}\n` +
  'Para a prévia: npm run build:previa (faixa "Prévia" e pendências à vista; sem portão).'
