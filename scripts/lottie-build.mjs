#!/usr/bin/env node
// Gera as microanimações Lottie da Fornada Conecta a partir da geometria da logo oficial
// (assets/logo/fornada-conecta-icone.svg: arco C, pontos e proporções). Node puro, sem dependência,
// determinístico: mesma entrada, mesmos bytes.
//
//   node scripts/lottie-build.mjs   → src/assets/lottie/<chave>.json, <chave>-invertida.json, manifest.json
//
// Regras que este arquivo garante sozinho:
//  - 30 fps; toda transição usa um dos handles das curvas da marca (fermenta/assa/entrega);
//  - op = último keyframe + 1 (o lottie-web para em op−1; com op = último keyframe o poster nunca aparece);
//  - cores só da paleta (hex → 0-1 aqui; nada de cor solta no meio das formas);
//  - sem expressão, sem raster, sem texto, sem gradiente, sem efeito;
//  - uso só aponta para variante que existe — senão para antes de gravar qualquer arquivo.
import { mkdirSync, writeFileSync } from 'node:fs'
import { dirname, join, relative } from 'node:path'
import { fileURLToPath } from 'node:url'

const RAIZ = join(dirname(fileURLToPath(import.meta.url)), '..')
const SAIDA = join(RAIZ, 'src', 'assets', 'lottie')
const FR = 30

// Paleta Lottie: só estas seis. Os dourados de hover não entram em animação.
const HEX = {
  marrom: '#5B3A22',
  prof: '#3E2615',
  medio: '#826853',
  ouro: '#D9A441',
  creme: '#FAF5EA',
  creme2: '#F0E6D2',
}
// Variante -invertida (fundo #5B3A22/#3E2615): dourado não muda.
const INV = { marrom: 'creme', prof: 'creme', creme2: 'marrom', medio: 'creme2' }

// Curvas da marca: [handle de saída o, handle de entrada i].
const F = 'fermenta'
const A = 'assa'
const E = 'entrega'
const CURVAS = {
  [F]: [[0.22, 1], [0.36, 1]],
  [A]: [[0.45, 0], [0.2, 1]],
  [E]: [[0.34, 1.3], [0.64, 1]],
}

const r4 = (n) => Math.round(n * 1e4) / 1e4
const r2 = (n) => Math.round(n * 100) / 100
const rgb = (hex) => [1, 3, 5].map((i) => r4(parseInt(hex.slice(i, i + 2), 16) / 255)).concat(1)

