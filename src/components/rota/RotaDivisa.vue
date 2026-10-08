<script setup>
/**
 * A costura: em toda divisa entre blocos de cores diferentes a rota atravessa — trio M · parada ·
 * trio M. 3 pontos de 12 px a cada 18 px de cada lado (de ±30 a ±66 px), parada (arco C r 14, traço 4 dourado, aberto
 * à direita, halo 16 da cor do bloco de cima/da esquerda) EXATAMENTE sobre a divisa. Estático: não mede o DOM.
 *
 * vertical (padrão): mora na borda de CIMA do bloco de baixo (o pai precisa de position: relative) e cruza a divisa
 * horizontal. horizontal: cruza uma divisa vertical em (x, y) do pai (Qualidade, O problema no desktop).
 * Posição: desktop centro da `coluna` (1–12) · tablet `colunaTablet` (8 col.) · celular `xMobile` (24 px).
 */
import { computed, onBeforeUnmount, onMounted, ref, useId } from 'vue'
import { PARADA_D } from '@/lib/rota'
import { COSTURA, reduzirAgora } from '@/lib/motion'
import { quandoRevelada } from '@/composables/useVeu'
import { usePaginaVista } from '@/composables/useVisita'
import { observarUmaVez } from '@/lib/gatilho'

const props = defineProps({
  coluna: { type: Number, default: 9 },
  colunaTablet: { type: Number, default: null },
  x: { type: String, default: '' }, // CSS livre (≥768): vence `coluna`
  xMobile: { type: String, default: '24px' },
  y: { type: String, default: '50%' }, // só na horizontal: altura da travessia no pai
  orientacao: { type: String, default: 'vertical', validator: (v) => ['vertical', 'horizontal'].includes(v) },
  halo: { type: String, default: 'creme', validator: (v) => ['creme', 'marrom', 'profundo'].includes(v) },
  gatilho: { type: String, default: 'linha65', validator: (v) => ['linha65', 'monta', 'manual'].includes(v) },
  atraso: { type: Number, default: 0 },
  duracao: { type: Number, default: 400 },
  // a divisa só existe numa faixa de largura (bloco partido que vira empilhado): 'desktop' = ≥1024, 'celular' = <1024
  somente: { type: String, default: '', validator: (v) => ['', 'desktop', 'celular'].includes(v) },
})

const raiz = ref(null)
const uid = `fc-divisa-${useId()}`.replace(/[^a-zA-Z0-9-]/g, '')
const sentinela = ref(null)
const ligada = ref(false)
const instantaneo = ref(false)
const vista = usePaginaVista()
let soltar = null
let cancelar = null

const vertical = computed(() => props.orientacao === 'vertical')
const kTablet = computed(() => props.colunaTablet ?? Math.max(1, Math.min(8, Math.round((props.coluna * 8) / 12))))
// tempos: trio 1 em 45 % da duração, passagem sob a parada em 10 %, trio 2 nos 45 % finais (0–180 · 180–220 · 220–400)
const tempos = computed(() => {
  const t = props.duracao * 0.45
  return [
    { transitionDelay: `${props.atraso}ms`, transitionDuration: `${Math.round(t)}ms` },
    { transitionDelay: `${Math.round(props.atraso + props.duracao * 0.55)}ms`, transitionDuration: `${Math.round(t)}ms` },
  ]
})
const estilo = computed(() => ({
  '--k-d': props.coluna,
  '--k-t': kTablet.value,
  '--x-m': props.xMobile,
  ...(props.x ? { '--x-livre': props.x } : {}),
  ...(vertical.value ? {} : { '--y': props.y }),
}))

function ligar(instante = false) {
  if (instante || reduzirAgora()) instantaneo.value = true
  ligada.value = true
  soltar?.()
}

onMounted(() => {
  if (vista) return ligar(true)
  if (props.gatilho === 'manual') return
  cancelar = quandoRevelada(() => {
    if (props.gatilho === 'monta') return ligar()
    // linha65: acende quando a divisa cruza 65 % da altura da tela; divisa que já está acima acende sem animar
    soltar = observarUmaVez(sentinela.value, { margemBaixo: COSTURA.rootMargin.split(' ')[2], entrar: () => ligar(), passou: () => ligar(true) })
  })
})
onBeforeUnmount(() => {
  soltar?.()
  cancelar?.()
})

defineExpose({ ligar })
</script>

