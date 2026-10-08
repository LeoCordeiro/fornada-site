<script setup>
/**
 * A ÚNICA porta para Lottie. Caixa com tamanho fixo desde o
 * 1º quadro (CLS 0); o JSON baixa a 200 px da viewport e o player só depois do `load` + ocioso. Antes de tocar, o
 * palco fica vazio (sem pôster que depois "rebobina"). Gatilho sem arquivo pronto em 600 ms → pôster, sem tocar
 * depois. Pausa fora da tela e com a aba oculta. Reduzir movimento ou página já vista nesta visita → pôster.
 * Nunca recebe v-reveal, transition nem animation no próprio nó; a cor nunca vem de CSS (vem cravada na variante).
 * Toda Lottie é decorativa (aria-hidden): a informação mora no texto ao lado; o caso role="img" é o
 * SeloSanitario `sozinho`, que põe o nome no próprio contêiner.
 *
 * Atributos de estado (para testes e CSS): data-lottie, data-lottie-variante, data-lottie-estado, data-lottie-frame.
 */
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { animacoes, arquivoDa, carregarAnimacao, carregarPlayer, liberar, observar } from '@/lib/lottie'
import { LOTTIE } from '@/lib/motion'
import { useReduzirMovimento } from '@/composables/useReduzirMovimento'
import { usePaginaVista } from '@/composables/useVisita'
import { quandoRevelada } from '@/composables/useVeu'
import { useTom } from '@/composables/useTom'

const props = defineProps({
  name: { type: String, required: true },
  // viewport (io no limiar, depois que a página foi revelada) | manual (quem usa chama play/poster)
  trigger: { type: String, default: 'viewport', validator: (v) => ['viewport', 'manual'].includes(v) },
  limiar: { type: Number, default: 0.4 }, // gatilho viewport (selo e pão .4; passos .3)
  variant: { type: String, default: 'auto', validator: (v) => ['auto', 'normal', 'invertida'].includes(v) },
  size: { type: [Number, Object], default: null }, // largura (altura pela proporção) | { w, h }
  fluido: { type: Boolean, default: false }, // largura 100 % do pai, altura pela proporção do manifest
  posterInicial: { type: Boolean, default: false }, // mostra o pôster quando carrega, em vez do palco vazio
  segmento: { type: String, default: '' }, // 'entrada' | 'loop' (manifest.segmentos, ex.: pao-cresce)
  ocultarParado: { type: Boolean, default: false }, // só aparece enquanto toca (lembrete do botão fixo)
  ignoraVisita: { type: Boolean, default: false }, // toca mesmo em rota já vista (confirmação disparada pela pessoa)
})
const emit = defineEmits(['ready', 'complete', 'loop-complete', 'falha'])

const m = animacoes[props.name]
if (!m && import.meta.env.DEV) console.error(`[BrandLottie] chave "${props.name}" não existe no manifest.json`)

const { escuro } = useTom()
const reduzir = useReduzirMovimento()
const vista = usePaginaVista()

const variante = computed(() => (props.variant === 'auto' ? (escuro.value ? 'invertida' : 'normal') : props.variant))
const usaLoop = computed(() => Boolean(m?.loop)) // laço só pelo manifest
const estilo = computed(() => {
  const ar = m ? m.altura / m.largura : 1
  if (props.fluido) return { aspectRatio: m ? `${m.largura} / ${m.altura}` : '1 / 1' }
  if (typeof props.size === 'number') return { width: `${props.size}px`, height: `${Math.round(props.size * ar)}px` }
  if (props.size) return { width: `${props.size.w}px`, height: `${props.size.h}px` }
  return { width: `${m?.largura ?? 48}px`, height: `${m?.altura ?? 48}px` }
})

const caixa = ref(null)
const palco = ref(null)
const estado = ref('vazio') // vazio | carregando | tocando | poster | falha
const frame = ref(null)
let anim = null
let pronto = false
let vivo = true
let carregando = false
let pedido = null // 'tocar' | 'poster'
let atrasado = false
let timerEspera = 0
let pedidos = 0 // cada play() novo invalida a espera do anterior
let jaDisparou = false
let pausadoPorFora = false
let soltar = null
let cancelarRevelada = null

// "uma vez por visita" vale para o que a página faz sozinha; uma confirmação que a pessoa disparou (enviado-sucesso)
// toca de novo numa rota já vista — `ignoraVisita`. Reduzir movimento manda sempre.
const congelado = () => reduzir.value || (vista && !props.ignoraVisita)
const quadro = () => (anim ? Math.round(anim.currentFrame) : null)

function mostrarPoster() {
  if (!anim) return
  anim.goToAndStop(m.posterFrame, true)
  estado.value = 'poster'
  frame.value = m.posterFrame
}

function tocarAgora() {
  clearTimeout(timerEspera)
  if (congelado()) return mostrarPoster()
  estado.value = 'tocando'
  pausadoPorFora = false
  const seg = props.segmento && m.segmentos?.[props.segmento]
  anim.loop = usaLoop.value || props.segmento === 'loop'
  if (seg) anim.playSegments([seg.de, seg.ate], true)
  else anim.goToAndPlay(0, true)
}

/** Toca do começo. Sem arquivo pronto em 600 ms → pôster e não toca depois. Os 600 ms contam a
 *  partir de quando o Lottie PODE baixar (liberar(): depois do LCP) — gatilho na 1ª tela espera, não vira pôster. */
