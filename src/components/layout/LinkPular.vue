<script setup>
// "Pular para o conteúdo": 1º focável, aparece no foco. Foca o <main> por JS SEM mudar o hash —
// âncora crua para #conteudo viraria rota no hash mode e cairia no 404. O href aponta para a própria rota (#/…).
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'

const route = useRoute()
const router = useRouter()
const alvo = computed(() => router.resolve(route.fullPath).href)

function pular() {
  const main = document.getElementById('conteudo')
  main?.focus({ preventScroll: true })
  main?.scrollIntoView({ block: 'start', behavior: 'instant' })
}
</script>

<template>
  <a class="fc-pular" :href="alvo" @click.prevent="pular">Pular para o conteúdo</a>
</template>

<style>
.fc-pular {
  position: fixed;
  left: 16px;
  top: 16px;
  z-index: 3000;
  padding: 12px 20px;
  min-height: 48px;
  display: inline-flex;
  align-items: center;
  background: var(--fc-marrom);
  color: var(--fc-creme);
  font: 600 var(--fc-fs-botao) / 1.2 var(--fc-ff-corpo);
  text-decoration: none;
  transform: translateY(-200%);
  opacity: 0;
}
.fc-pular:focus-visible, .fc-pular:focus {
  transform: none;
  opacity: 1;
  outline: 3px solid var(--fc-marrom-profundo);
  outline-offset: 3px;
}
</style>
