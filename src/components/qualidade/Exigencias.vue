<script setup>
/**
 * O que a rede exige — bloco CREME logo depois do posto (que termina creme: sem costura). Linhas de ficha,
 * não cartões: fio de 1 px entre as exigências, título à esquerda e texto à direita no desktop, empilhados no celular.
 * Sem reveal (texto que "chega" atrapalha a leitura de uma página sobre confiança). `costura`: divisa
 * com a metade marrom do posto (só no desktop: no celular o posto termina creme).
 */
import BlocoRota from '@/components/rota/BlocoRota.vue'
import CabecalhoSecao from '@/components/secoes/CabecalhoSecao.vue'
import { EXIGENCIAS as E } from './conteudo'

defineProps({
  costura: { type: Object, default: null },
})
</script>

<template>
  <BlocoRota tom="creme" :costura="costura" rotulado="exigencias-titulo" class="exig">
    <div class="fc-g">
      <CabecalhoSecao id="exigencias-titulo" class="exig__cab" :rotulo="E.rotulo" :titulo="E.titulo" />
      <ul class="exig__lista">
        <li v-for="(item, i) in E.itens" :key="item.titulo" class="exig__item">
          <span class="exig__num fc-tab" aria-hidden="true">{{ String(i + 1).padStart(2, '0') }}</span>
          <h3 class="fc-h3 exig__titulo">{{ item.titulo }}</h3>
          <p class="fc-txt fc-corpo exig__texto">{{ item.texto }}</p>
        </li>
      </ul>
    </div>
  </BlocoRota>
</template>

<style scoped>
.exig__lista { list-style: none; margin: 32px 0 0; padding: 0; border-top: 1px solid var(--fc-linha); }
.exig__item {
  display: grid;
  grid-template-columns: 40px minmax(0, 1fr);
  column-gap: 8px;
  padding: 24px 0 28px;
  border-bottom: 1px solid var(--fc-linha);
}
/* numeral (Fraunces 700, tabular), como os das paradas desta página */
.exig__num {
  grid-row: 1;
  padding-top: 4px;
  font-family: var(--fc-ff-titulo);
  font-optical-sizing: auto;
  font-variation-settings: "SOFT" 100;
  font-weight: 700;
  font-size: 18px;
  line-height: 1;
  font-variant-numeric: tabular-nums lining-nums;
  color: var(--fc-tinta);
}
.exig__titulo { grid-column: 2; }
.exig__texto { grid-column: 2; margin-top: 10px; }
@media (min-width: 1024px) {
  .exig__cab, .exig__lista { grid-column: 2 / 12; }
  .exig__lista { margin-top: 48px; }
  /* ficha: numeral · título (cols 2–5) · texto (cols 6–11) */
  .exig__item { grid-template-columns: 56px minmax(0, 4fr) minmax(0, 6fr); column-gap: var(--gap); padding: 32px 0 36px; }
  .exig__num { font-size: 24px; padding-top: 5px; }
  .exig__titulo { grid-column: 2; }
  .exig__texto { grid-column: 3; margin-top: 0; }
}
</style>
