<script setup>
/**
 * Cabeçalho de seção: rótulo (.fc-rot, digitado em caixa de frase) + título (.fc-h2, com `id`
 * para aria-labelledby) + sub (.fc-txt). H2 de seção NÃO anima. Slot `titulo` para trecho especial.
 */
defineProps({
  rotulo: { type: String, default: '' },
  titulo: { type: String, default: '' },
  sub: { type: String, default: '' },
  nivel: { type: Number, default: 2 },
  id: { type: String, default: undefined }, // id do título
})
</script>

<template>
  <div class="fc-cab">
    <p v-if="rotulo" class="fc-rot fc-cab__rotulo">{{ rotulo }}</p>
    <component :is="`h${nivel}`" :id="id" class="fc-h2 fc-cab__titulo"><slot name="titulo">{{ titulo }}</slot></component>
    <p v-if="sub || $slots.sub" class="fc-txt fc-cab__sub fc-corpo"><slot name="sub">{{ sub }}</slot></p>
  </div>
</template>

<style>
.fc-cab__titulo { margin-top: 16px; }
.fc-cab__rotulo + .fc-cab__titulo { margin-top: 16px; }
.fc-cab > .fc-cab__titulo:first-child { margin-top: 0; }
.fc-cab__sub { margin-top: 16px; }
</style>
