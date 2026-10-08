<script setup>
/**
 * Superfície de toda seção: fundo com textura "farinha" + brilho opcional,
 * tema do Vuetify do tom (campos e botões de dentro herdam sem prop) e o tom fornecido por inject('fcTom').
 * `costura` desenha a RotaDivisa na borda de cima (halo = tom do bloco ANTERIOR) e garante o respiro de 72 px
 * do lado da divisa — aqui e no bloco de cima (via :has). `faixa`: no celular a costura passa numa coluna
 * livre de 48 px à esquerda em vez do respiro vertical.
 */
import { computed } from 'vue'
import RotaDivisa from './RotaDivisa.vue'
import { provideTom, TEMA_DO_TOM } from '@/composables/useTom'

const props = defineProps({
  tom: { type: String, required: true, validator: (v) => ['creme', 'marrom', 'profundo'].includes(v) },
  tag: { type: String, default: 'section' },
  abre: { type: Boolean, default: false }, // 1º bloco da página: reserva o espaço do AppHeader absoluto
  brilho: { type: Object, default: null }, // { forma: 'circle'|'ellipse', pos: '90% 0%', alfa: .18, alcance: '60%' }
  pad: { type: [String, Object], default: 'secao' }, // 'secao' (48/48) | { topo, base } (número = px, ou CSS)
  costura: { type: Object, default: null }, // { coluna, colunaTablet, x, xMobile, halo, gatilho, somente }
  respiro: { type: Boolean, default: true }, // false = a página garante que a costura passa num x sem texto
  faixa: { type: Boolean, default: false },
  rotulado: { type: String, default: '' }, // id do título para aria-labelledby
})

provideTom(computed(() => props.tom))

// costura que só existe numa faixa de largura (costura.somente): o respiro de 72 px vale só nela
const so = computed(() => (props.costura && props.respiro ? props.costura.somente || '' : null))

// abre: o 1º bloco reserva o espaço do AppHeader absoluto (pad + logo + vão até o rótulo — tokens.css)
const px = (v, padrao) => (v == null ? padrao : typeof v === 'number' ? `${v}px` : v)
const estilo = computed(() => {
  const p = props.pad === 'secao' || !props.pad ? {} : props.pad
  const s = {
    '--fc-pad-topo': props.abre ? 'var(--fc-topo-header)' : px(p.topo, 'var(--fc-secao)'),
    '--fc-pad-base': px(p.base, 'var(--fc-secao)'),
    '--fc-brilho': 'linear-gradient(transparent, transparent)', // não herda o brilho de um bloco de fora
  }
  if (props.brilho) {
    const { forma = 'circle', pos = '50% 50%', alfa = 0.18, alcance = '60%' } = props.brilho
    // teto do brilho dourado: 40 % no claro, 35 % no escuro
    const teto = props.tom === 'creme' ? 0.4 : 0.35
    s['--fc-brilho'] = `radial-gradient(${forma} at ${pos}, color-mix(in srgb, var(--fc-dourado) ${Math.round(Math.min(alfa, teto) * 100)}%, transparent), transparent ${alcance})`
  }
  return s
})
</script>

<template>
  <v-sheet
    :tag="tag"
    :theme="TEMA_DO_TOM[tom]"
    class="fc-bloco fc-tom"
    :class="[
      `fc-tom--${tom}`,
      { 'fc-bloco--abre': abre, 'fc-bloco--costura': costura, 'fc-bloco--respiro': so === '', [`fc-bloco--respiro-${so}`]: !!so, 'fc-bloco--faixa': costura && faixa },
    ]"
    :style="estilo"
    :data-fc-tom="tom"
    :aria-labelledby="rotulado || undefined"
  >
    <RotaDivisa v-if="costura" v-bind="costura" />
    <slot />
  </v-sheet>
</template>

<style>
/* padding por variável: os modificadores (respiro da costura, último bloco) só mexem nos mínimos e não brigam
   com a especificidade do .v-sheet */
.fc-bloco,
.v-sheet.fc-bloco {
  position: relative;
  overflow-x: clip; /* sangria sem rolagem lateral */
  border-radius: 0;
  background: var(--fc-ruido), var(--fc-brilho), var(--fc-superficie);
  color: var(--fc-tinta);
  padding-top: max(var(--fc-pad-topo), var(--fc-min-topo, 0px));
  padding-bottom: max(var(--fc-pad-base), var(--fc-min-base, 0px));
}
/* o último bloco da página encosta na costura do rodapé: respiro ≥ 72 px embaixo, com folga (tokens.css) */
.fc-main > .fc-bloco:last-child, .fc-main > * > .fc-bloco:last-child { --fc-min-base: var(--fc-respiro-rodape); }
/* lado da divisa por onde passa a costura: 72 px aqui e no bloco de cima */
.fc-bloco--respiro { --fc-min-topo: var(--fc-respiro-rota); }
.fc-bloco:has(+ :is(.fc-bloco--respiro, .fc-pede-respiro)) { --fc-min-base: var(--fc-respiro-rota); }
@media (min-width: 1024px) {
  .fc-bloco--respiro-desktop { --fc-min-topo: var(--fc-respiro-rota); }
  .fc-bloco:has(+ .fc-bloco--respiro-desktop) { --fc-min-base: var(--fc-respiro-rota); }
}
@media (max-width: 1023px) {
  .fc-bloco--respiro-celular { --fc-min-topo: var(--fc-respiro-rota); }
  .fc-bloco:has(+ .fc-bloco--respiro-celular) { --fc-min-base: var(--fc-respiro-rota); }
}
@media (max-width: 767px) {
  /* faixa da rota: x = 24 fica numa coluna livre; o texto começa em 48 px aqui e no bloco de cima */
  .v-sheet.fc-bloco--faixa, .v-sheet.fc-bloco:has(+ .fc-bloco--faixa) { padding-inline-start: calc(var(--fc-faixa-rota) - var(--gut)); }
  .fc-bloco--faixa.fc-bloco--respiro { --fc-min-topo: 0px; }
  .fc-bloco:has(+ .fc-bloco--faixa.fc-bloco--respiro) { --fc-min-base: 0px; }
}
</style>