// Kit de montagem. Um kit por arquivo: guarda o índice de camada e as curvas usadas.
function kit(invertida) {
  let ind = 0
  const curvas = new Set()
  let ultimoKeyframe = 0

  const cor = (nome, manter) => rgb(HEX[(invertida && !manter && INV[nome]) || nome])
  const K = (v) => ({ a: 0, k: v })
  const animado = (v) => v && typeof v === 'object' && !Array.isArray(v) && v.a === 1
  const P = (v) => (animado(v) ? v : K(v))

  // an([[t, valor, curva], ..., [t, valor]]) — toda transição declara a curva; a última chave não tem handle.
  function an(chaves) {
    return {
      a: 1,
      k: chaves.map(([t, v, curva], i) => {
        const s = Array.isArray(v) ? v : [v]
        const kf = { t, s }
        ultimoKeyframe = Math.max(ultimoKeyframe, t)
        if (i < chaves.length - 1) {
          if (!CURVAS[curva]) throw new Error(`keyframe t=${t} sem curva da marca (recebeu "${curva}")`)
          curvas.add(curva)
          const [o, ii] = CURVAS[curva]
          kf.o = { x: s.map(() => o[0]), y: s.map(() => o[1]) }
          kf.i = { x: s.map(() => ii[0]), y: s.map(() => ii[1]) }
        }
        return kf
      }),
    }
  }

  const TR = () => ({ ty: 'tr', p: K([0, 0]), a: K([0, 0]), s: K([100, 100]), r: K(0), o: K(100), sk: K(0), sa: K(0) })
  const EL = (x, y, w, h) => ({ ty: 'el', d: 1, p: K([x, y]), s: K([w, h]) })
  const RC = (x, y, w, h, r) => ({ ty: 'rc', d: 1, p: K([x, y]), s: K([w, h]), r: K(r) })
  const SH = (v, i, o, fechado) => {
    const zeros = () => v.map(() => [0, 0])
    return { ty: 'sh', d: 1, ks: K({ v, i: i || zeros(), o: o || zeros(), c: !!fechado }) }
  }
  const FL = (nome, manter) => ({ ty: 'fl', c: K(cor(nome, manter)), o: K(100), r: 1 })
  const ST = (nome, w, manter, tracejado) => {
    const st = { ty: 'st', c: K(cor(nome, manter)), o: K(100), w: K(w), lc: 2, lj: 2, ml: 4 }
    if (tracejado) st.d = tracejado
    return st
  }
  const TM = (fim) => ({ ty: 'tm', s: K(0), e: P(fim), o: K(0), m: 1 })
  const GR = (...itens) => ({ ty: 'gr', it: [...itens, TR()] })
  const S = (x, y) => [x, y, 100]

  function LY(nm, shapes, opt = {}) {
    const a = opt.a || [0, 0]
    const ly = {
      ddd: 0,
      ind: ++ind,
      ty: 4,
      nm,
      sr: 1,
      ks: {
        o: P(opt.o ?? 100),
        r: P(opt.r ?? 0),
        p: P(opt.p || [a[0], a[1], 0]),
        a: K([a[0], a[1], 0]),
        s: P(opt.s || [100, 100, 100]),
      },
      ao: 0,
      shapes,
      ip: 0,
      op: 0, // preenchido em COMP
      st: 0,
      bm: 0,
    }
    if (opt.parent) ly.parent = opt.parent
    return ly
  }

  // Arco "C" da logo: vértices em −40…−320°, handle 0,4204·r, aberto à direita.
  function arcoC(cx, cy, r) {
    const v = []
    const i = []
    const o = []
    ;[-40, -110, -180, -250, -320].forEach((graus, k) => {
      const f = (graus * Math.PI) / 180
      const c = Math.cos(f)
      const s = Math.sin(f)
      const h = 0.4204 * r
      v.push([r2(cx + r * c), r2(cy + r * s)])
      const ox = r2(h * s)
      const oy = r2(-h * c)
      o.push(k === 4 ? [0, 0] : [ox, oy])
      i.push(k === 0 ? [0, 0] : [-ox, -oy])
    })
    return SH(v, i, o, false)
  }
  const camadaC = () => LY('arco C', [GR(arcoC(100, 100, 70), ST('marrom', 20))])

  function COMP(nm, w, h, layers, markers) {
    const op = ultimoKeyframe + 1
    for (const ly of layers) ly.op = op
    const comp = { v: '5.7.4', fr: FR, ip: 0, op, w, h, nm, ddd: 0, assets: [], layers }
    if (markers) comp.markers = markers
    return comp
  }

  return {
    an, K, EL, RC, SH, FL, ST, TM, GR, S, LY, arcoC, camadaC, COMP,
    get curvas() { return [F, A, E].filter((c) => curvas.has(c)) },
    get ultimoKeyframe() { return ultimoKeyframe },
  }
}

