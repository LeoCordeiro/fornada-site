<script setup>
/**
 * Itens como paradas de uma rota — NÃO é grade de cartões: sem caixa, sem borda; a rota é
 * a estrutura. Desktop: linha horizontal de pontos M ligando ArcoC 64 (abertura à direita), título h3 e texto sob
 * cada parada. Celular: rota vertical ligando ArcoC 48 empilhados, texto ao lado. `numerada`: numeral Fraunces 700
 * dentro do arco (Para comércios). Movimento: desktop io(.3) 200 ms por trecho; celular cada
 * trecho acende quando a parada seguinte entra. `estatica` (Qualidade): rota já acesa, sem animação.
 */
import { onBeforeUnmount, onMounted, ref } from 'vue'
import ArcoC from '@/components/marca/ArcoC.vue'
import RotaTracado from '@/components/rota/RotaTracado.vue'
import { ehDesktop } from '@/composables/useRota'
import { quandoRevelada } from '@/composables/useVeu'
import { usePaginaVista } from '@/composables/useVisita'
import { provideTom, useTom } from '@/composables/useTom'
import { reduzirAgora, STAGGER } from '@/lib/motion'
import { observarUmaVez } from '@/lib/gatilho'

const props = defineProps({
  itens: { type: Array, required: true }, // [{ titulo, texto }]
  tom: { type: String, default: '' },
  numerada: { type: Boolean, default: false },
  estatica: { type: Boolean, default: false },
  nivel: { type: Number, default: 3 },
})

const { tom } = useTom(props)
provideTom(tom)
const lista = ref(null)
const rota = ref(null)
const vista = usePaginaVista()
const soltos = []
const timers = []
let cancelar = null
const dois = (n) => String(n).padStart(2, '0')

function pernas(R, RO, desktop, host) {
  const arcos = [...host.querySelectorAll('.fc-paradas__arco')].map(R)
  const legs = []
  for (let i = 1; i < arcos.length; i++) {
    const a = arcos[i - 1]
    const b = arcos[i]
    legs.push(
      desktop
        ? { pts: [[a.r + 14, a.cy], [b.l - 14, b.cy]], delay: (i - 1) * 200, dur: 200 }
        : { pts: [[a.cx, a.b + 14], [b.cx, b.t - 14]], delay: 0, dur: 200 },
    )
  }
  return { legs, pd: [] }
}

onMounted(() => {
  if (props.estatica || vista || reduzirAgora()) return rota.value?.ligar(true)
  cancelar = quandoRevelada(() => {
    const itens = [...lista.value.querySelectorAll('.fc-paradas__item')]
    if (ehDesktop()) return soltos.push(observarUmaVez(itens[0], { limiar: 0.3, entrar: () => rota.value?.ligar(), passou: () => rota.value?.ligar(true) }))
    let ultimo = 0
    itens.forEach((el, i) => {
      if (i === 0) return
      soltos.push(
        observarUmaVez(el, {
          limiar: 0.3,
          entrar: () => {
            const agora = performance.now()
            const t = Math.max(agora, ultimo + STAGGER.passo)
            ultimo = t
            timers.push(setTimeout(() => rota.value?.ligarPerna(i - 1), t - agora))
          },
          passou: () => rota.value?.ligarPerna(i - 1),
        }),
      )
    })
  })
})
onBeforeUnmount(() => {
  soltos.forEach((f) => f())
  timers.forEach(clearTimeout)
  cancelar?.()
})
</script>

<template>
  <div class="fc-paradas">
    <ol ref="lista" class="fc-paradas__lista" :style="{ '--fc-n': itens.length }">
      <li v-for="(item, i) in itens" :key="item.titulo" class="fc-paradas__item">
        <span class="fc-paradas__arco" aria-hidden="true">
          <ArcoC :tamanho="64" class="fc-paradas__arco-largo"><span v-if="numerada" class="fc-paradas__num">{{ dois(i + 1) }}</span></ArcoC>
          <ArcoC :tamanho="48" class="fc-paradas__arco-curto"><span v-if="numerada" class="fc-paradas__num">{{ dois(i + 1) }}</span></ArcoC>
        </span>
        <div class="fc-paradas__texto">
          <component :is="`h${nivel}`" class="fc-h3">{{ item.titulo }}</component>
          <p v-if="item.texto" class="fc-txt fc-corpo">{{ item.texto }}</p>
        </div>
      </li>
    </ol>
    <RotaTracado ref="rota" :pernas="pernas" gatilho="manual" />
  </div>
</template>

<style>
.fc-paradas { position: relative; }
.fc-paradas__lista { list-style: none; margin: 0; padding: 0; display: grid; gap: 32px; }
.fc-paradas__item { display: grid; grid-template-columns: 48px minmax(0, 1fr); column-gap: 16px; align-items: start; align-content: start; } /* item esticado pela linha não desce o título */
.fc-paradas__arco { display: block; position: relative; z-index: 2; width: 48px; height: 48px; }
.fc-paradas__arco-largo { display: none !important; }
.fc-paradas__texto { display: grid; gap: 8px; padding-top: 8px; }
.fc-paradas__num { font-family: var(--fc-ff-titulo); font-weight: 700; font-size: 14px; line-height: 1; font-variant-numeric: tabular-nums lining-nums; }
@media (min-width: 1024px) {
  .fc-paradas__lista { grid-template-columns: repeat(var(--fc-n), minmax(0, 1fr)); gap: var(--gap); }
  .fc-paradas__item { grid-template-columns: minmax(0, 1fr); row-gap: 20px; }
  .fc-paradas__arco { width: 64px; height: 64px; }
  .fc-paradas__arco-largo { display: inline-block !important; }
  .fc-paradas__arco-curto { display: none !important; }
  .fc-paradas__texto { padding-top: 0; padding-right: 24px; }
  .fc-paradas__num { font-size: 18px; }
}
</style>
