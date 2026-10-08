<script setup>
/**
 * Estado de sucesso dos formulários. Ocupa o lugar do formulário
 * no MESMO tique do envio. O site NÃO sabe se a pessoa tocou em enviar no WhatsApp: o texto diz que o WhatsApp
 * ABRIU, nunca que o pedido foi enviado.
 *
 * Props
 *   tipo   'PEDIDO' | 'PRODUTOR'  escolhe "pedido"/"cadastro" no texto
 *   texto  String                 a mensagem já montada (a mesma que foi para o wa.me)
 *   url    String | null          wa.me; null = número ainda é sentinela → MODO PRÉVIA (nada abre, mensagem visível)
 * Emits
 *   corrigir                      "Corrigir dados": o pai volta ao formulário com tudo preenchido
 * Expose
 *   focar()                       foco no H2 (tabindex -1)
 *
 * Foco no H2 ao montar. Lottie `enviado-sucesso` (decorativo): toca assim que a aba está visível (aba oculta → no
 * visibilitychange); sob reduzir movimento, pôster. A troca formulário → sucesso é no mesmo tique (o foco no H2 pede
 * isso): a entrada vem 160 ms adiantada — os 160 ms eram da saída dos campos por baixo, que não
 * existe, e sobrava o cartão vazio. "Copiar mensagem": 3 níveis (API de área de transferência →
 * textarea fora da tela + execCommand → bloco de leitura selecionado + instrução na tela).
 */
import { computed, nextTick, onBeforeUnmount, onMounted, ref, useId } from 'vue'
import BotaoMarca from '@/components/marca/BotaoMarca.vue'
import BrandLottie from '@/components/marca/BrandLottie.vue'
import { ENVIO } from '@/data/formularios'
import { formatarNumeroEmpresa } from '@/lib/whatsapp'
import { reduzirAgora } from '@/lib/motion'

const props = defineProps({
  tipo: { type: String, required: true, validator: (v) => ['PEDIDO', 'PRODUTOR'].includes(v) },
  texto: { type: String, required: true },
  url: { type: String, default: null },
})
defineEmits(['corrigir'])

const previa = computed(() => !props.url)
const textoDoContrato = computed(() => (previa.value ? ENVIO.previa.texto : ENVIO.texto[props.tipo]))
const tituloDoSucesso = computed(() => (previa.value ? ENVIO.previa.titulo : ENVIO.titulo))
const legendaDoSucesso = computed(() => (previa.value ? ENVIO.previa.legenda : ENVIO.legenda))
// o texto nasce preenchido: região viva assim não é anunciada — o título focado o lê como descrição
const idTexto = `${useId()}-texto`
const numero = formatarNumeroEmpresa() // '' enquanto o número é sentinela
const linhas = computed(() => props.texto.split('\n').length)

const raiz = ref(null)
const titulo = ref(null)
const lottie = ref(null)
const leitura = ref(null) // <textarea> do bloco de leitura (nível 3 da cópia seleciona e foca nele)

const bloco = ref(previa.value) // bloco de leitura: na prévia já aparece; no normal, só depois de "Copiar"
const aviso = ref('') // role="status" do resultado da cópia
const avisoVisivel = ref(false)
let roLeitura = null
let larguraLeitura = 0
let tmrAviso = 0
let aoVisivel = null

/** Texto no role="status": limpa antes, para o leitor de tela anunciar também quando o texto se repete. */
async function dizer(msg, some) {
  clearTimeout(tmrAviso)
  aviso.value = ''
  avisoVisivel.value = true
  await nextTick()
  aviso.value = msg
  if (some) tmrAviso = setTimeout(() => (avisoVisivel.value = false), 4000) // sai do visual em 4 s; fica no DOM
}

/** Nível 2: textarea fora da tela + execCommand. Síncrono. */
function copiarPorSelecao(texto) {
  const ta = document.createElement('textarea')
  ta.value = texto
  ta.setAttribute('readonly', '')
  ta.setAttribute('aria-hidden', 'true')
  ta.style.cssText = 'position:fixed;top:0;left:-9999px;opacity:0;'
  const antes = document.activeElement
  document.body.appendChild(ta)
  ta.focus({ preventScroll: true })
  ta.select()
  ta.setSelectionRange(0, texto.length)
  let ok = false
  try {
    ok = document.execCommand('copy')
  } catch {
    ok = false
  }
  ta.remove()
  antes?.focus?.({ preventScroll: true })
  return ok
}

