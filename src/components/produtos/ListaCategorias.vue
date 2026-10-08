<script setup>
/**
 * As faixas de categoria de Produtos. Cada categoria = CartaoCategoria layout
 * "faixa", com tom e lado da foto FIXOS por categoria (a faixa que fica não troca de cor no meio do FLIP):
 * Pães marrom/foto à esquerda · Bolos creme/direita · Salgados marrom/esquerda · Massas creme/direita — em "Todos"
 * toda divisa tem costura (o filtro creme em cima e o fim marrom embaixo). Costura no topo de cada faixa quando o
 * tom muda (x na coluna da foto: 3 ou 10, alternando); no celular x 24.
 * <TransitionGroup> move as FAIXAS: saem (op 1→0, sc 1→.96, 160 ms assa, absolutas com a posição medida), ficam
 * (FLIP só com transform, 320 ms assa), entram (160 + n·40 ms → +240, op e ty 8→0, fermenta). Total ≤ 600 ms.
 * Reduzir movimento: somem/trocam na hora, entram só com opacidade em 200 ms. Categoria sem exemplo → EstadoVazio.
 * A 1ª exibição é o reveal do próprio CartaoCategoria (io .2); depois de uma troca, quem entra já vem aceso.
 */
import { computed } from 'vue'
import CartaoCategoria from '@/components/secoes/CartaoCategoria.vue'
import EstadoVazio from '@/components/secoes/EstadoVazio.vue'
import BlocoRota from '@/components/rota/BlocoRota.vue'
import { useReduzirMovimento } from '@/composables/useReduzirMovimento'
import { nomeNaMensagem } from './conteudo'
import { ladoDaFaixa, tomDaFaixa } from './faixas'

const props = defineProps({
  todas: { type: Array, required: true }, // ordem original (define tom e lado da foto)
  visiveis: { type: Array, required: true }, // o que o filtro mostra, na ordem
  vazia: { type: Object, default: null }, // categoria escolhida sem exemplo
  trocou: { type: Boolean, default: false }, // já houve troca de filtro: quem entra vem aceso (sem 2º reveal)
  respiroFim: { type: Boolean, default: false }, // a costura do fim passa embaixo: 72 px na última faixa
})
const emit = defineEmits(['ver-todas'])

const reduzir = useReduzirMovimento()
const tomDe = (cat) => tomDaFaixa(props.todas, cat)
const ladoDe = (cat) => ladoDaFaixa(props.todas, cat)

const faixas = computed(() =>
  props.visiveis.map((cat, i) => {
    const tom = tomDe(cat)
    const antes = i === 0 ? 'creme' : tomDe(props.visiveis[i - 1]) // a 1ª faixa vem depois da barra do filtro (creme)
    const lado = ladoDe(cat)
    return {
      cat,
      tom,
      lado,
      costura: tom !== antes ? { coluna: lado === 'esquerda' ? 3 : 10, halo: antes } : null,
      ultima: i === props.visiveis.length - 1,
    }
  }),
)

/** A 1ª faixa com costura pede 72 px no fim da barra do filtro (fc-pede-respiro → BlocoRota de cima). */
const pedeRespiro = computed(() => !!faixas.value[0]?.costura)

// saída: tira do fluxo já com a posição e a largura medidas, para quem fica andar junto
function fixar(el) {
  const { offsetTop: t, offsetLeft: l, offsetWidth: w, offsetHeight: h } = el
  Object.assign(el.style, { position: 'absolute', top: `${t}px`, left: `${l}px`, width: `${w}px`, height: `${h}px`, zIndex: '0' })
}
</script>

<template>
  <TransitionGroup
    tag="div"
    class="lista"
    :class="{ 'fc-pede-respiro': pedeRespiro }"
    :name="reduzir ? 'faixa-rm' : 'faixa'"
    @before-leave="fixar"
  >
    <CartaoCategoria
      v-for="(f, i) in faixas"
      :key="f.cat.chave"
      :categoria="f.cat"
      :tom="f.tom"
      layout="faixa"
      :foto-posicao="f.lado"
      :nivel="2"
      :costura="f.costura"
      :ligado="trocou ? true : null"
      :class="{ 'lista__ultima-respiro': f.ultima && respiroFim }"
      :style="{ '--lista-n': i }"
    />
    <BlocoRota
      v-if="vazia"
      key="vazio"
      tag="div"
      tom="creme"
      :pad="{ topo: 16, base: 48 }"
      class="lista__vazio"
      :class="{ 'lista__ultima-respiro': respiroFim }"
    >
      <div class="fc-wrap">
        <EstadoVazio :categoria="nomeNaMensagem(vazia)" @ver-todas="emit('ver-todas')" />
      </div>
    </BlocoRota>
  </TransitionGroup>
</template>

<style scoped>
.lista { position: relative; }
/* página da categoria: o nome é o título da seção (h2) e ganha a escala de seção; a descrição, o corpo grande */
.lista :deep(.fc-cat--faixa .fc-cat__titulo) { font-size: var(--fc-fs-h2); font-weight: 700; line-height: 1.08; letter-spacing: -.015em; margin-bottom: 16px; }
.lista :deep(.fc-cat--faixa .fc-cat__desc) { font-size: var(--fc-fs-corpo-lg); line-height: 1.55; max-width: 44ch; }
.lista :deep(.fc-cat--faixa .fc-cat__exemplos) { margin-top: 24px; }
/* a última faixa encosta na costura do fim (pernas de ±66 px + raio 6): 72 px embaixo, em qualquer largura */
.lista :deep(.fc-cat.lista__ultima-respiro), .lista :deep(.fc-bloco.lista__ultima-respiro) { padding-bottom: var(--fc-respiro-rota); }

/* ---- troca de filtro ---- */
.faixa-move { transition: transform var(--fc-dur-flip) var(--fc-curva-assa); }
.faixa-leave-active { transition: opacity var(--fc-dur-saida) var(--fc-curva-assa), transform var(--fc-dur-saida) var(--fc-curva-assa); }
.faixa-leave-to { opacity: 0; transform: scale(.96); }
.faixa-enter-active {
  transition: opacity var(--fc-dur-entra-item) var(--fc-curva-fermenta), transform var(--fc-dur-entra-item) var(--fc-curva-fermenta);
  transition-delay: calc(var(--fc-dur-saida) + min(var(--lista-n, 0), 5) * var(--fc-stagger-item));
}
.faixa-enter-from { opacity: 0; transform: translateY(var(--fc-desloc-curto)); }
/* vazio: só opacidade, 200 ms a partir de 160 (o texto já está no DOM desde t = 0) */
.faixa-enter-active.lista__vazio { transition: opacity var(--fc-dur-hover) var(--fc-curva-fermenta) var(--fc-dur-saida); }
.faixa-enter-from.lista__vazio { transform: none; }

/* reduzir movimento: sai e troca de lugar na hora; entra só com opacidade */
.faixa-rm-enter-active { transition: opacity var(--fc-dur-reduzido) var(--fc-curva-fermenta); }
.faixa-rm-enter-from { opacity: 0; }
</style>
