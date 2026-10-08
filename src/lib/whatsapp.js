// Mensagem e link wa.me. Nada vai para servidor: o texto abre no WhatsApp da pessoa.
// Nenhum componente escreve "wa.me" na mão: tudo passa por aqui. Número pendente → url = null (nenhum href falso).
import { SITE } from '@/config/site.js'
import { whatsappValido } from '@/config/pendencias-build.js'
import { formatarTelefone } from './telefone.js'

// toWellFormed: substituto UTF-16 solto (colado de outro app) faria o encodeURIComponent lançar URIError.
export const limpar = (v) => {
  const s = String(v ?? '')
  return (s.toWellFormed ? s.toWellFormed() : s).replace(/\s+/g, ' ').trim()
}

const CABECALHO = {
  PEDIDO: '[PEDIDO] Quero receber fornada',
  PRODUTOR: '[PRODUTOR] Quero entrar na rede',
}
const RODAPE = 'Enviado pelo site'

const lista = (itens = [], qual = '') =>
  itens.map(limpar).filter(Boolean).map((i) => (i === 'Outro' && limpar(qual) ? `Outro: ${limpar(qual)}` : i)).join(', ')
const juntar = (...partes) => partes.map(limpar).filter(Boolean).join(', ')

/** Pares [rótulo, valor] do modelo da mensagem, na ordem em que aparecem. */
const MODELOS = {
  PEDIDO: (c) => [
    ['Responsável', c.nome],
    ['Comércio', c.comercio],
    ['Tipo', c.tipo === 'Outro' && limpar(c.qual) ? `Outro: ${limpar(c.qual)}` : c.tipo],
    ['Bairro/cidade', juntar(c.bairro, c.cidade)],
    ['Produtos', lista(c.produtos)],
    ['Frequência', c.frequencia],
    ['Quantidade por entrega', c.quantidade], // opcional: some quando vazio
    ['WhatsApp', c.whatsapp ? formatarTelefone(c.whatsapp) : ''],
  ],
  PRODUTOR: (c) => [
    ['Regularização sanitária', c.regularizacao], // 2ª linha de propósito: é a primeira coisa que a Fornada lê
    ['Responsável', c.nome],
    ['Negócio', c.negocio],
    ['CNPJ', limpar(c.cnpj) || 'não informado'],
    ['Bairro/cidade', juntar(c.bairro, c.cidade)],
    ['Produz', lista(c.produz, c.qual)],
    ['Capacidade por dia', c.capacidade],
    ['WhatsApp', c.whatsapp ? formatarTelefone(c.whatsapp) : ''],
  ],
}

/** Texto da mensagem: linhas unidas por \n, sem linha vazia, sem "Rótulo: " sem valor. */
export function montarTexto(tipo, campos = {}) {
  if (!MODELOS[tipo]) throw new Error(`[whatsapp] tipo inválido: ${tipo}`)
  const linhas = MODELOS[tipo](campos)
    .map(([r, v]) => [r, limpar(v)])
    .filter(([, v]) => v)
    .map(([r, v]) => `${r}: ${v}`)
  return [CABECALHO[tipo], ...linhas, RODAPE].join('\n')
}

export const urlWhatsApp = (numero, texto) => `https://wa.me/${numero}?text=${encodeURIComponent(texto)}`

/** Formulários: `{ texto, url, pendente }`. Sem corte de texto: os maxlength dos campos garantem URL ≤ 2000. */
export function montarMensagemWhatsApp(tipo, campos, numero = SITE.whatsapp) {
  const texto = montarTexto(tipo, campos)
  const pendente = !whatsappValido(numero)
  return { texto, url: pendente ? null : urlWhatsApp(numero, texto), pendente }
}

/** Atalhos (botão fixo, "Pedir orçamento"…): texto pronto de data/atalhosWhatsapp.js. */
export function linkWhatsApp(texto, numero = SITE.whatsapp) {
  const t = limpar(texto)
  const pendente = !whatsappValido(numero)
  return { texto: t, url: pendente ? null : urlWhatsApp(numero, t), pendente }
}

/**
 * 5511912345678 → (11) 91234-5678 (número da empresa, para "Depois é só colar no WhatsApp da Fornada: …").
 * Sem a normalização do campo do usuário (que tira zero do DDD): o número da empresa já vem no formato 55 + DDD.
 */
export function formatarNumeroEmpresa(numero = SITE.whatsapp) {
  if (!whatsappValido(numero)) return ''
  const m = String(numero).slice(2).match(/^(\d{2})(\d{4,5})(\d{4})$/)
  return m ? `(${m[1]}) ${m[2]}-${m[3]}` : ''
}

/**
 * Abre a conversa na MESMA pilha do clique (sem await/setTimeout antes — senão o bloqueador engole a janela).
 * Com noopener o retorno é sempre null: não há como detectar bloqueio,
 * por isso o estado de sucesso sempre oferece "Abrir o WhatsApp de novo" e "Copiar mensagem".
 */
export function abrirWhatsApp(url) {
  if (!url) return false
  window.open(url, '_blank', 'noopener,noreferrer')
  return true
}
