// Espelho JS dos tokens de src/styles/movimento.css — MESMOS números; o teste de paridade
// (tests/unit/motion.test.js) lê o CSS e compara. Sem curva "entrega" de propósito (só nos 2 JSON de Lottie).

export const CURVA = {
  fermenta: 'cubic-bezier(0.22, 1, 0.36, 1)',
  assa: 'cubic-bezier(0.45, 0, 0.2, 1)',
}

export const DUR = {
  pressao: 120,
  saida: 160,
  hover: 200,
  reduzido: 200,
  expande: 240,
  entraItem: 240,
  gaveta: 280,
  flip: 320,
  linhaH1: 340,
  elemento: 400,
  cicloCarga: 900,
}

export const STAGGER = { base: 100, linha: 80, passo: 120, carga: 150, item: 40 }

export const DESLOC = { base: 14, curto: 8, erro: 4, trio: 4 }

// Só em JS
// VEU: mostraCarga = tempo mínimo na tela quando o véu aparece sob RM (sem pisca);
// anunciaCarga = quando o role="status" passa a dizer "Carregando…"; fontesMax = teto de espera do fonts.ready.
export const VEU = { sempre: true /* véu em toda troca de rota */, entra: 120, minimo: 320, sai: 200, mostraCarga: 400, avisoDemora: 5000, semVeuRM: 100, anunciaCarga: 1000, fontesMax: 300 }
// aposEntrada: nenhum byte de Lottie antes do LCP — além do load + ocioso, espera a entrada mais
// longa terminar (o hero, 1000 ms a partir do t = 0): o elemento do LCP já pintou inteiro
export const LOTTIE = { rootMargin: '200px 0px', esperaMax: 600, folgaHandoff: 200, ociosoMax: 800, aposEntrada: 1000 }
export const NUDGE = { max: 2, permanenciaMin: 20000, rolagemMin: 0.4, quietoMin: 4000, intervaloMin: 60000 }
export const COSTURA = { rootMargin: '0px 0px -35% 0px', perna: 180, travessia: 40 }
export const REVEAL = { limiar: 0.2, maxDegraus: 6 }

/** Nome do token CSS de cada constante (usado pelo teste de paridade). */
export const TOKENS_CSS = {
  '--fc-curva-fermenta': CURVA.fermenta,
  '--fc-curva-assa': CURVA.assa,
  '--fc-dur-pressao': `${DUR.pressao}ms`,
  '--fc-dur-saida': `${DUR.saida}ms`,
  '--fc-dur-hover': `${DUR.hover}ms`,
  '--fc-dur-reduzido': `${DUR.reduzido}ms`,
  '--fc-dur-expande': `${DUR.expande}ms`,
  '--fc-dur-entra-item': `${DUR.entraItem}ms`,
  '--fc-dur-gaveta': `${DUR.gaveta}ms`,
  '--fc-dur-flip': `${DUR.flip}ms`,
  '--fc-dur-linha-h1': `${DUR.linhaH1}ms`,
  '--fc-dur-elemento': `${DUR.elemento}ms`,
  '--fc-dur-ciclo-carga': `${DUR.cicloCarga}ms`,
  '--fc-stagger': `${STAGGER.base}ms`,
  '--fc-stagger-linha': `${STAGGER.linha}ms`,
  '--fc-stagger-passo': `${STAGGER.passo}ms`,
  '--fc-stagger-carga': `${STAGGER.carga}ms`,
  '--fc-stagger-item': `${STAGGER.item}ms`,
  '--fc-desloc': `${DESLOC.base}px`,
  '--fc-desloc-curto': `${DESLOC.curto}px`,
  '--fc-desloc-erro': `${DESLOC.erro}px`,
  '--fc-desloc-trio': `${DESLOC.trio}px`,
}

const temJanela = typeof window !== 'undefined'

/** prefers-reduced-motion lido NA HORA: o CSS não desliga o que o JS anima. */
export const reduzirAgora = () => Boolean(temJanela && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches)

/** requestIdleCallback com teto; sem a API, setTimeout com o mesmo teto. */
export function quandoOcioso(fn, teto = LOTTIE.ociosoMax) {
  if (!temJanela) return
  if (typeof window.requestIdleCallback === 'function') window.requestIdleCallback(fn, { timeout: teto })
  else setTimeout(fn, Math.min(teto, 200))
}

/** Resolve depois do `load` da janela + ocioso (o player do Lottie nunca entra antes do LCP). */
let liberado = null
export function depoisDoLoad() {
  if (!temJanela) return Promise.resolve()
  liberado ??= new Promise((ok) => {
    const seguir = () => quandoOcioso(ok)
    if (document.readyState === 'complete') seguir()
    else window.addEventListener('load', seguir, { once: true })
  })
  return liberado
}

/** Espera um quadro de pintura (dois rAF: o 1º agenda, o 2º roda depois do layout). */
export const doisQuadros = () => new Promise((ok) => requestAnimationFrame(() => requestAnimationFrame(ok)))
