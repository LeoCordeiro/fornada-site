<script setup>
/**
 * Um passo: ícone (Lottie da chave, ou ArcoC 96 com o numeral dentro) · numeral "01"
 * (.fc-num, aria-hidden) · h3 com "Passo n de N: " só para leitor de tela · texto · slot `extra`.
 * Grade 96 px | 1fr no celular e 120 px | 1fr ≥1024 (ícone ocupando 4 linhas). `empilhado`: a partir de 768 px, tudo
 * numa coluna — ícone, numeral menor, título e texto —, para passos lado a lado com a rota passando na altura dos
 * ícones (nada ao lado do ícone). A variante do Lottie sai do tom (prop `tom` ou herdado). Expõe tocar() (dispara o
 * Lottie), poster() e icone() (elemento do ícone, para a rota medir).
 * Trilha do produtor: `arcoVazio` tira o numeral de dentro do arco (o numeral grande já está
 * ao lado) e `estado` desenha o marcador — pendente: arco marrom-médio · atual: arco marrom + miolo dourado ·
 * ok: arco marrom + miolo marrom; troca de cor/opacidade em 200 ms assa; sob reduzir movimento, sempre `ok`.
 * `moldura`: passo COM Lottie dentro do arco C (o ritmo da fileira não quebra) — o estado colore o arco.
 * Lado do ícone e vão até o texto vêm de --fc-passo-icone / --fc-passo-vao (tokens.css), para a página alinhar.
 */
import { computed, ref } from 'vue'
import BrandLottie from '@/components/marca/BrandLottie.vue'
import ArcoC from '@/components/marca/ArcoC.vue'
import { provideTom, useTom } from '@/composables/useTom'
import { useReduzirMovimento } from '@/composables/useReduzirMovimento'

const props = defineProps({
  numero: { type: Number, required: true },
  titulo: { type: String, required: true },
  texto: { type: String, default: '' },
  lottie: { type: String, default: '' }, // chave do manifest; vazio = ArcoC com o numeral
  lottieTrigger: { type: String, default: 'manual' }, // 'manual' (sequência de quem usa) | 'viewport'
  lottieSegmento: { type: String, default: '' }, // ex.: 'entrada' (pao-cresce)
  total: { type: Number, default: 4 },
  nivel: { type: Number, default: 3 },
  tom: { type: String, default: '' },
  arcoVazio: { type: Boolean, default: false }, // sem o numeral dentro do arco
  moldura: { type: Boolean, default: false }, // Lottie dentro do arco C
  empilhado: { type: Boolean, default: false }, // ≥ 768: uma coluna (ícone, numeral, título, texto)
  estado: { type: String, default: '', validator: (v) => ['', 'pendente', 'atual', 'ok'].includes(v) }, // marcador
})

const { tom, escuro } = useTom(props)
provideTom(tom)
const reduzir = useReduzirMovimento()
const marcador = computed(() => (props.estado && reduzir.value ? 'ok' : props.estado))
const icone = ref(null)
const anim = ref(null)
const dois = (n) => String(n).padStart(2, '0')

defineExpose({
  tocar: () => anim.value?.play(),
  poster: () => anim.value?.poster(),
  icone: () => icone.value,
})
</script>

<template>
  <article class="fc-passo fc-tom" :class="[`fc-tom--${tom}`, { 'fc-passo--escuro': escuro, [`fc-passo--${marcador}`]: marcador, 'fc-passo--moldura': lottie && moldura, 'fc-passo--empilhado': empilhado }]">
    <div ref="icone" class="fc-passo__icone" aria-hidden="true">
      <ArcoC v-if="lottie && moldura" fluido class="fc-passo__arco" />
      <BrandLottie v-if="lottie" ref="anim" :class="{ 'fc-passo__lottie-moldura': moldura }" :name="lottie" :trigger="lottieTrigger" :segmento="lottieSegmento" :limiar="0.4" fluido />
      <ArcoC v-else-if="arcoVazio" fluido class="fc-passo__arco" />
      <ArcoC v-else fluido class="fc-passo__arco"><span class="fc-passo__num-arco">{{ dois(numero) }}</span></ArcoC>
    </div>
    <p class="fc-num fc-passo__num" aria-hidden="true">{{ dois(numero) }}</p>
    <component :is="`h${nivel}`" class="fc-h3 fc-passo__titulo"><span class="fc-sr">Passo {{ numero }} de {{ total }}: </span>{{ titulo }}</component>
    <p v-if="texto" class="fc-txt fc-passo__texto fc-corpo">{{ texto }}</p>
    <slot name="extra" />
  </article>
