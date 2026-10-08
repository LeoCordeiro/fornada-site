// Lê o texto legal (markdown restrito, em texto.js) e devolve o que o DocLegal desenha. O texto passa SEM edição (só
// escapado); muda a forma: estrutura vira HTML. Subconjunto usado pelos documentos e nada além disso:
//   "## n. Título" → seção · parágrafo · **negrito** · [texto](https://…) · lista "- " e "1. " · tabela "| a | b |"
//   parágrafo que é só negrito (subtítulo do documento) → h3 (WCAG 1.3.1: o que funciona como título é título)
//   [Política de Privacidade] / [Termos de Uso] / [Política de Repasse e Intermediação] → link para a página, com o
//   texto em caixa de frase ("Política de privacidade")
//   marcador "[a preencher…]" → continua visível, marcado como pendência (o portão de produção barra o dist com ele)
// Antes da 1ª seção: a linha "**Vigência:** … · **Versão:** n" (cabeçalho) e os parágrafos de abertura (intro).

const ESCAPE = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }
const escapar = (s) => s.replace(/[&<>"]/g, (c) => ESCAPE[c])

const INTERNOS = {
  'Política de Privacidade': { href: '#/privacidade', texto: 'Política de privacidade' },
  'Termos de Uso': { href: '#/termos', texto: 'Termos de uso' },
  'Política de Repasse e Intermediação': { href: '#/repasse', texto: 'Política de repasse e intermediação' },
}
const RE_INTERNO = new RegExp(`\\[(${Object.keys(INTERNOS).join('|')})\\]`, 'g')
// "pre[e]ncher": a regex acha o marcador no texto, mas o código-fonte dela não contém a sequência que a varredura do
// dist de produção procura (closeBundle do vite.config) — senão o próprio leitor travaria a publicação
const RE_PENDENTE = /\[a pre[e]ncher[^\]]*\]/g

/** "2. O que este site faz, e o que não faz" → "o-que-este-site-faz-e-o-que-nao-faz" (id da seção = âncora). */
export const slug = (titulo) =>
  titulo
    .replace(/^\d+\.\s*/, '')
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')

/** Texto de uma linha → HTML inline. O texto legal não tem HTML próprio: tudo é escapado antes. */
export function inline(s) {
  return escapar(s)
    .replace(/\[([^\]]+)\]\((https:\/\/[^)\s]+)\)/g, (_, texto, url) => `<a class="fc-link" href="${url}" target="_blank" rel="noopener noreferrer">${texto}</a>`)
    .replace(RE_INTERNO, (_, k) => `<a class="fc-link" href="${INTERNOS[k].href}">${INTERNOS[k].texto}</a>`)
    .replace(RE_PENDENTE, (m) => `<mark class="fc-legal__pendente">${m}</mark>`)
    .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
}

const semMarcas = (s) => s.replace(/\*\*/g, '').trim()
const celulas = (linha) => linha.trim().replace(/^\||\|$/g, '').split('|').map((c) => c.trim())
const SO_NEGRITO = /^\*\*[^*]+\*\*$/

/** Linhas de um trecho (sem títulos "##") → HTML de blocos. */
export function blocos(linhas) {
  const out = []
  let i = 0
  while (i < linhas.length) {
    const l = linhas[i].trim()
    if (!l) {
      i++
      continue
    }
    if (l.startsWith('|')) {
      const tab = []
      while (i < linhas.length && linhas[i].trim().startsWith('|')) tab.push(linhas[i++].trim())
      const cab = celulas(tab[0])
      const corpo = tab.slice(2).map(celulas) // tab[1] = |---|---|
      const rotulos = cab.map((c) => escapar(semMarcas(c)))
      out.push(
        `<table><thead><tr>${cab.map((c) => `<th scope="col">${inline(c)}</th>`).join('')}</tr></thead><tbody>` +
          corpo.map((r) => `<tr>${r.map((c, k) => `<td data-rotulo="${rotulos[k]}">${inline(c)}</td>`).join('')}</tr>`).join('') +
          '</tbody></table>',
      )
      continue
    }
    const lista = /^- /.test(l) ? { tag: 'ul', re: /^- / } : /^\d+\. /.test(l) ? { tag: 'ol', re: /^\d+\. / } : null
    if (lista) {
      const itens = []
      while (i < linhas.length && lista.re.test(linhas[i].trim())) itens.push(linhas[i++].trim().replace(lista.re, ''))
      out.push(`<${lista.tag}>${itens.map((t) => `<li>${inline(t)}</li>`).join('')}</${lista.tag}>`)
      continue
    }
    const par = []
    while (i < linhas.length && linhas[i].trim() && !/^(\||- |\d+\. )/.test(linhas[i].trim())) par.push(linhas[i++].trim())
    const texto = par.join(' ')
    out.push(SO_NEGRITO.test(texto) ? `<h3>${inline(texto.slice(2, -2))}</h3>` : `<p>${inline(texto)}</p>`)
  }
  return out.join('')
}

/**
 * md (tudo depois do título "#") → { cabecalho, intro, secoes: [{ id, titulo, html }] }.
 * Falha alto se o texto usar algo fora do subconjunto (###, >, ---): a página não abre e o erro vai para o console
 * — melhor do que publicar marcação crua no meio do texto legal.
 */
export function lerDocumentoLegal(md) {
  const linhas = md.replace(/\r\n?/g, '\n').trim().split('\n')
  const fora = linhas.find((l) => /^(#(?!# )|###|>|---|<!--)/.test(l.trim()))
  if (fora) throw new Error(`[legal] marcação fora do subconjunto: "${fora.trim().slice(0, 60)}"`)
  const inicioSecoes = linhas.findIndex((l) => l.startsWith('## '))
  const preambulo = linhas.slice(0, inicioSecoes < 0 ? linhas.length : inicioSecoes)
  const iCab = preambulo.findIndex((l) => l.trim().startsWith('**Vigência:**'))
  // "Vigência: … · Versão: n": cada pedaço depois de um " · " fica inteiro na linha, com o ponto na frente — no
  // celular o "·" não fica pendurado no fim da linha. O texto não muda.
  const cabecalho =
    iCab < 0
      ? ''
      : preambulo[iCab]
          .trim()
          .split(' · ')
          .map((parte, k) => (k ? ` <span class="fc-legal__junto">· ${inline(parte)}</span>` : inline(parte)))
          .join('')
  const intro = blocos(preambulo.filter((_, k) => k !== iCab))

  const secoes = []
  for (let i = inicioSecoes; i >= 0 && i < linhas.length; ) {
    const titulo = linhas[i].slice(3).trim()
    let fim = i + 1
    while (fim < linhas.length && !linhas[fim].startsWith('## ')) fim++
    secoes.push({ id: slug(titulo), titulo, html: blocos(linhas.slice(i + 1, fim)) })
    i = fim
  }
  const ids = new Set(secoes.map((s) => s.id))
  if (ids.size !== secoes.length) throw new Error('[legal] duas seções com o mesmo id')
  return { cabecalho, intro, secoes }
}