async function copiar() {
  bloco.value = true
  let ok = false
  if (navigator.clipboard?.writeText) {
    try {
      await navigator.clipboard.writeText(props.texto) // nível 1 (exige contexto seguro e gesto — o clique é)
      ok = true
    } catch {
      ok = false
    }
  }
  if (!ok) ok = copiarPorSelecao(props.texto)
  if (ok) return dizer(ENVIO.copiou, true)
  // nível 3: bloco de leitura visível, já selecionado, com a instrução na tela
  await nextTick()
  leitura.value?.focus({ preventScroll: true })
  leitura.value?.select()
  leitura.value?.setSelectionRange(0, props.texto.length)
  dizer(ENVIO.naoCopiou, false)
}

function iniciarLottie() {
  if (reduzirAgora()) return lottie.value?.poster()
  const tocar = () => {
    lottie.value?.play() // 0–600 ms contados de quando a aba está visível
  }
  if (document.visibilityState === 'visible') return tocar()
  aoVisivel = () => {
    if (document.visibilityState !== 'visible') return
    document.removeEventListener('visibilitychange', aoVisivel)
    aoVisivel = null
    tocar()
  }
  document.addEventListener('visibilitychange', aoVisivel)
}

/** A mensagem tem linhas longas que quebram no celular: a altura do bloco acompanha o conteúdo, senão a última linha some. */
function ajustarLeitura(el) {
  el.style.height = 'auto'
  el.style.height = `${el.scrollHeight + el.offsetHeight - el.clientHeight}px` // conteúdo + bordas (box-sizing: border-box)
}
/** ref em função (os dois blocos, prévia e normal, usam a mesma): guarda o elemento e reajusta se a largura mudar. */
function aoMontarLeitura(el) {
  roLeitura?.disconnect()
  roLeitura = null
  leitura.value = el
  if (!el) return
  ajustarLeitura(el)
  if (typeof ResizeObserver === 'undefined') return
  larguraLeitura = el.clientWidth
  roLeitura = new ResizeObserver(() => {
    if (el.clientWidth === larguraLeitura) return // só a largura refaz a quebra de linha (e a altura que eu mesmo mudo não volta aqui)
    larguraLeitura = el.clientWidth
    ajustarLeitura(el)
  })
  roLeitura.observe(el)
}

function focar() {
  titulo.value?.focus({ preventScroll: true })
}

onMounted(() => {
  focar() // foco no H2 já no tique do envio
  raiz.value?.scrollIntoView({ block: 'nearest', behavior: reduzirAgora() ? 'instant' : 'smooth' })
  iniciarLottie()
})
onBeforeUnmount(() => {
  roLeitura?.disconnect()
  clearTimeout(tmrAviso)
  if (aoVisivel) document.removeEventListener('visibilitychange', aoVisivel)
})

defineExpose({ focar })
</script>

<template>
  <div ref="raiz" class="fc-envio" :class="{ 'fc-envio--previa': previa }" :data-fc-envio="tipo.toLowerCase()">
    <div class="fc-envio__selo">
      <BrandLottie ref="lottie" name="enviado-sucesso" trigger="manual" :size="96" ignora-visita />
    </div>
    <h2 ref="titulo" class="fc-envio__titulo fc-h3" tabindex="-1" :aria-describedby="idTexto">{{ tituloDoSucesso }}</h2>
    <p :id="idTexto" class="fc-envio__texto fc-clg">{{ textoDoContrato }}</p>

    <div v-if="previa && bloco" class="fc-envio__bloco">
      <textarea :ref="aoMontarLeitura" class="fc-envio__mensagem" readonly :rows="linhas" :aria-label="ENVIO.rotuloMensagem" :value="texto" />
    </div>

    <p v-if="legendaDoSucesso" class="fc-envio__legenda fc-leg">{{ legendaDoSucesso }}</p>

    <div class="fc-envio__acoes">
      <BotaoMarca v-if="url" variante="ouro" :href="url" bloco>{{ ENVIO.abrirDeNovo }}</BotaoMarca>
      <BotaoMarca variante="contorno" bloco @click="copiar">{{ previa ? ENVIO.copiarPrevia : ENVIO.copiar }}</BotaoMarca>
    </div>

    <div v-if="!previa && bloco" class="fc-envio__bloco">
      <textarea :ref="aoMontarLeitura" class="fc-envio__mensagem" readonly :rows="linhas" :aria-label="ENVIO.rotuloMensagem" :value="texto" />
      <p v-if="numero" class="fc-envio__numero fc-tab">{{ ENVIO.numero(numero) }}</p>
    </div>
    <p class="fc-envio__copia" :class="{ 'fc-sr': !avisoVisivel }" role="status">{{ aviso }}</p>

    <div class="fc-envio__links">
      <button type="button" class="fc-envio__link" @click="$emit('corrigir')">{{ ENVIO.corrigir }}</button>
      <router-link to="/" class="fc-envio__link">{{ ENVIO.voltar }}</router-link>
    </div>
  </div>