</template>

<style>
.fc-passo { position: relative; display: grid; grid-template-columns: var(--fc-passo-icone) minmax(0, 1fr); column-gap: var(--fc-passo-vao); align-content: start; }
.fc-passo__icone { position: relative; width: var(--fc-passo-icone); height: var(--fc-passo-icone); grid-column: 1; grid-row: 1; }
.fc-passo__icone > .fc-lottie, .fc-passo__icone > .fc-arco { width: 100%; height: 100%; }
/* Lottie dentro do C (moldura): centrado no vazio do arco (centro + 0,06 r), 62 % do lado */
.fc-passo__icone > .fc-passo__lottie-moldura.fc-lottie { position: absolute; left: 52.6%; top: 50%; width: 62%; height: auto; transform: translate(-50%, -50%); }
.fc-passo__num { grid-column: 2; grid-row: 1; align-self: end; line-height: .9; }
.fc-passo__titulo { grid-column: 1 / -1; margin-top: 16px; }
.fc-passo__texto { grid-column: 1 / -1; margin-top: 8px; }
.fc-passo > :not(.fc-passo__icone):not(.fc-passo__num):not(.fc-passo__titulo):not(.fc-passo__texto) { grid-column: 1 / -1; }
/* o arco (fluido) acompanha o lado do ícone, 96 → 120 no desktop; o numeral de dentro, na mesma proporção (24 → 30) */
.fc-passo__num-arco { font-family: var(--fc-ff-titulo); font-weight: 700; font-size: calc(var(--fc-passo-icone) / 4); font-variant-numeric: tabular-nums lining-nums; }
/* marcador da trilha: só com `estado`. O miolo fica no vazio do arco (centro + 0,06 r, como o F da logo). */
.fc-passo--pendente .fc-passo__arco, .fc-passo--atual .fc-passo__arco, .fc-passo--ok .fc-passo__arco { transition: color var(--fc-dur-hover) var(--fc-curva-assa); }
.fc-passo--pendente .fc-passo__arco { color: var(--fc-marrom-medio); }
.fc-passo--pendente.fc-passo--escuro .fc-passo__arco { color: var(--fc-creme-2); }
.fc-passo--pendente .fc-passo__icone::after, .fc-passo--atual .fc-passo__icone::after, .fc-passo--ok .fc-passo__icone::after {
  content: "";
  position: absolute;
  /* no vazio do arco, onde mora o F: centro em (52,6 %, 50 %); 14,6 % do lado = 14 px a 96 e 17,5 px a 120 —
     acompanha o arco */
  left: 45.3%;
  top: 42.7%;
  width: 14.6%;
  height: 14.6%;
  border-radius: 50%;
  background-color: var(--fc-dourado);
  opacity: 0;
  transition: background-color var(--fc-dur-hover) var(--fc-curva-assa), opacity var(--fc-dur-hover) var(--fc-curva-assa);
}
.fc-passo--atual .fc-passo__icone::after { opacity: 1; }
.fc-passo--ok .fc-passo__icone::after { opacity: 1; background-color: var(--fc-marrom); }
.fc-passo--ok.fc-passo--escuro .fc-passo__icone::after { background-color: var(--fc-creme); }
.fc-passo--moldura .fc-passo__icone::after { display: none; } /* com Lottie dentro do C o estado fica no arco */
@media (prefers-reduced-motion: reduce) {
  .fc-passo__arco, .fc-passo__icone::after { transition: none !important; }
}
@media (min-width: 1024px) {
  .fc-passo__icone { grid-row: 1 / 5; }
  .fc-passo__num { align-self: start; }
  .fc-passo__titulo, .fc-passo__texto, .fc-passo > :not(.fc-passo__icone):not(.fc-passo__num):not(.fc-passo__titulo):not(.fc-passo__texto) { grid-column: 2; }
}
/* empilhado (≥ 768): uma coluna; a grade de cima deixa de valer (flex ignora grid-row/grid-column) */
@media (min-width: 768px) {
  .fc-passo.fc-passo--empilhado { display: flex; flex-direction: column; align-items: flex-start; }
  .fc-passo--empilhado .fc-passo__num { align-self: flex-start; margin-top: 20px; font-size: clamp(44px, 4.4vw, 64px); }
  .fc-passo--empilhado .fc-passo__titulo { margin-top: 12px; }
}
</style>
