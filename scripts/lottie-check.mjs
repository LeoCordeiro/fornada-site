#!/usr/bin/env node
// Confere as animações Lottie antes de cada deploy (npm run lottie:check). Node puro.
//   node scripts/lottie-check.mjs [pasta]   (padrão: src/assets/lottie)  → exit 1 e diz o quê
//
// Reprova:
//  - cor fora da paleta Lottie (fl/st/gf/gs em forma, sc de sólido, fc/sc de texto, cor de efeito;
//    estática ou com keyframe). Paleta = os seis hex da marca. #B8862B fica fora (contraste insuficiente) e
//    os dourados de hover #C29033/#BD8B2F são só de CSS — nunca em animação;
//  - arquivo > 25 KB, total > 150 KB;
//  - expressão ("x" com string), raster (asset com imagem, camada de imagem), texto/fonte, gradiente,
//    efeito ou estilo de camada (blur/glow/sombra), fr ≠ 30, tracejado sem "nm" (lottie-web svg some com a camada);
//  - keyframe com easing fora das curvas da marca (fermenta/assa/entrega) e "entrega" (overshoot)
//    fora de enviado-sucesso/selo-sanitario;
//  - chave do catálogo sem arquivo no manifest, arquivo do manifest que não existe,
//    JSON na pasta sem registro no manifest, KB do manifest desatualizado, posterFrame ≥ op
//    (o lottie-web para em op−1: poster nesse quadro nunca é desenhado);
//  - gatilho que não é trigger do BrandLottie, "uso" ausente (sem uso = []) ou entrada de uso
//    pedindo variante sem arquivo (gerar a variante no lottie-build).
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const RAIZ = join(dirname(fileURLToPath(import.meta.url)), '..')
const PASTA = resolve(process.argv[2] || join(RAIZ, 'src', 'assets', 'lottie'))

const PALETA = new Set(['#5B3A22', '#3E2615', '#826853', '#D9A441', '#FAF5EA', '#F0E6D2'])
const LIMITE_ARQUIVO = 25 * 1024
const LIMITE_TOTAL = 150 * 1024
const FR = 30
const CATALOGO = [
  'pontos-conecta', 'pao-cresce', 'passo-1-pedido', 'passo-2-atribuicao', 'passo-3-fornada',
  'passo-4-entrega', 'selo-sanitario', 'rota-entrega', 'enviado-sucesso', 'catalogo-vazio', 'whatsapp-nudge',
]
const CURVAS = { fermenta: [0.22, 1, 0.36, 1], assa: [0.45, 0, 0.2, 1], entrega: [0.34, 1.3, 0.64, 1] }
const COM_OVERSHOOT = new Set(['enviado-sucesso', 'selo-sanitario'])
const GATILHOS = ['viewport', 'manual'] // validator da prop trigger do BrandLottie

const erros = []
const hex = (r, g, b) => '#' + [r, g, b].map((v) => Math.round(Math.min(1, Math.max(0, v)) * 255).toString(16).padStart(2, '0')).join('').toUpperCase()
const num = (v) => (Array.isArray(v) ? v[0] : v)

// valores de uma propriedade estática ou com keyframes: [[...], ...]
function valores(prop) {
  if (!prop || prop.k === undefined) return []
  const k = prop.k
  if (Array.isArray(k) && k.length && typeof k[0] === 'object' && k[0] !== null && 't' in k[0]) {
    return k.flatMap((kf) => [kf.s, kf.e].filter(Array.isArray))
  }
  return Array.isArray(k) ? [k] : []
}

function coresDeGradiente(g) {
  const n = g?.p ?? 0
  return valores(g?.k ?? g).flatMap((arr) => {
    const out = []
    for (let i = 0; i < n; i++) out.push(hex(arr[i * 4 + 1], arr[i * 4 + 2], arr[i * 4 + 3]))
    return out
  })
}