function play() {
  if (!m) return
  if (pronto) return tocarAgora()
  pedido = congelado() ? 'poster' : 'tocar'
  atrasado = false
  clearTimeout(timerEspera)
  const meu = ++pedidos
  liberar().then(() => {
    if (meu !== pedidos || !vivo || pronto) return
    timerEspera = setTimeout(() => (atrasado = true), LOTTIE.esperaMax)
  })
  carregar()
}
function pause() {
  if (!anim) return
  anim.pause()
  frame.value = quadro()
}
function stop() {
  if (!anim) return
  anim.stop()
  estado.value = 'vazio'
  frame.value = 0
}
/** Estado final. Não força o download: o JSON vem quando a caixa chega perto da tela (pôster lá embaixo da página,
 *  pedido na montagem sob reduzir movimento, não baixa antes da hora). */
function poster() {
  if (pronto) return mostrarPoster()
  pedido = 'poster'
}

function aoPronto() {
  if (pronto || !vivo) return
  pronto = true
  emit('ready', anim)
  if (congelado()) return mostrarPoster()
  if (pedido === 'tocar') return atrasado ? mostrarPoster() : tocarAgora()
  if (pedido === 'poster' || props.posterInicial) return mostrarPoster()
  estado.value = 'vazio'
}

async function carregar() {
  if (carregando || !m) return
  carregando = true
  if (estado.value === 'vazio') estado.value = 'carregando'
  try {
    const [lottie, dados] = await Promise.all([carregarPlayer(), carregarAnimacao(arquivoDa(m, variante.value))])
    if (!vivo || !palco.value) return
    anim = lottie.loadAnimation({
      container: palco.value,
      renderer: 'svg',
      loop: false,
      autoplay: false,
      animationData: dados,
      rendererSettings: { preserveAspectRatio: 'xMidYMid meet' },
    })
    anim.addEventListener('complete', () => {
      emit('complete')
      mostrarPoster() // estado final = pôster (no lembrete, volta ao quadro 0 e some)
    })
    anim.addEventListener('loopComplete', () => emit('loop-complete'))
    anim.addEventListener('DOMLoaded', aoPronto)
    if (anim.isLoaded) aoPronto()
  } catch (err) {
    if (import.meta.env.DEV) console.warn('[lottie]', props.name, err)
    estado.value = 'falha'
    emit('falha', err)
  }
}

let naTela = false
function aoVisivel(e) {
  naTela = e.isIntersecting
  if (!anim || estado.value !== 'tocando') {
    pausadoPorFora = false
    return
  }
  if (!e.isIntersecting && !anim.isPaused) {
    anim.pause()
    frame.value = quadro()
    pausadoPorFora = true
  } else if (e.isIntersecting && pausadoPorFora && document.visibilityState === 'visible') {
    pausadoPorFora = false
    anim.play()
  }
}
function aoGatilho(e) {
  if (jaDisparou || !e.isIntersecting) return
  jaDisparou = true
  if (e.boundingClientRect.bottom < 0) poster() // a rolagem saltou por cima: estado final, sem tocar depois
  else play()
}
function aoAba() {
  if (!anim || estado.value !== 'tocando') return
  if (document.hidden) {
    if (!anim.isPaused) {
      anim.pause()
      frame.value = quadro()
      pausadoPorFora = true
    }
  } else if (pausadoPorFora && naTela) {
    pausadoPorFora = false
    anim.play() // aba voltou e o Lottie está na tela: retoma de onde parou
  }
}

onMounted(() => {
  if (!m) return
  document.addEventListener('visibilitychange', aoAba)
  // perto (carrega) e visível (pausa) já; o gatilho viewport só arma quando a página foi revelada (t = 0)
  soltar = observar(caixa.value, { perto: carregar, visivel: aoVisivel })
  if (congelado()) pedido = 'poster'
  if (props.trigger === 'viewport' && !congelado()) {
    cancelarRevelada = quandoRevelada(() => {
      if (!vivo) return
      soltar?.()
      soltar = observar(caixa.value, { perto: carregar, visivel: aoVisivel, gatilho: aoGatilho, limiar: props.limiar })
    })
  }
})

watch(reduzir, (rm) => {
  if (rm && anim && pronto) mostrarPoster() // ligou no meio: o que toca vai para o estado final no próximo quadro
})

onBeforeUnmount(() => {
  vivo = false
  clearTimeout(timerEspera)
  soltar?.()
  cancelarRevelada?.()
  document.removeEventListener('visibilitychange', aoAba)
  anim?.destroy()
  anim = null
})

defineExpose({ play, pause, stop, poster, estado, get anim() { return anim } })
</script>

<template>
  <span
    ref="caixa"
    class="fc-lottie"
    :class="{ 'fc-lottie--fluido': fluido, 'fc-lottie--oculto': ocultarParado && estado !== 'tocando' }"
    :style="estilo"
    :data-lottie="name"
    :data-lottie-variante="variante"
    :data-lottie-estado="estado"
    :data-lottie-frame="frame ?? undefined"
    aria-hidden="true"
  >
    <span ref="palco" class="fc-lottie__palco" />
  </span>
</template>

<style>
.fc-lottie { position: relative; display: inline-block; flex: none; vertical-align: middle; transition: none; animation: none; }
.fc-lottie--fluido { display: block; width: 100%; height: auto; }
.fc-lottie__palco { position: absolute; inset: 0; display: block; }
.fc-lottie__palco > svg { display: block; }
.fc-lottie:is([data-lottie-estado="vazio"], [data-lottie-estado="carregando"], [data-lottie-estado="falha"]) .fc-lottie__palco,
.fc-lottie--oculto .fc-lottie__palco { visibility: hidden; }
</style>
