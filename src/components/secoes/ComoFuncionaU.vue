<script setup>
/**
 * O U entre o comércio e a rede.
 * Faixa creme "No seu comércio" (passos 1 e 4) e faixa marrom "Na rede Fornada Conecta" (passos 2 e 3), fundos de
 * ponta a ponta. Uma rota 1 → costura → 2 → 3 → costura → 4 com duas paradas; `rota-entrega` sob o passo 4.
 * Sequência: desktop — io(passo 1, .3): passos em 0/120/240/360, pernas 120–780,
 * rota-entrega em 760; celular — cada passo no próprio io(.3) numa fila de 120 ms, e o trecho k→k+1 acende quando
 * o passo k+1 dispara; rota-entrega 400 ms depois do passo 4. Página já vista / RM: tudo no estado final.
 * No desktop o U termina no MARROM; no celular termina no CREME (passo 4) — o bloco seguinte decide a costura.
 * Slot `rodape`: o fundo troca com a largura (creme no celular, marrom no desktop) e o BotaoMarca decide claro/escuro
 * por JS, não por largura — ali use texto em `.fc-link .fc-link--acao` (segue a tinta da faixa) ou `BotaoMarca
 * variante="ouro" tom="marrom"`; contorno ficaria marrom sobre marrom no desktop.
 */
import { onBeforeUnmount, onMounted, ref } from 'vue'
import PassoRota from './PassoRota.vue'
import CabecalhoSecao from './CabecalhoSecao.vue'
import RotaTracado from '@/components/rota/RotaTracado.vue'
import RotaDivisa from '@/components/rota/RotaDivisa.vue'
import BrandLottie from '@/components/marca/BrandLottie.vue'
import { CABECALHO_PASSOS, PASSOS } from '@/data/passos'
import { ehDesktop } from '@/composables/useRota'
import { quandoRevelada } from '@/composables/useVeu'
import { usePaginaVista } from '@/composables/useVisita'
import { reduzirAgora, STAGGER } from '@/lib/motion'
import { observarUmaVez } from '@/lib/gatilho'

const props = defineProps({
  cabecalho: { type: Object, default: () => CABECALHO_PASSOS }, // { rotulo, titulo, sub } (ou slot `cabecalho`)
  nivelTitulo: { type: Number, default: 2 },
  id: { type: String, default: undefined },
  idTitulo: { type: String, default: 'como-funciona-titulo' },
  costura: { type: Object, default: null }, // costura no topo (halo = tom do bloco de cima)
})

const secao = ref(null)
const rota = ref(null)
const p = [ref(null), ref(null), ref(null), ref(null)] // na ordem 1, 2, 3, 4
const rotaEntrega = ref(null)
const vista = usePaginaVista()
const soltos = []
let cancelar = null
const timers = []

// rota medida; I = ícones, B = passos, m = faixa marrom
function pernas(R, RO, desktop, host) {
  const I = p.map((r) => R(r.value.icone()))
  const B = p.map((r) => R(r.value.$el))
  const m = R(host.querySelector('.fc-u__m'))
  const s1 = m.t
  const s2 = m.b
  const CR = 'creme'
  const MR = 'marrom'
  if (desktop) {
    const yJ = s1 - 66
    const yB = Math.max(B[1].b, B[2].b) + 12
    return {
      legs: [
        { pts: [[I[0].cx, I[0].b + 10], [I[0].cx, yJ], [I[1].cx, yJ], [I[1].cx, I[1].t - 10]], delay: 120, dur: 220 },
        { pts: [[I[1].cx, I[1].b + 10], [I[1].cx, yB], [I[2].cx, yB], [I[2].cx, I[2].b + 10]], delay: 340, dur: 220 },
        { pts: [[I[2].cx, I[2].t - 10], [I[2].cx, yJ], [I[3].cx, yJ], [I[3].cx, I[3].b + 10]], delay: 560, dur: 220 },
      ],
      pd: [{ x: I[1].cx, y: s1, halo: CR }, { x: I[2].cx, y: s1, halo: CR }],
    }
  }
  const x = R(host.querySelector('.fc-u__cab')).l + 4
  return {
    // no celular cada trecho acende sozinho (quando o passo seguinte dispara): atraso 0 dentro do trecho
    legs: [
      { pts: [[x, B[0].t + 8], [x, B[1].t]], delay: 0, dur: 300 },
      { pts: [[x, B[1].t], [x, B[2].t]], delay: 0, dur: 300 },
      { pts: [[x, B[2].t], [x, B[3].b - 8]], delay: 0, dur: 300 },
    ],
    pd: [{ x, y: s1, halo: CR }, { x, y: s2, halo: MR }],
  }
}

