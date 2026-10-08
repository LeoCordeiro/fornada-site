<script setup>
/**
 * O arco "C" da logo como moldura: centro (100,100), r 70, traço 20 arredondado, aberto à direita (±40°).
 * O traço escala pelo viewBox (64 → 8 · 96 → 12 · 160 → 20). Nunca fechado, nunca girado. Cor: marrom no creme,
 * creme no escuro (pelo tom). `comPontos`: os 3 pontos dourados na abertura, só onde há função de "conecta/chegada".
 * Slot: conteúdo no vazio, caixa ≤ 0,8r × 1,1r centrada em (cx + 0,06r, cy) — onde mora o F (em % do lado).
 * `fluido`: sem lado fixo — o arco ocupa a caixa de quem usa (PassoRota: --fc-passo-icone, 96 → 120 no desktop).
 */
import { computed } from 'vue'
import { useTom } from '@/composables/useTom'

const props = defineProps({
  tamanho: { type: [Number, String], default: 96 }, // px (64 | 96 | 160 ou qualquer número)
  comPontos: { type: Boolean, default: false },
  rotulo: { type: String, default: '' }, // informativo → role="img"
  tom: { type: String, default: '' },
  fluido: { type: Boolean, default: false },
})
const { escuro } = useTom(props)

const lado = computed(() => Number(props.tamanho))
// viewBox sem pontos: 20 20 160 160 · com pontos (igual ao ícone oficial): 14 12 176 176
const vb = computed(() => (props.comPontos ? { x: 14, y: 12, s: 176 } : { x: 20, y: 20, s: 160 }))
// em fração do lado (o desenho escala inteiro): vale para o lado fixo e para o fluido
const vazio = computed(() => {
  const { x, y, s } = vb.value
  const r = 70 / s
  const pct = (v) => `${+(v * 100).toFixed(3)}%`
  return { left: pct((100 - x) / s + 0.06 * r - 0.4 * r), top: pct((100 - y) / s - 0.55 * r), width: pct(0.8 * r), height: pct(1.1 * r) }
})
</script>

<template>
  <span
    class="fc-arco"
    :class="{ 'fc-arco--escuro': escuro, 'fc-arco--fluido': fluido }"
    :style="fluido ? undefined : { width: `${lado}px`, height: `${lado}px` }"
    v-bind="rotulo ? { role: 'img', 'aria-label': rotulo } : { 'aria-hidden': 'true' }"
  >
    <svg :viewBox="`${vb.x} ${vb.y} ${vb.s} ${vb.s}`" :width="fluido ? '100%' : lado" :height="fluido ? '100%' : lado" focusable="false" aria-hidden="true">
      <path d="M153.6 55 A70 70 0 1 0 153.6 145" fill="none" stroke="currentColor" stroke-width="20" stroke-linecap="round" />
      <template v-if="comPontos">
        <circle class="fc-arco__ponto" cx="176" cy="82" r="6" />
        <circle class="fc-arco__ponto" cx="176" cy="100" r="6" />
        <circle class="fc-arco__ponto" cx="176" cy="118" r="6" />
      </template>
    </svg>
    <span v-if="$slots.default" class="fc-arco__vazio" :style="vazio"><slot /></span>
  </span>
</template>

<style>
.fc-arco { position: relative; display: inline-block; flex: none; color: var(--fc-marrom); }
.fc-arco svg { display: block; }
.fc-arco--escuro { color: var(--fc-creme); }
.fc-arco--fluido { display: block; width: 100%; height: 100%; }
.fc-arco__ponto { fill: var(--fc-dourado); }
.fc-arco__vazio { position: absolute; display: grid; place-items: center; text-align: center; }
</style>
