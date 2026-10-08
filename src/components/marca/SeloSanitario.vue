<script>
// um play por página: o 1º selo que aparece toca, os outros da mesma rota vão para o pôster (memória do módulo)
const tocadosPorRota = new Set()
</script>

<script setup>
/**
 * O principal elemento de confiança. A informação nunca fica só no desenho: com `titulo`, o texto real vai ao lado;
 * sem título, o contexto (H2 ao lado) já diz — e `sozinho` vira role="img" com o rótulo do selo.
 *  animado  → BrandLottie selo-sanitario, io(.4), 1× e UM play por página (outras instâncias ficam no pôster);
 *  estatico → SVG = quadro 14 (ArcoC com pontos + check dourado), sem player (FormProdutor).
 * Animado e congelado (reduzir movimento ou página já vista): o Lottie vai para o pôster, mas o arquivo só chega depois
 * do liberar() — até lá o MESMO desenho do quadro 14 fica no lugar, desde o 1º quadro, e some quando o pôster
 * aparece. Sem isso o selo ficava ~1 s vazio na carga direta, com a rota do posto já pronta passando por ele.
 */
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import BrandLottie from './BrandLottie.vue'
import { reduzirAgora } from '@/lib/motion'
import { observarUmaVez } from '@/lib/gatilho'
import { quandoRevelada } from '@/composables/useVeu'
import { usePaginaVista } from '@/composables/useVisita'
import { provideTom, useTom } from '@/composables/useTom'

const props = defineProps({
  variante: { type: String, default: 'animado', validator: (v) => ['animado', 'estatico'].includes(v) },
  tamanho: { type: String, default: 'secao', validator: (v) => ['secao', 'medio', 'compacto'].includes(v) }, // 140/200 · 80/112 · 64
  titulo: { type: String, default: '' }, // ex.: "Regularização sanitária exigida"
  sozinho: { type: Boolean, default: false }, // sem texto ao lado → role="img"
  tom: { type: String, default: '' },
})

const route = useRoute()
const { tom, escuro } = useTom(props)
provideTom(tom) // o Lottie de dentro escolhe a variante pelo mesmo tom
const vista = usePaginaVista()
const lottie = ref(null)
const desenho = ref(null)
let soltar = null
let cancelar = null

const rotulo = computed(() => (props.sozinho ? 'Selo: regularização sanitária exigida' : ''))
// o desenho fixo vale para o estático e, no animado, enquanto o pôster do congelado não chega
const fixo = props.variante !== 'animado' || vista || reduzirAgora()

onMounted(() => {
  if (props.variante !== 'animado') return
  if (vista || reduzirAgora()) return lottie.value?.poster()
  cancelar = quandoRevelada(() => {
    soltar = observarUmaVez(desenho.value, {
      limiar: 0.4,
      entrar: () => {
        const chave = route.path
        if (tocadosPorRota.has(chave)) return lottie.value?.poster()
        tocadosPorRota.add(chave)
        lottie.value?.play()
      },
      passou: () => lottie.value?.poster(),
    })
  })
})
onBeforeUnmount(() => {
  soltar?.()
  cancelar?.()
})
</script>

<template>
  <div class="fc-selo" :class="[`fc-selo--${tamanho}`, { 'fc-selo--escuro': escuro, 'fc-selo--com-texto': titulo || $slots.default }]">
    <span ref="desenho" class="fc-selo__desenho" v-bind="rotulo ? { role: 'img', 'aria-label': rotulo } : { 'aria-hidden': 'true' }">
      <BrandLottie v-if="variante === 'animado'" ref="lottie" name="selo-sanitario" trigger="manual" fluido />
      <svg v-if="fixo" :class="{ 'fc-selo__fixo': variante === 'animado' }" viewBox="0 0 200 200" focusable="false" aria-hidden="true">
        <path d="M153.6 55 A70 70 0 1 0 153.6 145" fill="none" class="fc-selo__arco" stroke-width="20" stroke-linecap="round" />
        <circle class="fc-selo__ouro" cx="176" cy="82" r="6" />
        <circle class="fc-selo__ouro" cx="176" cy="100" r="6" />
        <circle class="fc-selo__ouro" cx="176" cy="118" r="6" />
        <path d="M74 102 L92 120 L128 82" fill="none" class="fc-selo__check" stroke-width="14" stroke-linecap="round" stroke-linejoin="round" />
      </svg>
    </span>
    <div v-if="titulo || $slots.default" class="fc-selo__texto">
      <p v-if="titulo" class="fc-selo__titulo">{{ titulo }}</p>
      <slot />
    </div>
  </div>
</template>

<style>
.fc-selo { display: flex; flex-direction: column; align-items: flex-start; gap: 16px; }
.fc-selo--compacto { flex-direction: row; align-items: center; gap: 12px; }
.fc-selo__desenho { display: block; flex: none; width: 140px; height: 140px; position: relative; }
@media (min-width: 1024px) { .fc-selo--secao .fc-selo__desenho { width: 200px; height: 200px; } }
.fc-selo--compacto .fc-selo__desenho { width: 64px; height: 64px; }
/* médio: requisito da 1ª tela do Seja produtor — maior que o selo estático do formulário, menor que o de seção */
.fc-selo--medio .fc-selo__desenho { width: 80px; height: 80px; }
@media (min-width: 1024px) { .fc-selo--medio .fc-selo__desenho { width: 112px; height: 112px; } }
.fc-selo__desenho > svg, .fc-selo__desenho > .fc-lottie { width: 100%; height: 100%; }
/* animado e congelado: o desenho do quadro 14 por cima do palco vazio até o pôster aparecer */
.fc-selo__desenho > .fc-selo__fixo { position: absolute; inset: 0; }
.fc-selo__desenho:has(> .fc-lottie[data-lottie-estado="poster"]) > .fc-selo__fixo { visibility: hidden; }
.fc-selo__arco { stroke: var(--fc-marrom); }
.fc-selo--escuro .fc-selo__arco { stroke: var(--fc-creme); }
.fc-selo__ouro { fill: var(--fc-dourado); }
.fc-selo__check { stroke: var(--fc-dourado); }
.fc-selo__titulo { font-family: var(--fc-ff-corpo); font-weight: 600; font-size: var(--fc-fs-botao); line-height: 1.4; } /* 16 em toda largura, peso de rótulo de botão */
.fc-selo__texto { min-width: 0; }
</style>