const depois = (fn, ms) => timers.push(setTimeout(fn, ms))

function sequenciaDesktop() {
  rota.value?.ligar()
  p.forEach((r, i) => depois(() => r.value?.tocar(), i * STAGGER.passo))
  depois(() => rotaEntrega.value?.play(), 760)
}

// estado final sem animar: página já vista, RM ou rolagem que saltou por cima
function final() {
  rota.value?.ligar(true)
  p.forEach((r) => r.value?.poster())
  rotaEntrega.value?.poster()
}

onMounted(() => {
  if (vista || reduzirAgora()) return final()
  cancelar = quandoRevelada(() => {
    if (ehDesktop()) return soltos.push(observarUmaVez(p[0].value.$el, { limiar: 0.3, entrar: sequenciaDesktop, passou: final }))
    // celular: fila com ≥ 120 ms entre disparos; passo que já ficou acima da tela vai direto ao estado final
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
              if (i === 3) depois(() => rotaEntrega.value?.play(), 400)
            }, t - agora)
          },
          passou: () => {
            r.value?.poster()
            if (i > 0) rota.value?.ligarPerna(i - 1)
            if (i === 3) rotaEntrega.value?.poster()
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
  <section ref="secao" :id="id" class="fc-u" :class="{ 'fc-pede-respiro': costura }" :aria-labelledby="idTitulo">
    <RotaDivisa v-if="costura" v-bind="costura" />
    <!-- Faixas = ancestrais reais do texto (subgrid): o fundo efetivo de cada texto é o da faixa -->
    <div class="fc-g fc-u__grade">
      <div class="fc-u__faixa fc-u__c1 fc-tom fc-tom--creme">
        <div class="fc-u__cab">
          <slot name="cabecalho">
            <CabecalhoSecao :id="idTitulo" :nivel="nivelTitulo" :rotulo="cabecalho.rotulo" :titulo="cabecalho.titulo" :sub="cabecalho.sub" />
          </slot>
        </div>
        <p class="fc-rot fc-u__rc">{{ CABECALHO_PASSOS.faixaComercio }}</p>
        <PassoRota :ref="p[0]" class="fc-u__p1" v-bind="PASSOS[0]" tom="creme" />
      </div>
      <div class="fc-u__faixa fc-u__m fc-tom fc-tom--marrom">
        <p class="fc-rot fc-u__rm">{{ CABECALHO_PASSOS.faixaRede }}</p>
        <PassoRota :ref="p[1]" class="fc-u__p2" v-bind="PASSOS[1]" tom="marrom" />
        <PassoRota :ref="p[2]" class="fc-u__p3" v-bind="PASSOS[2]" tom="marrom" />
      </div>
      <div class="fc-u__faixa fc-u__c2 fc-tom fc-tom--creme">
        <PassoRota :ref="p[3]" class="fc-u__p4" v-bind="PASSOS[3]" tom="creme">
          <template #extra>
            <div class="fc-u__entrega" aria-hidden="true">
              <BrandLottie ref="rotaEntrega" name="rota-entrega" trigger="manual" fluido />
            </div>
          </template>
        </PassoRota>
      </div>
      <div v-if="$slots.rodape" class="fc-u__faixa fc-u__pe fc-tom">
        <div class="fc-u__rodape"><slot name="rodape" /></div>
      </div>
    </div>
    <RotaTracado ref="rota" :pernas="pernas" gatilho="manual" />
  </section>
</template>

<style>
.fc-u { position: relative; overflow-x: clip; }
.fc-u__grade { row-gap: 0; }
.fc-u__faixa {
  display: grid;
  grid-column: full-start / full-end;
  grid-template-columns: subgrid;
  grid-template-rows: subgrid;
}
.fc-u__faixa > * { grid-column: c-start / c-end; min-width: 0; position: relative; z-index: 2; }
.fc-u__c1, .fc-u__c2 { background: var(--fc-ruido-c), var(--fc-creme); background-color: var(--fc-creme); }
.fc-u__m {
  background: var(--fc-ruido-e), radial-gradient(ellipse at 50% 55%, color-mix(in srgb, var(--fc-dourado) 20%, transparent), transparent 62%), var(--fc-marrom);
  background-color: var(--fc-marrom);
}
/* rodapé da seção: creme no celular (depois do passo 4), marrom no desktop (o U termina na faixa marrom) */
.fc-u__pe { --fc-tinta: var(--fc-marrom); --fc-foco: var(--fc-marrom); color: var(--fc-marrom); background: var(--fc-ruido-c), var(--fc-creme); background-color: var(--fc-creme); }

/* celular: rota em x 24, o conteúdo começa em 48.
   Linhas da grade: c1 = 1–3 (cabeçalho, "No seu comércio", passo 1) · m = 4–6 ("Na rede", passos 2 e 3) ·
   c2 = 7 (passo 4) · pe = 8 (rodapé). Desktop: c1 = 1–3, c2 = linha 3 nas cols 9–12, m = 4–5, pe = 6. */
.fc-u__c1 { grid-row: 1 / 4; }
.fc-u__m { grid-row: 4 / 7; }
.fc-u__c2 { grid-row: 7; }
.fc-u__pe { grid-row: 8; }
.fc-u__cab { grid-row: 1; margin-top: var(--fc-secao); }
.fc-u__rc { grid-row: 2; margin-top: 56px; padding-left: 48px; }
.fc-u__p1 { grid-row: 3; margin: 20px 0 72px; padding-left: 48px; }
.fc-u__rm { grid-row: 1; margin-top: 72px; padding-left: 48px; }
.fc-u__p2 { grid-row: 2; margin: 28px 0 40px; padding-left: 48px; }
.fc-u__p3 { grid-row: 3; margin: 0 0 72px; padding-left: 48px; }
.fc-u__p4 { grid-row: 1; margin: 72px 0 var(--fc-respiro-rota); padding-left: 48px; }
.fc-u__rodape { grid-row: 1; padding: 0 0 var(--fc-respiro-rota) 48px; }
.fc-u__pe { margin-top: calc(var(--fc-respiro-rota) * -1 + 24px); } /* com rodapé, o passo 4 não precisa do respiro todo */
.fc-u__entrega { width: 100%; max-width: 300px; margin-top: 20px; }

@media (min-width: 1024px) {
  .fc-u__c2 { grid-row: 3; grid-column: 10 / 14; }
  .fc-u__m { grid-row: 4 / 6; }
  .fc-u__pe { grid-row: 6; --fc-tinta: var(--fc-creme); --fc-foco: var(--fc-creme); color: var(--fc-creme); background: var(--fc-ruido-e), var(--fc-marrom); background-color: var(--fc-marrom); }
  .fc-u__cab { grid-column: 2 / 10; }
  .fc-u__rc { grid-column: 2 / 6; padding-left: 0; }
  .fc-u__p1 { grid-column: 2 / 6; margin: 28px 0 112px; padding-left: 0; }
  .fc-u__c2 > .fc-u__p4 { grid-column: 1 / -1; margin: 28px 0 112px; padding-left: 0; }
  .fc-u__rm { grid-column: 5 / 9; padding-left: 0; }
  .fc-u__p2 { grid-row: 2; grid-column: 3 / 7; margin: 40px 0 112px; padding-left: 0; }
  .fc-u__p3 { grid-row: 2; grid-column: 9 / 13; margin: 40px 0 112px; padding-left: 0; }
  .fc-u__pe { margin-top: 0; }
  .fc-u__rodape { grid-column: 2 / 10; padding: 0 0 var(--fc-respiro-rota); margin-top: -64px; }
}
</style>
