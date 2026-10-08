// Geometria da rota (lib/rota.js) — o desenho dos pontos depende disto: passo 18 ± 0,5, corte de ±30 em volta da
// parada, pontos nas duas pontas, atraso proporcional ao comprimento, nunca um segmento menor que 1 px.
import { describe, expect, it } from 'vitest'
import { CORTE_PARADA, PASSO, cortar, pontosDe, segmentar } from '@/lib/rota'

describe('rota de pontos', () => {
  it('passo = L / round(L/18): o ponto cai exato nas duas pontas e o desvio de 18 é no máximo 9/k (≤ 0,5 a partir de 18 passos)', () => {
    for (const L of [18, 40, 55, 100, 133, 260, 330, 999]) {
      const [s] = segmentar([{ pts: [[0, 0], [L, 0]], delay: 0, dur: 400 }])
      const k = Math.max(1, Math.round(L / PASSO))
      expect(s.passo).toBeCloseTo(L / k, 3)
      expect(Math.abs(s.passo - PASSO)).toBeLessThanOrEqual(9 / k + 1e-3) // passo vem arredondado a 3 casas
      if (k >= 18) expect(Math.abs(s.passo - PASSO)).toBeLessThanOrEqual(0.5)
      const pts = pontosDe(s)
      expect(pts[0]).toEqual([0, 0])
      expect(Math.abs(pts.at(-1)[0] - L)).toBeLessThan(1) // último ponto na ponta (o +0,6 do desenho fica fora)
    }
  })

  it('a parada corta a perna em ±30 px — nenhum ponto encosta no arco', () => {
    const partes = cortar([[0, 0], [0, 200]], [{ x: 0, y: 100 }])
    expect(partes).toHaveLength(2)
    expect(partes[0].at(-1)).toEqual([0, 100 - CORTE_PARADA])
    expect(partes[1][0]).toEqual([0, 100 + CORTE_PARADA])
    const pts = segmentar([{ pts: [[0, 0], [0, 200]], delay: 0, dur: 400 }], [{ x: 0, y: 100 }]).flatMap(pontosDe)
    expect(pts.every(([, y]) => Math.abs(y - 100) >= CORTE_PARADA - 0.5)).toBe(true)
  })

  it('parada fora da linha (mais de 1,5 px ao lado) não corta nada', () => {
    expect(cortar([[0, 0], [0, 200]], [{ x: 2, y: 100 }])).toHaveLength(1)
  })

  it('atraso e duração saem proporcionais ao comprimento acumulado da perna', () => {
    const segs = segmentar([{ pts: [[0, 0], [100, 0], [100, 300]], delay: 600, dur: 400 }])
    expect(segs.map((s) => s.atraso)).toEqual([600, 700])
    expect(segs.map((s) => s.duracao)).toEqual([100, 300])
    expect(segs.map((s) => s.mascara.horizontal)).toEqual([true, false])
  })

  it('segmento degenerado (< 1 px) some; cada perna guarda o próprio índice (U acende trecho a trecho)', () => {
    const segs = segmentar([
      { pts: [[0, 0], [0.4, 0], [0, 50]], delay: 0, dur: 300 },
      { pts: [[0, 50], [0, 100]], delay: 0, dur: 300 },
    ])
    expect(segs.map((s) => s.perna)).toEqual([0, 1])
  })
})
