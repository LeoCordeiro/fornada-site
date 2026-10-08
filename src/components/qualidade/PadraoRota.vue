<script setup>
/**
 * Como o padrão é mantido — bloco MARROM: as 3 etapas são paradas de uma rota vertical
 * que acende por rolagem, com o mesmo motor da trilha do produtor (Como funciona): o trecho k−1→k acende em
 * 300 ms assa quando a parada k cruza 65 % da tela (linha65) e nunca apaga. Paradas = arco C (64 · 48 no celular)
 * com o número dentro, estáticas: a rota chega a elas. O limite da conferência ("não é análise de laboratório")
 * fica ao lado no desktop e embaixo no celular — é o que impede a página de prometer mais do que a conferência faz.
 * Reduzir movimento ou página já vista: rota inteira desde o início.
 */
import { onBeforeUnmount, onMounted, ref } from 'vue'
import BlocoRota from '@/components/rota/BlocoRota.vue'
import RotaTracado from '@/components/rota/RotaTracado.vue'
import CabecalhoSecao from '@/components/secoes/CabecalhoSecao.vue'
import ArcoC from '@/components/marca/ArcoC.vue'
import { quandoRevelada } from '@/composables/useVeu'
import { usePaginaVista } from '@/composables/useVisita'
import { COSTURA, reduzirAgora } from '@/lib/motion'
import { observarUmaVez } from '@/lib/gatilho'
import { PADRAO as P } from './conteudo'

defineProps({
  costura: { type: Object, default: null },
})

const PERNA = 300
const lista = ref(null)
const rota = ref(null)
const vista = usePaginaVista()
const soltos = []
let cancelar = null
const dois = (n) => String(n).padStart(2, '0')
const marcas = () => [...(lista.value?.querySelectorAll('.padrao__marca') ?? [])]

function pernas(R) {
  const M = marcas().map(R)
  const legs = []
  for (let k = 1; k < M.length; k++) legs.push({ pts: [[M[k - 1].cx, M[k - 1].b + 14], [M[k].cx, M[k].t - 14]], delay: 0, dur: PERNA })
  return { legs, pd: [] }
}

onMounted(() => {
  if (vista || reduzirAgora()) return rota.value?.ligar(true)
  cancelar = quandoRevelada(() => {
    const margemBaixo = COSTURA.rootMargin.split(' ')[2]
    marcas().forEach((el, k) => {
      if (k === 0) return
      soltos.push(observarUmaVez(el, { margemBaixo, entrar: () => rota.value?.ligarPerna(k - 1), passou: () => rota.value?.ligarPerna(k - 1) }))
    })
  })
})
onBeforeUnmount(() => {
  soltos.forEach((f) => f())
  cancelar?.()
})
</script>

<template>
  <BlocoRota tom="marrom" :costura="costura" rotulado="padrao-titulo" class="padrao" :brilho="{ forma: 'ellipse', pos: '20% 60%', alfa: 0.16, alcance: '55%' }">
    <div class="fc-g padrao__grade">
      <CabecalhoSecao id="padrao-titulo" class="padrao__cab" :rotulo="P.rotulo" :titulo="P.titulo" />
      <div class="padrao__caminho">
        <ol ref="lista" class="padrao__lista">
          <li v-for="(e, i) in P.etapas" :key="e.titulo" class="padrao__item">
            <span class="padrao__marca" aria-hidden="true">
              <ArcoC :tamanho="64" class="padrao__arco padrao__arco--largo"><span class="padrao__num">{{ dois(i + 1) }}</span></ArcoC>
              <ArcoC :tamanho="48" class="padrao__arco padrao__arco--curto"><span class="padrao__num">{{ dois(i + 1) }}</span></ArcoC>
            </span>
            <div class="padrao__texto">
              <h3 class="fc-h3">{{ e.titulo }}</h3>
              <p class="fc-txt fc-corpo">{{ e.texto }}</p>
            </div>
          </li>
        </ol>
        <RotaTracado ref="rota" :pernas="pernas" gatilho="manual" />
      </div>
      <p class="fc-txt fc-corpo padrao__limite">{{ P.limite }}</p>
    </div>
  </BlocoRota>
</template>

<style scoped>
.padrao__caminho { position: relative; margin-top: 40px; }
.padrao__lista { list-style: none; margin: 0; padding: 0; display: grid; gap: 40px; }
.padrao__item { display: grid; grid-template-columns: 48px minmax(0, 1fr); column-gap: 20px; align-items: start; }
.padrao__marca { position: relative; z-index: 2; display: block; width: 48px; height: 48px; }
.padrao__arco--largo { display: none !important; }
.padrao__num { font-family: var(--fc-ff-titulo); font-weight: 700; font-size: 14px; line-height: 1; font-variant-numeric: tabular-nums lining-nums; }
.padrao__texto { display: grid; gap: 8px; padding-top: 8px; }
.padrao__limite { margin-top: 48px; padding-top: 24px; border-top: 1px solid var(--fc-linha); }
@media (min-width: 1024px) {
  .padrao__grade { grid-template-rows: auto 1fr; }
  .padrao__cab { grid-column: 2 / 10; }
  .padrao__caminho { grid-column: 2 / 9; margin-top: 56px; }
  .padrao__lista { gap: 56px; }
  .padrao__item { grid-template-columns: 64px minmax(0, 1fr); column-gap: 28px; }
  .padrao__marca { width: 64px; height: 64px; }
  .padrao__arco--largo { display: inline-block !important; }
  .padrao__arco--curto { display: none !important; }
  .padrao__num { font-size: 18px; }
  .padrao__texto { padding-top: 10px; }
  /* o limite fica ao lado das paradas, alinhado à 1ª, com fio à esquerda */
  .padrao__limite { grid-column: 10 / 14; grid-row: 2; align-self: start; margin-top: 56px; padding: 4px 0 4px 24px; border-top: 0; border-left: 1px solid var(--fc-linha); }
}
</style>
