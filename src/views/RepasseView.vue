<script setup>
// Política de repasse e intermediação `/repasse`: texto integral, na mesma página das legais.
import PaginaLegal from '@/components/privacidade/PaginaLegal.vue'
import { REPASSE as TEXTO } from '@/components/repasse/texto'
import { REPASSE } from '@/components/repasse/conteudo'
</script>

<template>
  <PaginaLegal :rotulo="REPASSE.rotulo" :titulo="REPASSE.titulo" :documento="TEXTO">
    <template #fim>
      <router-link v-for="l in REPASSE.fim" :key="l.to" :to="l.to" class="fc-link fc-link--acao">{{ l.rotulo }}</router-link>
    </template>
  </PaginaLegal>
</template>