function conferir(arquivo, json) {
  const nome = arquivo.replace(/\.json$/, '')
  const chave = nome.replace(/-invertida$/, '')
  const cores = new Set()
  const problemas = []
  const add = (msg) => problemas.push(msg)

  if (json.fr !== FR) add(`fr ${json.fr} (precisa ${FR})`)
  if (json.fonts || json.chars) add('tem "fonts"/"chars" (texto injeta fonte)')
  for (const asset of json.assets || []) {
    if (typeof asset.p === 'string' || asset.e === 1 || typeof asset.u === 'string') add(`asset raster "${asset.id ?? '?'}"`)
  }

  const visto = new WeakSet()
  function andar(no, caminho) {
    if (!no || typeof no !== 'object' || visto.has(no)) return
    visto.add(no)
    if (Array.isArray(no)) return no.forEach((item, i) => andar(item, `${caminho}[${i}]`))

    if (typeof no.x === 'string') add(`expressão em ${caminho}`)

    // camada
    if (typeof no.ty === 'number' && no.ks) {
      if (no.ty === 2) add(`camada de imagem "${no.nm ?? ''}"`)
      if (no.ty === 5) add(`camada de texto "${no.nm ?? ''}"`)
      if (no.ty === 1 && typeof no.sc === 'string') cores.add(no.sc.toUpperCase().slice(0, 7))
      if (Array.isArray(no.ef) && no.ef.length) add(`efeito de camada em "${no.nm ?? ''}" (blur/glow proibidos)`)
      if (Array.isArray(no.sy) && no.sy.length) add(`estilo de camada em "${no.nm ?? ''}" (sombra/glow proibidos)`)
    }
    // formas
    if (no.ty === 'fl' || no.ty === 'st') valores(no.c).forEach((c) => cores.add(hex(c[0], c[1], c[2])))
    if (no.ty === 'st' && Array.isArray(no.d) && no.d.some((it) => typeof it.nm !== 'string')) add(`tracejado sem "nm" em ${caminho} (o renderer svg do lottie-web descarta a camada inteira)`)
    if (no.ty === 'gf' || no.ty === 'gs') {
      add(`gradiente em ${caminho} (a marca não usa gradiente)`)
      coresDeGradiente(no.g).forEach((c) => cores.add(c))
    }
    // texto (fc/sc dentro do documento)
    if (no.t && no.t.d) {
      for (const doc of no.t.d.k || []) {
        for (const campo of ['fc', 'sc']) if (Array.isArray(doc.s?.[campo])) cores.add(hex(...doc.s[campo]))
      }
    }
    // cor em efeito (ty 2 = color control)
    if (no.ty === 2 && no.v && !no.ks) valores(no.v).forEach((c) => cores.add(hex(c[0], c[1], c[2])))

    // keyframes: easing só das curvas da marca
    if (no.a === 1 && Array.isArray(no.k)) {
      no.k.forEach((kf, i) => {
        if (!kf || typeof kf !== 'object' || !('t' in kf) || kf.h === 1 || !kf.o || !kf.i) return
        if (i === no.k.length - 1) return
        const h = [num(kf.o.x), num(kf.o.y), num(kf.i.x), num(kf.i.y)]
        const curva = Object.entries(CURVAS).find(([, ref]) => ref.every((v, j) => Math.abs(v - h[j]) < 0.001))
        if (!curva) add(`easing fora das curvas da marca em ${caminho} t=${kf.t} (${h.join(',')})`)
        else if (curva[0] === 'entrega' && !COM_OVERSHOOT.has(chave)) add(`curva "entrega" (overshoot) em ${caminho} t=${kf.t} — só enviado-sucesso/selo-sanitario`)
      })
    }
    for (const [k, v] of Object.entries(no)) if (v && typeof v === 'object') andar(v, caminho ? `${caminho}.${k}` : k)
  }
  andar(json, '')

  for (const c of cores) if (!PALETA.has(c)) add(`cor fora da paleta ${c}`)
  return { problemas, cores: [...cores] }
}

// ———————————————————— execução ————————————————————
if (!existsSync(PASTA)) {
  console.error(`ERRO pasta não existe: ${PASTA}`)
  process.exit(1)
}
const jsons = readdirSync(PASTA).filter((n) => n.endsWith('.json') && n !== 'manifest.json').sort()
let manifest = null
try {
  manifest = JSON.parse(readFileSync(join(PASTA, 'manifest.json'), 'utf8'))
} catch (e) {
  erros.push(`manifest.json ausente ou inválido (${e.code || e.message})`)
}