// ———————————————————— desenhos (coordenadas no viewBox de cada comp) ————————————————————
const DESENHO = {
  // Três pontos (r 6, passo 18 — os da logo) surgem e viajam até a abertura do C.
  // Comp 260×200 em coordenadas da logo: o ícone oficial ocupa x 14–190, y 12–188.
  'pontos-conecta': ({ an, EL, FL, GR, S, LY, COMP }) =>
    COMP('pontos-conecta', 260, 200, [
      [0, 5, 18, [176, 82]],
      [4, 8, 22, [176, 100]],
      [7, 12, 25, [176, 118]],
    ].map(([surge, parte, chega, [x, y]], k) =>
      LY(`ponto ${k + 1}`, [GR(EL(0, 0, 12, 12), FL('ouro', true))], {
        p: an([[parte, [248, 100, 0], A], [chega, [x, y, 0]]]),
        s: an([[surge, S(0, 0), F], [parte, S(100, 100)]]),
      }))),

  // Prancheta do pedido recorrente: 3 linhas no passo 18 da logo.
  'passo-1-pedido': ({ an, EL, RC, SH, FL, ST, TM, GR, S, LY, camadaC, COMP }) => {
    const L = []
    ;[[88, 4, 7], [106, 6, 10], [124, 8, 12]].forEach(([y, de, ate], k) => {
      L.push(LY(`ponto ${k + 1}`, [GR(EL(88, y, 10, 10), FL('ouro'))], { a: [88, y], s: an([[de, S(0, 0), A], [ate, S(100, 100)]]) }))
      L.push(LY(`linha ${k + 1}`, [GR(SH([[98, y], [120, y]]), TM(an([[de, 0, A], [ate, 100]])), ST('marrom', 6))]))
    })
    L.push(LY('prancheta', [GR(RC(104, 70, 28, 12, 6), FL('ouro')), GR(RC(104, 104, 56, 68, 8), ST('marrom', 8))], {
      a: [104, 104],
      s: an([[0, S(92, 92), F], [5, S(100, 100)]]),
      o: an([[0, 0, F], [5, 100]]),
    }))
    L.push(camadaC())
    return COMP('passo-1-pedido', 200, 200, L)
  },

  // Pontos entram pela abertura do C e param em fila sobre o forno, que acende.
  'passo-2-atribuicao': ({ an, EL, RC, FL, ST, GR, LY, camadaC, COMP }) => {
    const L = [
      [[176, 82], [82, 72], 0, 7],
      [[176, 100], [100, 72], 2, 9],
      [[176, 118], [118, 72], 4, 11],
    ].map(([de, para, t0, t1], k) =>
      LY(`ponto ${k + 1}`, [GR(EL(0, 0, 12, 12), FL('ouro'))], { p: an([[t0, [...de, 0], A], [t1, [...para, 0]]]) }))
    L.push(LY('forno', [GR(RC(100, 108, 64, 52, 10), ST('marrom', 8))]))
    L.push(LY('porta', [GR(RC(100, 114, 36, 20, 10), FL('ouro'))], { o: an([[8, 0, F], [12, 100]]) }))
    L.push(camadaC())
    return COMP('passo-2-atribuicao', 200, 200, L)
  },

  // Assadeira desliza e três pães crescem da base.
  'passo-3-fornada': ({ an, EL, RC, FL, ST, GR, S, LY, camadaC, COMP }) => {
    const L = [[86, 4, 9], [104, 5, 11], [122, 7, 12]].map(([x, de, ate], k) =>
      LY(`pão ${k + 1}`, [GR(EL(x, 116, 18, 12), ST('marrom', 4), FL('ouro'))], { a: [x, 122], s: an([[de, S(80, 30), F], [ate, S(100, 100)]]) }))
    L.push(LY('assadeira', [GR(RC(0, 0, 72, 8, 4), FL('marrom'))], {
      p: an([[0, [80, 128, 0], F], [8, [104, 128, 0]]]),
      o: an([[0, 0, F], [4, 100]]),
    }))
    L.push(camadaC())
    return COMP('passo-3-fornada', 200, 200, L)
  },

  // Caixa segue a rota até a abertura do C, deixando rastro de pontos.
  'passo-4-entrega': ({ an, EL, RC, SH, FL, ST, GR, S, LY, camadaC, COMP }) => {
    const L = [LY('caixa', [GR(SH([[-20, -10], [20, -10]]), ST('marrom', 5)), GR(RC(0, 0, 40, 32, 6), ST('marrom', 7))], {
      p: an([[0, [70, 104, 0], A], [12, [124, 104, 0]]]),
    })]
    ;[[72, 4, 7], [90, 6, 10], [108, 8, 12]].forEach(([x, de, ate], k) => {
      L.push(LY(`rastro ${k + 1}`, [GR(EL(x, 134, 10, 10), FL('ouro'))], { a: [x, 134], s: an([[de, S(0, 0), F], [ate, S(100, 100)]]) }))
    })
    L.push(camadaC())
    return COMP('passo-4-entrega', 200, 200, L)
  },

  // Arco C carimbado (entrega, 3 % de sobra), check traçado, pontos da logo chegam.
  'selo-sanitario': ({ an, EL, SH, FL, ST, TM, GR, S, LY, arcoC, COMP }) => {
    const L = [[82, 8, 11], [100, 9, 12], [118, 11, 14]].map(([y, de, ate], k) =>
      LY(`ponto ${k + 1}`, [GR(EL(176, y, 12, 12), FL('ouro'))], { a: [176, y], s: an([[de, S(0, 0), F], [ate, S(100, 100)]]) }))
    L.push(LY('check', [GR(SH([[74, 102], [92, 120], [128, 82]]), TM(an([[5, 0, A], [12, 100]])), ST('ouro', 14))]))
    L.push(LY('arco C', [GR(arcoC(100, 100, 70), ST('marrom', 20))], {
      a: [100, 100],
      s: an([[0, S(125, 125), E], [7, S(100, 100)]]),
      o: an([[0, 0, E], [7, 100]]),
    }))
    return COMP('selo-sanitario', 200, 200, L)
  },

  // Massa cresce da base, ganha crosta dourada e pestanas. f 0–18 entrada; f 18–54 respiração em loop.
  'pao-cresce': ({ an, RC, SH, FL, ST, TM, GR, S, LY, COMP }) => {
    const massa = LY('massa', [GR(RC(100, 118, 96, 48, 24), ST('marrom', 6), FL('creme2'))], {
      a: [100, 142],
      s: an([[0, S(92, 55), F], [13, S(100, 100), A], [18, S(100, 100), A], [36, S(100, 94), F], [54, S(100, 100)]]),
    })
    const crosta = LY('crosta', [GR(RC(100, 118, 96, 48, 24), ST('marrom', 6), FL('ouro'))], {
      o: an([[9, 0, F], [18, 100]]),
      parent: massa.ind,
    })
    const pestanas = [82, 100, 118].map((x, k) =>
      LY(`pestana ${k + 1}`, [GR(SH([[x - 6, 104], [x + 6, 98]]), TM(an([[14, 0, A], [18, 100]])), ST('prof', 5))], { parent: massa.ind }))
    const assadeira = LY('assadeira', [GR(RC(100, 146, 112, 8, 4), FL('marrom'))])
    return COMP('pao-cresce', 200, 200, [...pestanas, crosta, massa, assadeira], [
      { tm: 0, cm: 'entrada', dr: 18 },
      { tm: 18, cm: 'loop', dr: 36 },
    ])
  },

  // Pão com check crescendo — overshoot só aqui e no selo (curva entrega).
  'enviado-sucesso': ({ an, EL, RC, SH, FL, ST, TM, GR, S, LY, COMP }) => {
    const L = [[82, 13, 15], [100, 14, 17], [118, 16, 18]].map(([x, de, ate], k) =>
      LY(`ponto ${k + 1}`, [GR(EL(x, 164, 12, 12), FL('ouro'))], { a: [x, 164], s: an([[de, S(0, 0), F], [ate, S(100, 100)]]) }))
    // check #3E2615 sobre o pão dourado (6,25:1) — não inverte
    L.push(LY('check', [GR(SH([[76, 108], [94, 126], [126, 92]]), TM(an([[7, 0, A], [16, 100]])), ST('prof', 12, true))]))
    L.push(LY('pão', [GR(RC(100, 108, 120, 72, 36), ST('marrom', 6), FL('ouro'))], { a: [100, 108], s: an([[0, S(0, 0), E], [11, S(100, 100)]]) }))
    return COMP('enviado-sucesso', 200, 200, L)
  },

  // Rota de pontos (traço 0,01 + vão 18 + ponta redonda = pontos de 12 no ritmo da logo) passando por 4 paradas.
  'rota-entrega': ({ an, K, SH, ST, TM, GR, S, LY, arcoC, COMP }) => {
    const V = [[24, 84], [140, 40], [260, 84], [376, 40]]
    const T = [[0, 5], [9, 14], [13, 18], [25, 30]]
    const L = V.map((v, k) =>
      LY(`parada ${k + 1}`, [GR(arcoC(v[0], v[1], 14), ST('marrom', 4))], { a: v, s: an([[T[k][0], S(0, 0), F], [T[k][1], S(100, 100)]]) }))
    L.push(LY('rota', [GR(
      SH(V, [[0, 0], [-40, 0], [-40, 0], [-40, 0]], [[40, 0], [40, 0], [40, 0], [0, 0]]),
      TM(an([[0, 0, A], [30, 100]])),
      // nm em cada item do tracejado é obrigatório: sem ele o renderer svg do lottie-web 5.12 descarta a camada inteira
      ST('ouro', 12, false, [{ n: 'd', nm: 'dash', v: K(0.01) }, { n: 'g', nm: 'gap', v: K(18) }, { n: 'o', nm: 'offset', v: K(0) }]),
    )]))
    return COMP('rota-entrega', 400, 120, L)
  },

  // Cesta vazia, um pão entra e ela assenta (sem overshoot).
  'catalogo-vazio': ({ an, EL, SH, FL, ST, GR, S, LY, COMP }) =>
    COMP('catalogo-vazio', 200, 200, [
      LY('cesta', [
        GR(SH([[76, 104], [100, 80], [124, 104]], [[0, 0], [-13.25, 0], [0, -15.5]], [[0, -15.5], [13.25, 0], [0, 0]]), ST('marrom', 8)),
        GR(SH([[60, 104], [140, 104], [128, 152], [72, 152]], null, null, true), ST('marrom', 8)),
      ], { a: [100, 152], s: an([[11, S(100, 100), A], [13, S(100, 97), A], [15, S(100, 100)]]) }),
      LY('pão', [GR(EL(0, 0, 40, 22), ST('marrom', 5), FL('ouro'))], {
        p: an([[0, [150, 30, 0], F], [11, [100, 130, 0]]]),
        r: an([[0, -20, F], [11, 0]]),
        o: an([[0, 0, F], [4, 100]]),
      }),
    ]),

  // Pulso sutil sobre o botão fixo (64 px, #5B3A22). Nunca em loop; máx. 2× por visita.
  'whatsapp-nudge': ({ an, EL, FL, ST, GR, S, LY, COMP }) => {
    const L = [[45, 3, 7, 12], [60, 6, 10, 15], [75, 9, 13, 18]].map(([x, t0, t1, t2], k) =>
      LY(`ponto ${k + 1}`, [GR(EL(0, 0, 10, 10), FL('creme', true))], {
        p: an([[t0, [x, 60, 0], A], [t1, [x, 55, 0], A], [t2, [x, 60, 0]]]),
      }))
    ;[[0, 18], [6, 24]].forEach(([de, ate], k) => {
      L.push(LY(`anel ${k + 1}`, [GR(EL(60, 60, 88, 88), ST('ouro', 4))], {
        a: [60, 60],
        s: an([[de, S(100, 100), A], [ate, S(136, 136)]]),
        o: an([[de, 60, A], [ate, 0]]),
      }))
    })
    return COMP('whatsapp-nudge', 120, 120, L)
  },
}

