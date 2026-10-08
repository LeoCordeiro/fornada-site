<script setup>
/**
 * Como funciona da Início: a única faixa marrom do conteúdo, de borda a borda, e a única rota da
 * página antes do rodapé. A rota entra 66 px acima da divisa de cima (no respiro da seção 2), passa pela parada da
 * divisa, desce pelos 4 pontos L dos passos, sai pela parada da divisa de baixo e termina 66 px dentro da seção 4 —
 * a vertical dos três pontos da logo, prolongada. Eixo: centro da coluna 7 (≥ 1024), centro da coluna 1 da grade de
 * 8 (tablet) e x 24 (celular, o texto a partir de 48). O x sai do próprio ponto L: rota e pontos nunca descolam.
 * Passos: `ol` com 4 `li`; numeral e rota com aria-hidden; "Passo N de 4:" em sr-only; título de data/passos e uma
 * frase curta da Home (conteudo.COMO). Os pontos L não animam: a rota chega até eles.
 * Movimento — desktop: io(faixa, .3) acende a entrada 0–300 e os trechos 300–500/500–700/700–900 (assa); a saída
 * (400 ms) espera a divisa de baixo cruzar 65 % da tela. Celular: cada ponto no próprio io(.3), numa fila de 120 ms,
 * e o trecho até ele acende junto. Página já vista, reduzir movimento ou rolagem que saltou: a rota inteira, parada.
 */
import { onBeforeUnmount, onMounted, ref } from 'vue'
import BlocoRota from '@/components/rota/BlocoRota.vue'
import RotaTracado from '@/components/rota/RotaTracado.vue'
import { PASSOS } from '@/data/passos'
import { ehDesktop } from '@/composables/useRota'
import { quandoRevelada } from '@/composables/useVeu'
import { usePaginaVista } from '@/composables/useVisita'
import { COSTURA, reduzirAgora, STAGGER } from '@/lib/motion'
import { observarUmaVez } from '@/lib/gatilho'
import { COMO } from './conteudo'

const ALCANCE = 66 // perna além da divisa (= --fc-costura-alcance)
const rota = ref(null)
const pontos = ref([])
const fim = ref(null)
const vista = usePaginaVista()
const soltos = []
const timers = []
let cancelar = null

// pernas: 0 = entrada (divisa de cima → ponto 1) · 1–3 = ponto k → k+1 · 4 = saída (ponto 4 → divisa de baixo + 66)
function pernas(R, RO, desktop, host) {
  const P = pontos.value.map((el) => R(el))
  const x = P[0].cx
  const y = P.map((p) => p.cy)
  const s2 = host.offsetHeight
  const d = desktop
  return {
    legs: [
      { pts: [[x, -ALCANCE], [x, y[0]]], delay: 0, dur: 300 },
      { pts: [[x, y[0]], [x, y[1]]], delay: d ? 300 : 0, dur: d ? 200 : 300 },
      { pts: [[x, y[1]], [x, y[2]]], delay: d ? 500 : 0, dur: d ? 200 : 300 },
      { pts: [[x, y[2]], [x, y[3]]], delay: d ? 700 : 0, dur: d ? 200 : 300 },
      { pts: [[x, y[3]], [x, s2 + ALCANCE]], delay: 0, dur: 400 },
    ],
    pd: [{ x, y: 0, halo: 'creme' }, { x, y: s2, halo: 'marrom' }],
  }
}

const acender = (i) => rota.value?.ligarPerna(i)
const depois = (fn, ms) => timers.push(setTimeout(fn, Math.max(0, ms)))
const final = () => rota.value?.ligar(true)

onMounted(() => {
  if (vista || reduzirAgora()) return final()
  cancelar = quandoRevelada(() => {
    const secao = fim.value?.parentElement
    // saída: a divisa de baixo cruzando 65 % da tela (linha65), nunca antes do último trecho de cima
    let prontoSaida = 0 // instante (performance.now) em que o trecho até o ponto 4 termina; 0 = ainda não começou
    let pediuSaida = false
    const sair = () => {
      if (!pediuSaida || !prontoSaida) return
      depois(() => acender(4), prontoSaida - performance.now())
    }
    soltos.push(observarUmaVez(fim.value, {
      margemBaixo: COSTURA.rootMargin.split(' ')[2],
      entrar: () => ((pediuSaida = true), sair()),
      passou: () => ((pediuSaida = true), sair()),
    }))
    if (ehDesktop()) {
      soltos.push(observarUmaVez(secao, {
        limiar: 0.3,
        entrar: () => {
          ;[0, 1, 2, 3].forEach(acender)
          prontoSaida = performance.now() + 900
          sair()
        },
        passou: final,
      }))
      return
    }
    // celular e tablet: fila com ≥ 120 ms entre os pontos; o trecho até o ponto acende com ele
    let ultimo = 0
    pontos.value.forEach((el, i) =>
      soltos.push(observarUmaVez(el, {
        limiar: 0.3,
        entrar: () => {
          const agora = performance.now()
          const t = Math.max(agora, ultimo + STAGGER.passo)
          ultimo = t
          depois(() => acender(i), t - agora)
          if (i === 3) {
            prontoSaida = t + 300
            sair()
          }
        },
        passou: () => {
          acender(i)
          if (i === 3) {
            prontoSaida = performance.now()
            sair()
          }
        },
      })),
    )
  })
})
onBeforeUnmount(() => {
  soltos.forEach((f) => f())
  timers.forEach(clearTimeout)
  cancelar?.()
})
</script>