</template>

<style>
.fc-envio { color: var(--fc-marrom); } /* sem reserva embaixo: o botão fixo sai de cena sozinho */

.fc-envio__selo { margin-bottom: 8px; }
.fc-envio__titulo { margin: 0 0 12px; text-wrap: balance; }
.fc-envio__titulo:focus { outline: none; } /* título focado por script, não é controle (mesma regra do H1 em base) */
.fc-envio__texto { margin: 0 0 12px; max-width: 62ch; }
.fc-envio__legenda { margin: 12px 0 0; color: var(--fc-marrom-medio); max-width: 62ch; }

.fc-envio__acoes { display: flex; flex-direction: column; gap: 12px; margin-top: 24px; }
/* < 400 px: "Não abriu? Copiar mensagem" cabe numa linha — pílula mais justa e sem o trio */
@media (max-width: 399px) {
  .fc-envio__acoes .fc-btn { padding: 12px 20px 12px 24px; }
  .fc-envio__acoes .fc-btn--contorno .fc-btn__trio { display: none; }
}
@media (min-width: 768px) { .fc-envio__acoes { flex-direction: row; flex-wrap: wrap; } }

.fc-envio__bloco { margin-top: 16px; }
.fc-envio__acoes + .fc-envio__bloco { margin-top: 24px; }
.fc-envio__mensagem {
  display: block;
  width: 100%;
  margin: 0;
  padding: 12px 16px;
  border: 1px solid var(--fc-marrom-medio);
  border-radius: var(--fc-raio-campo);
  background: var(--fc-creme-2);
  color: var(--fc-marrom);
  font: 400 15px / 1.5 var(--fc-ff-corpo);
  resize: none;
}
.fc-envio__numero { margin: 12px 0 0; max-width: 62ch; }
.fc-envio__copia:not(:empty) { margin: 12px 0 0; font-weight: 500; font-size: var(--fc-fs-legenda); line-height: 1.4; }
.fc-envio__copia:empty { margin: 0; }

.fc-envio__links { display: flex; flex-wrap: wrap; gap: 0 24px; margin-top: 16px; }
.fc-envio__link {
  display: inline-flex;
  align-items: center;
  min-height: 48px;
  margin: 0;
  padding: 0;
  border: 0;
  background: none;
  color: inherit;
  font: 500 var(--fc-fs-corpo) / 1.2 var(--fc-ff-corpo);
  text-decoration: underline;
  text-underline-offset: 4px;
  text-decoration-thickness: 1px;
  cursor: pointer;
}
@media (hover: hover) and (pointer: fine) { .fc-envio__link:hover { text-decoration-thickness: 2px; } }

/* Entrada: só opacidade. Lottie em 0, título
   120–320 ms, texto e ações 240–440 ms. Com a aba oculta o relógio do documento não anda, então a sequência começa
   quando a pessoa volta. Sob reduzir movimento: tudo junto, 200 ms. */
@keyframes fc-envio-op { from { opacity: 0; } }
.fc-envio__titulo { animation: fc-envio-op var(--fc-dur-hover) var(--fc-curva-fermenta) calc(var(--fc-dur-gaveta) - var(--fc-dur-saida)) backwards; }
.fc-envio__texto, .fc-envio__legenda, .fc-envio__acoes, .fc-envio__links {
  animation: fc-envio-op var(--fc-dur-hover) var(--fc-curva-fermenta) calc(var(--fc-dur-elemento) - var(--fc-dur-saida)) backwards;
}
/* o bloco que nasce do toque em "Copiar mensagem" aparece na hora (só os 200 ms de opacidade, sem atraso);
   na prévia ele já nasce com o texto e entra junto com ele */
.fc-envio__bloco { animation: fc-envio-op var(--fc-dur-hover) var(--fc-curva-fermenta) backwards; }
.fc-envio--previa .fc-envio__bloco { animation-delay: calc(var(--fc-dur-elemento) - var(--fc-dur-saida)); }
@media (prefers-reduced-motion: reduce) {
  /* .fc-envio--previa .fc-envio__bloco entra na lista: com 2 classes ele vencia esta regra e esperava 400 ms */
  .fc-envio__titulo, .fc-envio__texto, .fc-envio__legenda, .fc-envio__acoes, .fc-envio__bloco, .fc-envio__links,
  .fc-envio--previa .fc-envio__bloco {
    animation: fc-envio-op var(--fc-dur-reduzido) var(--fc-curva-fermenta) 0ms backwards;
  }
}
</style>
