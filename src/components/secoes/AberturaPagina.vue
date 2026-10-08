<script setup>
/**
 * "Hero curto" das páginas internas: faixa creme (rótulo + H1) → costura →
 * faixa marrom (sub + ações). `faixaEscura=false` (Privacidade, Termos, 404, Produtos, Qualidade): só creme.
 * Entrada: H1 0–400, sub e ações 100–500, fermenta; CTA clicável desde o 1º quadro.
 * Dois blocos irmãos (fragmento): a costura e o respiro de 72 px funcionam entre eles.
 */
import BlocoRota from '@/components/rota/BlocoRota.vue'

defineOptions({ inheritAttrs: false }) // fragmento: atributos de quem usa vão para o 1º bloco
const BRILHO = { forma: 'circle', pos: '90% 0%', alfa: 0.18, alcance: '60%' }
const BRILHO_SO_CREME = { forma: 'ellipse 60% 85%', pos: '90% 0%', alfa: 0.18, alcance: '100%' }
defineProps({
  rotulo: { type: String, default: '' },
  sub: { type: String, default: '' },
  costuraColuna: { type: Number, default: 8 },
  faixaEscura: { type: Boolean, default: true },
  idTitulo: { type: String, default: undefined }, // para aria-labelledby de um posto logo abaixo (Qualidade)
})
</script>

<template>
  <!-- só creme (faixaEscura=false): elipse com o raio vertical dentro do bloco — o brilho some antes da borda e o
       bloco creme seguinte não corta uma linha reta nele -->
  <BlocoRota v-bind="$attrs" tom="creme" abre :brilho="faixaEscura ? BRILHO : BRILHO_SO_CREME" class="fc-abertura">
    <div class="fc-g">
      <div class="fc-abertura__creme">
        <p v-if="rotulo" class="fc-rot fc-abertura__rotulo">{{ rotulo }}</p>
        <h1 :id="idTitulo" class="fc-display fc-display--interna fc-abertura__titulo" data-fc-entrada="0"><slot name="titulo" /></h1>
        <template v-if="!faixaEscura">
          <p v-if="sub" class="fc-clg fc-txt fc-abertura__sub" data-fc-entrada="1">{{ sub }}</p>
          <div v-if="$slots.acoes" class="fc-abertura__acoes" data-fc-entrada="1"><slot name="acoes" /></div>
          <slot name="extra" />
        </template>
      </div>
    </div>
  </BlocoRota>
  <BlocoRota
    v-if="faixaEscura"
    tom="marrom"
    :costura="{ coluna: costuraColuna, halo: 'creme' }"
    :brilho="{ forma: 'circle', pos: '0% 100%', alfa: 0.2, alcance: '60%' }"
    class="fc-abertura fc-abertura--faixa"
  >
    <div class="fc-g">
      <div class="fc-abertura__marrom">
        <p v-if="sub" class="fc-clg fc-txt fc-abertura__sub fc-corpo" data-fc-entrada="1">{{ sub }}</p>
        <div v-if="$slots.acoes" class="fc-abertura__acoes" data-fc-entrada="1"><slot name="acoes" /></div>
        <slot name="extra" />
      </div>
    </div>
  </BlocoRota>
</template>

<style>
.fc-abertura__titulo { margin-top: 20px; text-wrap: balance; }
/* a caixa de texto do H1 display (line-height 1.02) passa da linha em ~0,14 em (13 px a 96): com a costura logo
   abaixo, o respiro sozinho deixaria o 1º ponto encostado no título — mais 8 px só neste caso (80 + 8 ≥ 72 + 13) */
.fc-bloco.fc-abertura:has(+ .fc-abertura--faixa) { --fc-min-base: calc(var(--fc-respiro-rota) + 8px); }
.fc-abertura__rotulo + .fc-abertura__titulo { margin-top: 20px; }
.fc-abertura__creme > .fc-abertura__titulo:first-child { margin-top: 0; }
.fc-abertura__creme .fc-abertura__sub { margin-top: 24px; }
.fc-abertura__acoes { display: flex; flex-wrap: wrap; align-items: flex-start; gap: 16px; margin-top: 32px; }
.fc-abertura__marrom .fc-abertura__acoes { margin-top: 32px; }
@media (min-width: 1024px) {
  .fc-abertura__creme { grid-column: 2 / 12; }
  .fc-abertura__marrom { grid-column: 5 / 12; }
}
</style>
