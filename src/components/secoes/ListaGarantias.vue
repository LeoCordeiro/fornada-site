<script setup>
/**
 * Lista de garantias: fio de 1 px em cima e entre itens; cada item com trio XS vertical
 * dourado + título (h3) + texto. Trio vertical XS só aqui. No escuro o fio vira creme a 24 % (pelo tom).
 */
import TresPontos from '@/components/marca/TresPontos.vue'

defineProps({
  itens: { type: Array, required: true }, // [{ titulo, texto }]
  nivel: { type: Number, default: 3 },
})
</script>

<template>
  <ul class="fc-garantias">
    <li v-for="item in itens" :key="item.titulo" class="fc-garantias__item">
      <TresPontos tamanho="XS" orientacao="vertical" class="fc-garantias__trio" />
      <component :is="`h${nivel}`" class="fc-h3 fc-garantias__titulo">{{ item.titulo }}</component>
      <p v-if="item.texto" class="fc-txt fc-garantias__texto fc-corpo">{{ item.texto }}</p>
    </li>
  </ul>
</template>

<style>
.fc-garantias { list-style: none; margin: 0; padding: 0; border-top: 1px solid var(--fc-linha, var(--fc-fio)); }
.fc-garantias__item {
  display: grid;
  grid-template-columns: 4px minmax(0, 1fr);
  column-gap: 16px;
  padding: 20px 0;
  border-bottom: 1px solid var(--fc-linha, var(--fc-fio));
}
.fc-garantias__trio { grid-row: 1 / 3; margin-top: 8px; align-self: start; } /* a caixa é só o trio: a rota que chega nele mira os pontos */
.fc-garantias__titulo, .fc-garantias__texto { grid-column: 2; }
.fc-garantias__texto { margin-top: 6px; }
</style>