// ———————————————————— catálogo ————————————————————
// invertida: 'gera' = arquivo próprio · 'igual' = só dourado, o mesmo arquivo serve no marrom · null = não aparece em bloco marrom
// uso = onde a animação aparece: página, rota, fundo e variante; player: false = desenho estático do pôster, sem baixar o
// JSON. gatilho = padrão do BrandLottie (a prop trigger vence). uso pedindo variante sem arquivo derruba o build: gerar a
// variante aqui antes de usar.
// Os 4 passos moram na trilha do comércio de Como funciona (faixa marrom). A rota de entrega fica no catálogo, sem uso.
const NA_TRILHA = (tom) => [{ pagina: 'Como funciona', rota: '/como-funciona', fundo: tom, variante: tom === 'creme' ? 'normal' : 'invertida' }]
const CATALOGO = [
  {
    chave: 'pontos-conecta', poster: 25, gatilho: 'manual', loop: false, invertida: 'igual', decorative: true,
    uso: [
      { pagina: 'Home', rota: '/', fundo: 'creme', variante: 'normal' },
      { pagina: 'Sobre', rota: '/sobre', fundo: 'marrom', variante: 'invertida' },
    ],
  },
  {
    chave: 'pao-cresce', poster: 18, gatilho: 'viewport', loop: false, invertida: 'gera', decorative: true,
    segmentos: { entrada: [0, 19], loop: [18, 54] }, // marcadores "entrada" e "loop" no JSON
    uso: [
      { pagina: 'Como funciona', rota: '/como-funciona', fundo: 'creme', variante: 'normal' },
      { pagina: 'Seja produtor', rota: '/seja-produtor', fundo: 'creme', variante: 'normal' },
    ],
  },
  { chave: 'passo-1-pedido', poster: 12, gatilho: 'manual', loop: false, invertida: 'gera', decorative: true, uso: NA_TRILHA('marrom') },
  { chave: 'passo-2-atribuicao', poster: 12, gatilho: 'manual', loop: false, invertida: 'gera', decorative: true, uso: NA_TRILHA('marrom') },
  { chave: 'passo-3-fornada', poster: 12, gatilho: 'manual', loop: false, invertida: 'gera', decorative: true, uso: NA_TRILHA('marrom') },
  { chave: 'passo-4-entrega', poster: 12, gatilho: 'manual', loop: false, invertida: 'gera', decorative: true, uso: NA_TRILHA('marrom') },
  {
    chave: 'selo-sanitario', poster: 14, gatilho: 'viewport', loop: false, invertida: 'gera', decorative: true,
    uso: [
      { pagina: 'Home', rota: '/', fundo: 'creme', variante: 'normal' },
      { pagina: 'Qualidade', rota: '/qualidade', fundo: 'marrom', variante: 'invertida' },
      { pagina: 'Seja produtor', rota: '/seja-produtor', fundo: 'creme', variante: 'normal' },
      { pagina: 'Como funciona', rota: '/como-funciona', fundo: 'creme', variante: 'normal' },
      // o selo ao lado da pergunta do formulário do produtor é o desenho estático (SeloSanitario variante="estatico")
      { pagina: 'Seja produtor', rota: '/seja-produtor', fundo: 'creme', variante: 'normal', player: false },
    ],
  },
  { chave: 'rota-entrega', poster: 30, gatilho: 'manual', loop: false, invertida: null, decorative: true, uso: [] },
  {
    chave: 'enviado-sucesso', poster: 18, gatilho: 'manual', loop: false, invertida: 'gera', decorative: true,
    uso: [
      { pagina: 'Para comércios', rota: '/para-comercios', fundo: 'creme', variante: 'normal' },
      { pagina: 'Seja produtor', rota: '/seja-produtor', fundo: 'creme', variante: 'normal' },
    ],
  },
  {
    chave: 'catalogo-vazio', poster: 15, gatilho: 'manual', loop: false, invertida: null, decorative: true,
    uso: [{ pagina: 'Produtos', rota: '/produtos', fundo: 'creme', variante: 'normal' }],
  },
  {
    chave: 'whatsapp-nudge', poster: 0, gatilho: 'manual', loop: false, invertida: null, decorative: true,
    uso: [{ pagina: 'Todas', rota: '*', fundo: 'marrom', variante: 'normal' }], // botão fixo de WhatsApp
  },
]

