<script setup>
/**
 * Ícone oficial inline (o arquivo da logo, sem alteração, via ?raw) com a assinatura "pontos conectando": o Lottie
 * pontos-conecta toca por cima e, enquanto toca, os 3 círculos do ícone ficam com opacity 0; eles voltam no
 * `complete`, com trava de segurança em duração + 200 ms.
 * Gatilho 'viewport' = io(.5), uma vez, depois que a página foi revelada; 'manual' = quem usa chama tocar().
 * Sob reduzir movimento, ou em página já vista nesta visita, nada é escondido nem toca.
 */
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import icone from '@logo/fornada-conecta-icone.svg?raw'
import iconeInvertido from '@logo/fornada-conecta-icone-invertido.svg?raw'
import BrandLottie from './BrandLottie.vue'
import { animacoes } from '@/lib/lottie'
import { LOTTIE, reduzirAgora } from '@/lib/motion'
import { observarUmaVez } from '@/lib/gatilho'
import { quandoRevelada } from '@/composables/useVeu'
import { usePaginaVista } from '@/composables/useVisita'

const props = defineProps({
  invertido: { type: Boolean, default: false },
  tamanho: { type: [Number, Object], default: 96 }, // px, ou { base: 96, desktop: 160 } (desktop ≥1024)
  gatilho: { type: String, default: 'viewport', validator: (v) => ['viewport', 'manual'].includes(v) },
})

const raiz = ref(null)
const anim = ref(null)
const tocando = ref(false) // Lottie tocando: os círculos do ícone ficam escondidos
const vista = usePaginaVista()
let trava = 0
let soltar = null
let cancelar = null

const svg = computed(() => (props.invertido ? iconeInvertido : icone).replace(/<svg /, '<svg aria-hidden="true" focusable="false" '))
// --ico-b/--ico-d (não --ico): um --ico inline venceria o @media do desktop e o ícone ficava sempre no tamanho base
const medidas = computed(() => {
  const t = props.tamanho
  return typeof t === 'number' ? { '--ico-b': `${t}px`, '--ico-d': `${t}px` } : { '--ico-b': `${t.base}px`, '--ico-d': `${t.desktop ?? t.base}px` }
})

function fim() {
  clearTimeout(trava)
  // o Lottie pode estar pausado fora da tela no meio do caminho (o BrandLottie retoma quando ele volta): manda para o
  // pôster ANTES de devolver os círculos — nunca os 3 pontos da logo e o ponto do Lottie juntos
  anim.value?.poster()
  tocando.value = false
}

/** Dispara a chegada dos pontos (uma vez por chamada). */
function tocar() {
  if (reduzirAgora() || vista) return
  tocando.value = true
  anim.value?.play()
  trava = setTimeout(fim, (animacoes['pontos-conecta']?.duracaoMs ?? 840) + LOTTIE.folgaHandoff)
}

onMounted(() => {
  if (props.gatilho !== 'viewport' || vista) return
  cancelar = quandoRevelada(() => {
    // alvo já acima da tela (a rolagem saltou por cima): fica parado no estado final, sem tocar
    soltar = observarUmaVez(raiz.value, { limiar: 0.5, entrar: tocar, passou: () => {} })
  })
})
onBeforeUnmount(() => {
  clearTimeout(trava)
  soltar?.()
  cancelar?.()
})

defineExpose({ tocar })
</script>

<template>
  <span ref="raiz" class="fc-icone" :class="{ 'is-tocando': tocando }" :style="medidas" aria-hidden="true">
    <!-- v-html: o SVG oficial da logo, arquivo local e sem alteração -->
    <span class="fc-icone__svg" v-html="svg" />
    <BrandLottie ref="anim" class="fc-icone__lottie" name="pontos-conecta" trigger="manual" variant="normal" fluido @complete="fim" />
  </span>
</template>

<style>
.fc-icone { --ico: var(--ico-b, 96px); position: relative; display: inline-block; flex: none; width: var(--ico); height: var(--ico); }
@media (min-width: 1024px) { .fc-icone { --ico: var(--ico-d, var(--ico-b, 96px)); } }
.fc-icone__svg, .fc-icone__svg svg { display: block; width: 100%; height: 100%; }
/* o Lottie por cima, na geometria do ícone: o comp 260×200 começa em (−14,−12) no viewBox 176 do ícone */
.fc-icone__lottie.fc-lottie {
  position: absolute;
  left: calc(var(--ico) * -14 / 176);
  top: calc(var(--ico) * -12 / 176);
  width: calc(var(--ico) * 260 / 176);
  height: calc(var(--ico) * 200 / 176);
  pointer-events: none;
}
.fc-icone.is-tocando .fc-icone__svg circle { opacity: 0; }
@media (prefers-reduced-motion: reduce) {
  .fc-icone.is-tocando .fc-icone__svg circle { opacity: 1; }
}
</style>
