<script setup>
/**
 * Trilha do comércio de Como funciona: os 4 passos em ordem numa faixa marrom, ligados por uma rota de pontos.
 * ≥ 1024: os 4 lado a lado; a rota corre na altura dos ícones, da borda de um ícone à do seguinte.
 * 768–1023: 2 × 2 em ordem (1 2 / 3 4); a rota faz um Z — 1 → 2 na altura dos ícones, desce pelo corredor à direita
 * do passo 2, atravessa o vão entre as linhas e desce até o ícone 3; 3 → 4 na altura dos ícones. O texto de cada
 * passo deixa livre o corredor da direita.
 * < 768: lista vertical, rota na faixa de 48 px à esquerda (x 24) e o conteúdo a partir de 48.
 * Cada passo: ícone no arco C com o Lottie do passo (variante do fundo escuro), numeral, título (h3) e texto; a lista
 * é um <ol>.
 * Sequência — ≥ 1024: io(passo 1, .3) dispara os Lottie em 0/120/240/360 ms e os trechos da rota (120–780 ms, curva
 * assa); < 1024: cada passo no próprio io(.3), numa fila de 120 ms, e o trecho até ele acende junto. Uma vez só.
 * Página já vista, reduzir movimento ou rolagem que saltou por cima: rota inteira e pôsteres, sem animar.
 * Slot `rodape`: a ação depois dos passos (o tom marrom chega ao BotaoMarca pelo BlocoRota).
 */
import { onBeforeUnmount, onMounted, ref } from 'vue'
import BlocoRota from '@/components/rota/BlocoRota.vue'
import RotaTracado from '@/components/rota/RotaTracado.vue'
import CabecalhoSecao from '@/components/secoes/CabecalhoSecao.vue'
import PassoRota from '@/components/secoes/PassoRota.vue'
import { PASSOS } from '@/data/passos'
import { ehDesktop } from '@/composables/useRota'
import { quandoRevelada } from '@/composables/useVeu'
import { usePaginaVista } from '@/composables/useVisita'
import { reduzirAgora, STAGGER } from '@/lib/motion'
import { observarUmaVez } from '@/lib/gatilho'

defineProps({
  cabecalho: { type: Object, required: true }, // { rotulo, titulo, sub }
  idTitulo: { type: String, required: true },
  costura: { type: Object, default: null }, // costura no topo (halo = tom do bloco de cima)
})

const FAIXA = 24 // x da rota no celular (centro da faixa de 48 px)
const FOLGA = 10 // distância entre a rota e o ícone
const rota = ref(null)
const p = PASSOS.map(() => ref(null))
const vista = usePaginaVista()
const soltos = []
const timers = []
let cancelar = null

// I = ícones, B = passos (relativos à faixa)
function pernas(R, RO, desktop, host) {
  const I = p.map((r) => R(r.value.icone()))
  const B = p.map((r) => R(r.value.$el))
  const horizontal = (a, b, delay, dur) => ({ pts: [[a.r + FOLGA, a.cy], [b.l - FOLGA, b.cy]], delay, dur })
  if (desktop) {
    return { legs: [0, 1, 2].map((k) => horizontal(I[k], I[k + 1], 120 + k * 220, 220)), pd: [] }
  }
  if (host.clientWidth >= 768) {
    // Z: do ícone 2 até o corredor da direita (o padding de 48 px do item, à direita do passo), desce até o meio do vão
    // entre as linhas e volta até o eixo do ícone 3
    const corredor = B[1].r + 24
    const vao = (Math.max(B[0].b, B[1].b) + Math.min(B[2].t, B[3].t)) / 2
    return {
      legs: [
        horizontal(I[0], I[1], 0, 300),
        { pts: [[I[1].r + FOLGA, I[1].cy], [corredor, I[1].cy], [corredor, vao], [I[2].cx, vao], [I[2].cx, I[2].t - FOLGA]], delay: 0, dur: 300 },
        horizontal(I[2], I[3], 0, 300),
      ],
      pd: [],
    }
  }
  return {
    legs: [
      { pts: [[FAIXA, B[0].t + 8], [FAIXA, B[1].t]], delay: 0, dur: 300 },
      { pts: [[FAIXA, B[1].t], [FAIXA, B[2].t]], delay: 0, dur: 300 },
      { pts: [[FAIXA, B[2].t], [FAIXA, B[3].b - 8]], delay: 0, dur: 300 },
    ],
    pd: [],
  }
}