// ———————————————————— gravação ————————————————————
// Antes de gravar qualquer arquivo: todo uso aponta para variante que existe (senão, gerar a variante: invertida 'gera').
for (const { chave, invertida, uso } of CATALOGO) {
  for (const u of uso) {
    if (u.variante !== 'normal' && !(u.variante === 'invertida' && invertida)) {
      throw new Error(`${chave}: uso em ${u.pagina} (${u.rota}) pede variante "${u.variante}" sem arquivo; gere a variante antes de usar`)
    }
  }
}
mkdirSync(SAIDA, { recursive: true })
const manifest = {
  versao: 1,
  gerador: 'scripts/lottie-build.mjs',
  fr: FR,
  orcamentoKB: { porArquivo: 25, total: 150 },
  paleta: Object.values(HEX),
  curvas: Object.fromEntries(Object.entries(CURVAS).map(([n, [o, i]]) => [n, { o: { x: o[0], y: o[1] }, i: { x: i[0], y: i[1] } }])),
  totalKB: 0,
  animacoes: {},
}
let totalBytes = 0
const linhas = []

function gravar(nome, comp) {
  const texto = JSON.stringify(comp)
  writeFileSync(join(SAIDA, nome), texto)
  const bytes = Buffer.byteLength(texto)
  totalBytes += bytes
  linhas.push([nome, (bytes / 1024).toFixed(2)])
  return bytes
}

