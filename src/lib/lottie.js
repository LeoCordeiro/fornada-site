/**
 * Player do Lottie e JSON da marca, sob demanda (BrandLottie.vue e IconeMarca.vue importam daqui).
 * `lottie_light` desenha só SVG e não usa eval (CSP sem unsafe-eval). Os JSON são gerados por
 * scripts/lottie-build.mjs — nunca editar à mão.
 *  - nada de Lottie antes do LCP: player E JSON só depois de `liberar()` — load + ocioso e a
 *    entrada mais longa terminada (LOTTIE.aposEntrada a partir do t = 0 da 1ª página revelada);
 *  - JSON: quando o contêiner chega a 200 px da viewport (LOTTIE.rootMargin), ou quando quem usa pede play/pôster.
 */
import manifest from '../assets/lottie/manifest.json'
import { depoisDoLoad, LOTTIE } from './motion.js'
import { ACIMA } from './gatilho.js'
import { quandoRevelada } from '@/composables/useVeu'

export const animacoes = manifest.animacoes

const arquivos = import.meta.glob(['../assets/lottie/*.json', '!../assets/lottie/manifest.json'], { import: 'default' })

let liberado = null
/** Resolve quando Lottie pode baixar: depois do load + ocioso e do fim da entrada da página (o LCP já pintou). */
export function liberar() {
  liberado ??= Promise.all([
    depoisDoLoad(),
    new Promise((ok) => quandoRevelada(() => setTimeout(ok, LOTTIE.aposEntrada))),
  ])
  return liberado
}

let player = null
export function carregarPlayer() {
  player ??= liberar()
    .then(() => import('lottie-web/build/player/lottie_light'))
    .then((m) => m.default ?? m)
  return player
}

/** Cópia nova a cada uso: o player reescreve o objeto que recebe. */
export async function carregarAnimacao(arquivo) {
  const carregar = arquivos[`../assets/lottie/${arquivo}`]
  if (!carregar) throw new Error(`arquivo "${arquivo}" não está em src/assets/lottie`)
  await liberar()
  return structuredClone(await carregar())
}

/** Arquivo da variante; chaves sem invertida própria usam a normal nos dois fundos. */
export const arquivoDa = (m, variante) => (variante === 'invertida' && m.arquivos.invertida) || m.arquivos.normal

// ---- observadores compartilhados (um por configuração) ----
const regs = new WeakMap()
const ios = new Map()
function io(chave, opcoes) {
  if (typeof IntersectionObserver === 'undefined') return null
  if (!ios.has(chave)) {
    ios.set(chave, new IntersectionObserver((es) => es.forEach((e) => regs.get(e.target)?.[chave]?.(e)), opcoes))
  }
  return ios.get(chave)
}

/**
 * observar(el, { perto, visivel, gatilho, limiar }):
 *  perto(e)   — 1 vez, a 200 px da viewport (carrega o JSON);
 *  visivel(e) — a cada entrada/saída com limiar 0 (pausa fora da tela);
 *  gatilho(e) — no `limiar` do gatilho viewport; a raiz vai até bem acima da tela, então alvo já ACIMA também
 *               chega aqui (isIntersecting, com boundingClientRect.bottom < 0) — quem chama decide pôster.
 * Sem IntersectionObserver: tudo dispara na hora como visível.
 */
export function observar(el, { perto, visivel, gatilho, limiar = 0.4 } = {}) {
  const chaveGatilho = `gatilho:${limiar}`
  const reg = {}
  const oPerto = io('perto', { rootMargin: LOTTIE.rootMargin })
  if (!oPerto) {
    perto?.({ isIntersecting: true })
    visivel?.({ isIntersecting: true })
    gatilho?.({ isIntersecting: true })
    return () => {}
  }
  if (perto) {
    reg.perto = (e) => {
      if (!e.isIntersecting) return
      oPerto.unobserve(el)
      perto(e)
    }
    oPerto.observe(el)
  }
  if (visivel) {
    reg.visivel = visivel
    io('visivel', { threshold: 0 }).observe(el)
  }
  if (gatilho) {
    reg[chaveGatilho] = gatilho
    io(chaveGatilho, { threshold: limiar, rootMargin: `${ACIMA} 0px 0px 0px` }).observe(el) // acima da tela conta
  }
  regs.set(el, reg)
  return () => {
    for (const o of ios.values()) o.unobserve(el)
    regs.delete(el)
  }
}
