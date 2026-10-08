<script setup>
// Termos de uso `/termos`: texto integral + links do fim.
import PaginaLegal from '@/components/privacidade/PaginaLegal.vue'
import { TERMOS } from '@/components/termos/texto'
import { TERMOS_PAGINA } from '@/components/termos/conteudo'
</script>

<template>
  <PaginaLegal :rotulo="TERMOS_PAGINA.rotulo" :titulo="TERMOS_PAGINA.titulo" :documento="TERMOS">
    <template #fim>
      <router-link v-for="l in TERMOS_PAGINA.fim" :key="l.to" :to="l.to" class="fc-link fc-link--acao">{{ l.rotulo }}</router-link>
    </template>
  </PaginaLegal>
</template>
