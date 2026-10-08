<script setup>
// Política de privacidade `/privacidade`: texto integral + "Falar sobre seus dados".
import PaginaLegal from '@/components/privacidade/PaginaLegal.vue'
import BotaoMarca from '@/components/marca/BotaoMarca.vue'
import { POLITICA } from '@/components/privacidade/texto'
import { PRIVACIDADE } from '@/components/privacidade/conteudo'
</script>

<template>
  <PaginaLegal :rotulo="PRIVACIDADE.rotulo" :titulo="PRIVACIDADE.titulo" :documento="POLITICA">
    <template #fim>
      <BotaoMarca variante="contorno" :whatsapp="PRIVACIDADE.dados.whatsapp">{{ PRIVACIDADE.dados.rotulo }}</BotaoMarca>
      <router-link :to="PRIVACIDADE.inicio.to" class="fc-link fc-link--acao">{{ PRIVACIDADE.inicio.rotulo }}</router-link>
    </template>
  </PaginaLegal>
</template>