<template>
  <div
    ref="raiz"
    class="fc-divisa"
    :class="[`fc-divisa--${orientacao}`, { 'is-on': ligada, 'is-instantaneo': instantaneo, 'fc-divisa--livre': !!x, [`fc-divisa--so-${somente}`]: somente }]"
    :style="estilo"
    data-fc-costura
    aria-hidden="true"
  >
    <svg v-if="vertical" class="fc-divisa__svg" width="48" height="144" viewBox="0 0 48 144" focusable="false">
      <defs>
        <mask :id="`${uid}-a`" maskUnits="userSpaceOnUse" x="15" y="-3" width="18" height="54">
          <rect class="fc-divisa__mascara" x="15" y="-3" width="18" height="54" fill="white" :style="[tempos[0], { transformOrigin: '15px -3px' }]" />
        </mask>
        <mask :id="`${uid}-b`" maskUnits="userSpaceOnUse" x="15" y="93" width="18" height="54">
          <rect class="fc-divisa__mascara" x="15" y="93" width="18" height="54" fill="white" :style="[tempos[1], { transformOrigin: '15px 93px' }]" />
        </mask>
      </defs>
      <line class="fc-rota__linha" x1="24" y1="6" x2="24" y2="42.6" stroke-dasharray="0 18" :mask="`url(#${uid}-a)`" />
      <line class="fc-rota__linha" x1="24" y1="102" x2="24" y2="138.6" stroke-dasharray="0 18" :mask="`url(#${uid}-b)`" />
      <g class="fc-parada" transform="translate(0 48)">
        <path :d="PARADA_D" class="fc-parada__halo" :class="`fc-parada__halo--${halo}`" />
        <path :d="PARADA_D" class="fc-parada__arco" />
      </g>
    </svg>
    <svg v-else class="fc-divisa__svg" width="144" height="48" viewBox="0 0 144 48" focusable="false">
      <defs>
        <mask :id="`${uid}-a`" maskUnits="userSpaceOnUse" x="-3" y="15" width="54" height="18">
          <rect class="fc-divisa__mascara" x="-3" y="15" width="54" height="18" fill="white" :style="[tempos[0], { transformOrigin: '-3px 15px' }]" />
        </mask>
        <mask :id="`${uid}-b`" maskUnits="userSpaceOnUse" x="93" y="15" width="54" height="18">
          <rect class="fc-divisa__mascara" x="93" y="15" width="54" height="18" fill="white" :style="[tempos[1], { transformOrigin: '93px 15px' }]" />
        </mask>
      </defs>
      <line class="fc-rota__linha" x1="6" y1="24" x2="42.6" y2="24" stroke-dasharray="0 18" :mask="`url(#${uid}-a)`" />
      <line class="fc-rota__linha" x1="102" y1="24" x2="138.6" y2="24" stroke-dasharray="0 18" :mask="`url(#${uid}-b)`" />
      <g class="fc-parada" transform="translate(48 0)">
        <path :d="PARADA_D" class="fc-parada__halo" :class="`fc-parada__halo--${halo}`" />
        <path :d="PARADA_D" class="fc-parada__arco" />
      </g>
    </svg>
    <i ref="sentinela" class="fc-divisa__sentinela" />
  </div>
</template>

<style>
.fc-divisa {
  /* centro da coluna k da grade: mesma conta das linhas nomeadas do .fc-g */
  --x-col: calc((100% - min(100%, var(--fc-wrap-max))) / 2 + var(--gut) + (var(--k) - 1) * (var(--col) + var(--gap)) + var(--col) / 2);
  --k: var(--k-d);
  --x: var(--x-m);
  position: absolute;
  z-index: 1;
  pointer-events: none;
  width: 0;
  height: 0;
}
.fc-divisa--vertical { top: 0; left: var(--x); }
.fc-divisa--horizontal { top: var(--y); left: var(--x); }
@media (min-width: 768px) {
  .fc-divisa { --k: var(--k-t); --x: var(--x-col); }
  .fc-divisa--livre { --x: var(--x-livre); }
}
@media (min-width: 1024px) { .fc-divisa { --k: var(--k-d); } }
@media (max-width: 1023px) { .fc-divisa--so-desktop { display: none; } }
@media (min-width: 1024px) { .fc-divisa--so-celular { display: none; } }
.fc-divisa__svg { position: absolute; overflow: visible; }
.fc-divisa--vertical .fc-divisa__svg { left: -24px; top: -72px; }
.fc-divisa--horizontal .fc-divisa__svg { left: -72px; top: -24px; }
.fc-divisa__sentinela { position: absolute; left: 0; top: 0; width: 1px; height: 1px; }
.fc-divisa__mascara { transition-property: transform; transition-timing-function: var(--fc-curva-assa); }
.fc-divisa--vertical .fc-divisa__mascara { transform: scaleY(0); }
.fc-divisa--horizontal .fc-divisa__mascara { transform: scaleX(0); }
.fc-divisa.is-on .fc-divisa__mascara { transform: none; }
.fc-divisa.is-instantaneo .fc-divisa__mascara { transition: none !important; }
@media (prefers-reduced-motion: reduce) {
  .fc-divisa__mascara { transform: none !important; transition: none !important; }
}
@media print { .fc-divisa__mascara { transform: none !important; } }
</style>