const depois = (fn, ms) => timers.push(setTimeout(fn, Math.max(0, ms)))

function sequenciaDesktop() {
  rota.value?.ligar()
  p.forEach((r, i) => depois(() => r.value?.tocar(), i * STAGGER.passo))
}

// estado final sem animar
function final() {
  rota.value?.ligar(true)
  p.forEach((r) => r.value?.poster())
}

onMounted(() => {
  if (vista || reduzirAgora()) return final()
  cancelar = quandoRevelada(() => {
    if (ehDesktop()) return soltos.push(observarUmaVez(p[0].value.$el, { limiar: 0.3, entrar: sequenciaDesktop, passou: final }))
    // fila com ≥ 120 ms entre disparos; passo que já ficou acima da tela vai direto ao estado final
    let ultimo = 0
    p.forEach((r, i) =>
      soltos.push(
        observarUmaVez(r.value.icone(), {
          limiar: 0.3,
          entrar: () => {
            const agora = performance.now()
            const t = Math.max(agora, ultimo + STAGGER.passo)
            ultimo = t
            depois(() => {
              r.value?.tocar()
              if (i > 0) rota.value?.ligarPerna(i - 1)
            }, t - agora)
          },
          passou: () => {
            r.value?.poster()
            if (i > 0) rota.value?.ligarPerna(i - 1)
          },
        }),
      ),
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
    class="fc-tc"
    :brilho="{ forma: 'ellipse', pos: '50% 40%', alfa: 0.18, alcance: '65%' }"
    :costura="costura"
    :rotulado="idTitulo"
  >
    <div class="fc-g fc-tc__g">
      <div class="fc-tc__cab">
        <CabecalhoSecao :id="idTitulo" :nivel="2" :rotulo="cabecalho.rotulo" :titulo="cabecalho.titulo" :sub="cabecalho.sub" />
      </div>
      <ol class="fc-tc__passos">
        <li v-for="(passo, i) in PASSOS" :key="passo.numero" class="fc-tc__passo">
          <!-- ref por função: dentro de v-for, um ref de objeto viraria lista -->
          <PassoRota :ref="(c) => (p[i].value = c)" v-bind="passo" :total="PASSOS.length" empilhado />
        </li>
      </ol>
      <div v-if="$slots.rodape" class="fc-tc__rodape"><slot name="rodape" /></div>
    </div>
    <RotaTracado ref="rota" :pernas="pernas" gatilho="manual" />
  </BlocoRota>
</template>

<style scoped>
.fc-tc__g > * { position: relative; z-index: 2; } /* texto e ícones acima da rota */
/* celular: a rota corre na faixa de 48 px à esquerda; o conteúdo começa em 48 */
.fc-tc__cab, .fc-tc__passos, .fc-tc__rodape { padding-left: calc(var(--fc-faixa-rota) - var(--gut)); }
.fc-tc__passos { list-style: none; margin: 40px 0 0; padding-right: 0; display: grid; row-gap: 56px; }
.fc-tc__rodape { margin-top: 48px; }
/* tablet: 2 × 2 em ordem; o texto de cada passo deixa livre o corredor da direita (por onde desce a rota do Z) */
@media (min-width: 768px) {
  .fc-tc__cab, .fc-tc__passos, .fc-tc__rodape { padding-left: 0; }
  .fc-tc__passos { grid-template-columns: repeat(2, minmax(0, 1fr)); column-gap: 48px; row-gap: 72px; margin-top: 48px; }
  .fc-tc__passo { padding-right: 48px; }
}
/* desktop: os 4 lado a lado, a rota na altura dos ícones */
@media (min-width: 1024px) {
  .fc-tc__cab { grid-column: 2 / 10; }
  .fc-tc__passos { grid-template-columns: repeat(4, minmax(0, 1fr)); column-gap: var(--gap); row-gap: 0; margin-top: 56px; }
  .fc-tc__passo { padding-right: 0; }
  .fc-tc__rodape { margin-top: 56px; }
}
</style>