const linhas = []
let total = 0
const dados = {}
for (const arquivo of jsons) {
  const bytes = statSync(join(PASTA, arquivo)).size
  total += bytes
  let json
  try {
    json = JSON.parse(readFileSync(join(PASTA, arquivo), 'utf8'))
  } catch (e) {
    erros.push(`${arquivo}: JSON inválido (${e.message})`)
    linhas.push([arquivo, (bytes / 1024).toFixed(2), '-', '-', '-', '-', 'ERRO'])
    continue
  }
  dados[arquivo] = { json, bytes }
  const { problemas, cores } = conferir(arquivo, json)
  if (bytes > LIMITE_ARQUIVO) problemas.push(`${(bytes / 1024).toFixed(2)} KB > 25 KB`)
  problemas.forEach((p) => erros.push(`${arquivo}: ${p}`))
  linhas.push([arquivo, (bytes / 1024).toFixed(2), String(json.fr), String(json.op), '', cores.join(' '), problemas.length ? 'ERRO' : 'ok'])
}
if (total > LIMITE_TOTAL) erros.push(`total ${(total / 1024).toFixed(2)} KB > 150 KB`)

if (manifest) {
  const anims = manifest.animacoes || {}
  const registrados = new Set()
  for (const chave of CATALOGO) {
    const m = anims[chave]
    if (!m || !m.arquivos?.normal) {
      erros.push(`catálogo: "${chave}" sem arquivo no manifest`)
      continue
    }
    if (!GATILHOS.includes(m.gatilho)) erros.push(`manifest: ${chave} gatilho "${m.gatilho}" não é trigger do BrandLottie (${GATILHOS.join('|')})`)
    if (!Array.isArray(m.uso)) erros.push(`manifest: ${chave} sem "uso" (animação sem uso = [])`)
    else m.uso.forEach((u, i) => {
      if (!m.arquivos[u?.variante]) erros.push(`manifest: ${chave}.uso[${i}] (${u?.pagina ?? '?'}) pede variante "${u?.variante}" sem arquivo — gerar no lottie-build`)
    })
    for (const [variante, arq] of Object.entries(m.arquivos)) {
      if (!arq) continue
      registrados.add(arq)
      if (!dados[arq]) {
        erros.push(`manifest: ${chave}.${variante} → "${arq}" não existe na pasta`)
        continue
      }
      const { json, bytes } = dados[arq]
      const kb = Math.round((bytes / 1024) * 100) / 100
      if (m.kb && m.kb[variante] != null && Math.abs(m.kb[variante] - kb) > 0.01) erros.push(`manifest: ${chave}.${variante} diz ${m.kb[variante]} KB, arquivo tem ${kb} — rode lottie-build`)
      if (!(m.posterFrame >= json.ip && m.posterFrame < json.op)) erros.push(`manifest: ${chave} (${arq}) posterFrame ${m.posterFrame} fora de [ip ${json.ip}, op−1 ${json.op - 1}]`)
      if (m.op != null && m.op !== json.op) erros.push(`manifest: ${chave} op ${m.op} ≠ ${arq} op ${json.op}`)
      if (m.fr != null && m.fr !== json.fr) erros.push(`manifest: ${chave} fr ${m.fr} ≠ ${arq} fr ${json.fr}`)
      const linha = linhas.find((l) => l[0] === arq)
      if (linha) linha[4] = String(m.posterFrame)
    }
  }
  for (const [chave, m] of Object.entries(anims)) {
    if (!CATALOGO.includes(chave)) erros.push(`manifest: "${chave}" fora do catálogo (CATALOGO no lottie-build)`)
    Object.values(m.arquivos || {}).forEach((a) => a && registrados.add(a))
  }
  for (const arquivo of jsons) if (!registrados.has(arquivo)) erros.push(`${arquivo}: sem registro no manifest`)
}

// tabela
const cab = ['arquivo', 'KB', 'fr', 'op', 'poster', 'cores', 'status']
const larg = cab.map((c, i) => Math.max(c.length, ...linhas.map((l) => l[i].length)))
const fmt = (l) => l.map((c, i) => (i === 1 ? c.padStart(larg[i]) : c.padEnd(larg[i]))).join('  ')
console.log(`lottie-check → ${PASTA}`)
console.log(fmt(cab))
console.log(larg.map((n) => '-'.repeat(n)).join('  '))
linhas.forEach((l) => console.log(fmt(l)))
console.log(`TOTAL ${(total / 1024).toFixed(2)} KB de 150 KB · ${jsons.length} arquivos · maior ${Math.max(0, ...Object.values(dados).map((d) => d.bytes / 1024)).toFixed(2)} KB de 25 KB`)

if (erros.length) {
  for (const e of erros) console.error(`ERRO ${e}`)
  console.error(`VERMELHO — ${erros.length} problema(s)`)
  process.exit(1)
}
console.log('VERDE — paleta, peso, fr, easing e manifest conferidos')