<template>
  <BlocoRota
    tom="marrom"
    class="fc-fio"
    :brilho="{ forma: 'ellipse', pos: '53% 50%', alfa: 0.2, alcance: '62%' }"
    :pad="{ topo: 'var(--fc-respiro-rota)', base: 'var(--fc-respiro-rota)' }"
    rotulado="como-titulo"
  >
    <div class="fc-g fc-fio__g">
      <div class="fc-fio__cab">
        <h2 id="como-titulo" class="fc-h2 fc-fio__titulo">{{ COMO.titulo.l1 }}<br class="fc-fio__quebra" /> {{ COMO.titulo.l2 }}</h2>
        <p class="fc-clg fc-txt fc-corpo fc-fio__sub">{{ COMO.sub }}</p>
      </div>
      <ol class="fc-fio__passos">
        <li v-for="(p, i) in PASSOS" :key="p.numero" class="fc-fio__passo">
          <span :ref="(el) => (pontos[i] = el)" class="fc-fio__ponto" aria-hidden="true" />
          <div class="fc-fio__item">
            <span class="fc-fio__num" aria-hidden="true">{{ String(p.numero).padStart(2, '0') }}</span>
            <h3 class="fc-h3 fc-fio__nome"><span class="fc-sr">Passo {{ p.numero }} de {{ PASSOS.length }}: </span>{{ p.titulo }}</h3>
            <p class="fc-corpo fc-fio__frase">{{ COMO.frases[i] }}</p>
          </div>
        </li>
      </ol>
      <p class="fc-fio__link">
        <router-link :to="COMO.link.to" class="fc-link fc-link--acao">{{ COMO.link.rotulo }}</router-link>
      </p>
    </div>
    <span ref="fim" class="fc-fio__fim" aria-hidden="true" />
    <RotaTracado ref="rota" :pernas="pernas" gatilho="manual" />
  </BlocoRota>
</template>

<style scoped>
.fc-fio__g > * { position: relative; z-index: 2; } /* texto e pontos L acima da rota */
.fc-fio__quebra { display: none; }
.fc-fio__sub { margin-top: 16px; }
.fc-fio__passos { list-style: none; margin: 40px 0 0; padding: 0; }
/* celular: a faixa da rota é a coluna de 48 px à esquerda (x 24); o texto começa em 48 */
.fc-fio__cab, .fc-fio__link { padding-left: calc(var(--fc-faixa-rota) - var(--gut)); }
.fc-fio__passos { grid-column: full-start / c-end; }
/* celular: 112 px entre os centros dos pontos; passo de texto longo (frase em 3 linhas) cresce e guarda 24 px */
.fc-fio__passo { display: grid; grid-template-columns: var(--fc-faixa-rota) minmax(0, 1fr); align-items: start; min-height: 112px; padding-bottom: 24px; }
.fc-fio__passo:last-child { min-height: 0; padding-bottom: 0; }
/* ponto L: 16 px creme sobre a rota, com 6 px de folga marrom (esconde o ponto M que cai embaixo dele) */
.fc-fio__ponto {
  grid-column: 1;
  justify-self: center;
  width: 16px;
  height: 16px;
  margin-top: 6px;
  border-radius: 50%;
  background: var(--fc-creme);
  box-shadow: 0 0 0 6px var(--fc-marrom);
}
.fc-fio__item { grid-column: 2; display: grid; grid-template-columns: auto minmax(0, 1fr); column-gap: 12px; align-items: baseline; }
.fc-fio__num {
  grid-row: 1;
  font-family: var(--fc-ff-titulo);
  font-weight: 300;
  font-size: 28px;
  line-height: 1;
  letter-spacing: -.02em;
  font-variation-settings: "SOFT" 100;
  font-variant-numeric: tabular-nums lining-nums;
  color: var(--fc-creme-2);
}
.fc-fio__nome { grid-row: 1; grid-column: 2; font-size: 24px; color: var(--fc-creme); }
.fc-fio__frase { grid-row: 2; grid-column: 2; margin-top: 4px; }
.fc-fio__link { margin-top: 24px; }
.fc-fio__fim { position: absolute; left: 0; right: 0; bottom: 0; height: 1px; pointer-events: none; }

/* tablet: a rota no centro da coluna 1 da grade de 8; o texto nas colunas 2–8 */
@media (min-width: 768px) {
  .fc-fio__cab, .fc-fio__link { grid-column: 3 / 10; padding-left: 0; }
  /* ≥ 768 o passo é uma linha da grade e todas têm a altura da maior (1fr): o passo entre os pontos fica igual
     (112 no tablet, 128 no desktop — a frase de 2 linhas não cabe em 112 com folga) */
  .fc-fio__passos { grid-column: 2 / 10; display: grid; grid-template-columns: subgrid; grid-auto-rows: 1fr; }
  .fc-fio__passo { grid-column: 1 / -1; grid-template-columns: subgrid; }
  .fc-fio__item { grid-column: 2 / -1; }
}
/* desktop: cabeçalho e link nas colunas 1–6, a rota no centro da coluna 7, os passos nas colunas 8–12 */
@media (min-width: 1024px) {
  .fc-fio__quebra { display: inline; }
  .fc-fio__g { grid-template-rows: auto 1fr; }
  .fc-fio__cab { grid-column: 2 / 8; grid-row: 1; }
  /* o link desce para o fim da linha 2, na altura do passo 4 — vira a saída da sequência que a rota acabou de
     percorrer, e o vazio embaixo dele some (o título abre a faixa na altura do passo 1, o link fecha no passo 4) */
  .fc-fio__link { grid-column: 2 / 8; grid-row: 2; align-self: end; margin-top: 24px; }
  .fc-fio__passos { grid-column: 8 / 14; grid-row: 1 / 3; margin-top: 0; }
  .fc-fio__passo { min-height: 128px; }
  .fc-fio__ponto { margin-top: 12px; }
  .fc-fio__item { column-gap: 16px; }
  .fc-fio__num { font-size: 40px; }
}
</style>
