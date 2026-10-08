// Geometria da rota de pontos:
// segmentos retos, ponto de 12 px com passo L/round(L/18) (o ponto cai exato nas pontas), máscara por segmento com
// atraso proporcional ao comprimento, corte de ±30 px em volta das paradas. Nenhuma função de página mora aqui.

export const PASSO = 18
export const CORTE_PARADA = 30
/** Parada: arco C r 14 aberto à direita, numa caixa 48×48 centrada no ponto (halo 16 + dourado 4). */
export const PARADA_D = 'M34.72 15 A14 14 0 1 0 34.72 33'

const f1 = (v) => +(+v).toFixed(1)

/** Divide a polilinha `pts` onde ela passa por uma parada (±30 px), para os pontos não encostarem no arco. */
export function cortar(pts, paradas = []) {
  const partes = []
  let atual = [pts[0]]
  for (let i = 1; i < pts.length; i++) {
    const a = pts[i - 1]
    const b = pts[i]
    const dx = b[0] - a[0]
    const dy = b[1] - a[1]
    const L = Math.hypot(dx, dy)
    if (L < 0.5) continue
    const ux = dx / L
    const uy = dy / L
    paradas
      .map((p) => ({ t: (p.x - a[0]) * ux + (p.y - a[1]) * uy, d: Math.abs((p.x - a[0]) * uy - (p.y - a[1]) * ux) }))
      .filter((o) => o.d < 1.5 && o.t > -1 && o.t < L + 1)
      .sort((m, n) => m.t - n.t)
      .forEach((o) => {
        atual.push([a[0] + ux * (o.t - CORTE_PARADA), a[1] + uy * (o.t - CORTE_PARADA)])
        partes.push(atual)
        atual = [[a[0] + ux * (o.t + CORTE_PARADA), a[1] + uy * (o.t + CORTE_PARADA)]]
      })
    atual.push(b)
  }
  partes.push(atual)
  return partes.filter((p) => p.length > 1)
}

/**
 * pernas: [{ pts: [[x,y],…], delay, dur }] · paradas: [{ x, y, halo }]
 * → segmentos prontos para desenhar: { x1,y1,x2,y2, passo, mascara: { x,y,w,h, origem, horizontal }, atraso, duracao }
 */
export function segmentar(pernas = [], paradas = []) {
  const saida = []
  for (const [indice, perna] of pernas.entries()) {
    const segs = []
    let total = 0
    for (const p of cortar(perna.pts, paradas)) {
      for (let i = 1; i < p.length; i++) {
        const [x1, y1] = p[i - 1]
        const [x2, y2] = p[i]
        const L = Math.hypot(x2 - x1, y2 - y1)
        if (L < 1) continue
        segs.push({ x1, y1, x2, y2, L, acc: total })
        total += L
      }
    }
    for (const s of segs) {
      const k = Math.max(1, Math.round(s.L / PASSO))
      const horizontal = Math.abs(s.x2 - s.x1) >= Math.abs(s.y2 - s.y1)
      const mx = Math.min(s.x1, s.x2) - 9
      const my = Math.min(s.y1, s.y2) - 9
      const mw = Math.abs(s.x2 - s.x1) + 18
      const mh = Math.abs(s.y2 - s.y1) + 18
      const ux = (s.x2 - s.x1) / s.L
      const uy = (s.y2 - s.y1) / s.L
      saida.push({
        perna: indice,
        x1: f1(s.x1),
        y1: f1(s.y1),
        // +0,6 px na ponta: o último "traço de comprimento zero" entra no desenho
        x2: f1(s.x2 + ux * 0.6),
        y2: f1(s.y2 + uy * 0.6),
        passo: +(s.L / k).toFixed(3),
        mascara: {
          x: f1(mx), y: f1(my), w: f1(mw), h: f1(mh), horizontal,
          origem: `${f1(s.x2 >= s.x1 ? mx : mx + mw)}px ${f1(s.y2 >= s.y1 ? my : my + mh)}px`,
        },
        atraso: Math.round(perna.delay + (perna.dur * s.acc) / total),
        duracao: Math.round(Math.max(60, (perna.dur * s.L) / total)),
      })
    }
  }
  return saida
}

/** Centros dos pontos de um segmento (para testes: interseção ponto × texto, passo 18 ± 0,5). */
export function pontosDe(seg) {
  const L = Math.hypot(seg.x2 - seg.x1, seg.y2 - seg.y1)
  const n = Math.floor(L / seg.passo + 1e-6)
  const ux = (seg.x2 - seg.x1) / L
  const uy = (seg.y2 - seg.y1) / L
  return Array.from({ length: n + 1 }, (_, i) => [seg.x1 + ux * seg.passo * i, seg.y1 + uy * seg.passo * i])
}