for (const item of CATALOGO) {
  const k = kit(false)
  const comp = DESENHO[item.chave](k)
  if (item.poster > k.ultimoKeyframe) throw new Error(`${item.chave}: posterFrame ${item.poster} depois do último keyframe`)
  const arquivo = `${item.chave}.json`
  const bytes = gravar(arquivo, comp)

  let arquivoInv = null
  let bytesInv = null
  if (item.invertida === 'gera') {
    arquivoInv = `${item.chave}-invertida.json`
    bytesInv = gravar(arquivoInv, DESENHO[item.chave](kit(true)))
  } else if (item.invertida === 'igual') {
    arquivoInv = arquivo
  }

  const fimEntrada = item.segmentos ? item.segmentos.entrada[1] - 1 : k.ultimoKeyframe
  const { chave, poster, gatilho, loop, decorative, uso, segmentos } = item
  const arquivos = { normal: arquivo, invertida: arquivoInv }
  manifest.animacoes[chave] = {
    arquivos,
    kb: { normal: Math.round((bytes / 1024) * 100) / 100, invertida: bytesInv == null ? null : Math.round((bytesInv / 1024) * 100) / 100 },
    invertidaIgualANormal: item.invertida === 'igual',
    largura: comp.w,
    altura: comp.h,
    fr: comp.fr,
    ip: comp.ip,
    op: comp.op,
    duracaoMs: Math.round((fimEntrada / FR) * 1000),
    posterFrame: poster,
    // ate é exclusivo, como no playSegments do lottie-web
    ...(segmentos && {
      segmentos: {
        entrada: { de: segmentos.entrada[0], ate: segmentos.entrada[1], ms: Math.round(((segmentos.entrada[1] - 1 - segmentos.entrada[0]) / FR) * 1000) },
        loop: { de: segmentos.loop[0], ate: segmentos.loop[1], ms: Math.round(((segmentos.loop[1] - segmentos.loop[0]) / FR) * 1000) },
      },
    }),
    gatilho,
    loop,
    curvas: k.curvas,
    decorative,
    uso,
  }
}
manifest.totalKB = Math.round((totalBytes / 1024) * 100) / 100
writeFileSync(join(SAIDA, 'manifest.json'), `${JSON.stringify(manifest, null, 2)}\n`)

console.log(`lottie-build → ${relative(RAIZ, SAIDA).replaceAll('\\', '/')}`)
for (const [nome, kb] of linhas) console.log(`  ${nome.padEnd(34)} ${kb.padStart(6)} KB`)
console.log(`  ${'TOTAL'.padEnd(34)} ${(totalBytes / 1024).toFixed(2).padStart(6)} KB  (${linhas.length} arquivos)`)
