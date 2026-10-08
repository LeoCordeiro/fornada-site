<script setup>
/**
 * A rota longa que liga peças medidas (ícone → CTA, passo → passo, selo → lista). Porta de render()/desenhar()
 * com a geometria de lib/rota.js. Fica absoluta no HOST = o elemento pai (precisa de
 * position: relative). Cada seção mantém a SUA função `pernas` no próprio arquivo.
 *
 * pernas(R, RO, desktop, host) → { legs: [{ pts: [[x,y],…], delay, dur }], pd: [{ x, y, halo: 'creme'|'marrom'|'profundo' }] }
 *   R(el)  = retângulo relativo ao host (getBoundingClientRect)  ·  RO(el) = idem por offset (ignora transform)
 */
import { ref, useId } from 'vue'
import { PARADA_D } from '@/lib/rota'
import { useRota } from '@/composables/useRota'

const props = defineProps({
  pernas: { type: Function, required: true },
  gatilho: { type: String, default: 'viewport', validator: (v) => ['viewport', 'manual', 'monta'].includes(v) },
  limiar: { type: Number, default: 0.2 },
})

const svg = ref(null)
const uid = `fc-rota-${useId()}`.replace(/[^a-zA-Z0-9-]/g, '')
const { segmentos, paradas, tamanho, ligada, instantaneo, pernasLigadas, ligar, ligarPerna, redesenhar } = useRota(svg, props)

defineExpose({ ligar, ligarPerna, redesenhar })
</script>

<template>
  <svg
    ref="svg"
    class="fc-rotas"
    :class="{ 'is-on': ligada, 'is-instantaneo': instantaneo }"
    :width="tamanho.w"
    :height="tamanho.h"
    :viewBox="`0 0 ${tamanho.w || 1} ${tamanho.h || 1}`"
    data-fc-rota
    aria-hidden="true"
    focusable="false"
  >
    <defs>
      <mask
        v-for="(s, i) in segmentos"
        :id="`${uid}-m${i}`"
        :key="`m${i}`"
        maskUnits="userSpaceOnUse"
        :x="s.mascara.x"
        :y="s.mascara.y"
        :width="s.mascara.w"
        :height="s.mascara.h"
      >
        <rect
          class="fc-rm"
          :class="[s.mascara.horizontal ? 'fc-rm--h' : 'fc-rm--v', { 'is-on': pernasLigadas.has(s.perna) }]"
          :x="s.mascara.x"
          :y="s.mascara.y"
          :width="s.mascara.w"
          :height="s.mascara.h"
          fill="white"
          :style="{ transformOrigin: s.mascara.origem, transitionDelay: `${s.atraso}ms`, transitionDuration: `${s.duracao}ms` }"
        />
      </mask>
    </defs>
    <line
      v-for="(s, i) in segmentos"
      :key="`l${i}`"
      class="fc-rota__linha"
      :x1="s.x1"
      :y1="s.y1"
      :x2="s.x2"
      :y2="s.y2"
      :stroke-dasharray="`0 ${s.passo}`"
      :mask="`url(#${uid}-m${i})`"
    />
    <g v-for="(p, i) in paradas" :key="`p${i}`" class="fc-parada" :transform="`translate(${(p.x - 24).toFixed(1)} ${(p.y - 24).toFixed(1)})`">
      <path :d="PARADA_D" class="fc-parada__halo" :class="`fc-parada__halo--${p.halo || 'creme'}`" />
      <path :d="PARADA_D" class="fc-parada__arco" />
    </g>
  </svg>
</template>

<style>
.fc-rotas { position: absolute; left: 0; top: 0; overflow: visible; pointer-events: none; z-index: 1; }
/* revelação: retângulo da máscara em scaleX/scaleY 0→1, assa; atraso/duração por segmento (inline) */
.fc-rm { transition-property: transform; transition-timing-function: var(--fc-curva-assa); }
.fc-rm--h { transform: scaleX(0); }
.fc-rm--v { transform: scaleY(0); }
.fc-rotas.is-on .fc-rm, .fc-rm.is-on { transform: none; }
.fc-rotas.is-instantaneo .fc-rm { transition: none !important; }
@media (prefers-reduced-motion: reduce) {
  .fc-rm { transform: none !important; transition: none !important; }
}
@media print { .fc-rm { transform: none !important; } }
</style>
