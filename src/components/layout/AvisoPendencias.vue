<script setup>
/**
 * Só em dev, prévia e teste (dentro da faixa do topo do App.vue — dobrado para fora em produção): botão
 * "N pendências do cliente" que abre, por cima do cabeçalho, a lista do portão (o mesmo que barra o build de
 * produção). Nada flutua sobre a página (um selo flutuante cobria o conteúdo).
 * data-portao="pendencias" marca o aviso para os testes: é pendência de publicação, não defeito da página.
 * `prefixo`: abaixo de 768 a faixa tem uma linha só — o aviso longo da prévia some e o botão diz
 * "Prévia · 4 pendências do cliente"; o detalhe fica na lista que ele abre.
 * A lista fala com o cliente: o texto técnico (campo, formato) fica no console de dev e na
 * mensagem do portão do build. Esc fecha a lista e devolve o foco ao botão.
 */
import { onBeforeUnmount, ref, watch } from 'vue'
import { listarPendenciasCliente } from '@/config/pendencias-build'
import { SITE } from '@/config/site'

defineProps({
  prefixo: { type: String, default: '' },
})
const pendencias = listarPendenciasCliente(SITE)
const aberto = ref(false)
const botao = ref(null)

function aoTeclar(e) {
  if (e.key !== 'Escape') return
  e.preventDefault()
  aberto.value = false
  botao.value?.focus()
}
watch(aberto, (v) => (v ? document.addEventListener('keydown', aoTeclar) : document.removeEventListener('keydown', aoTeclar)))
onBeforeUnmount(() => document.removeEventListener('keydown', aoTeclar))
</script>

<template>
  <div v-if="pendencias.length" class="fc-aviso-pendencias" data-portao="pendencias">
    <button ref="botao" type="button" class="fc-aviso-pendencias__selo" :aria-expanded="String(aberto)" aria-controls="lista-pendencias" @click="aberto = !aberto">
      <span v-if="prefixo" class="fc-aviso-pendencias__prefixo">{{ prefixo }} · </span>{{ pendencias.length }} {{ pendencias.length === 1 ? 'pendência' : 'pendências' }} do cliente
    </button>
    <ul v-show="aberto" id="lista-pendencias" class="fc-aviso-pendencias__lista">
      <li v-for="p in pendencias" :key="p">{{ p }}</li>
    </ul>
  </div>
</template>

<style>
.fc-aviso-pendencias { display: contents; }
.fc-aviso-pendencias__selo {
  min-height: 44px;
  padding: 0 4px;
  border: 0;
  background: none;
  color: inherit;
  font: inherit;
  letter-spacing: inherit;
  text-decoration: underline;
  text-underline-offset: 3px;
  cursor: pointer;
}
.fc-aviso-pendencias__selo:focus-visible { outline: 3px solid var(--fc-creme); outline-offset: -3px; }
.fc-aviso-pendencias__prefixo { display: none; }
@media (max-width: 767px) { .fc-aviso-pendencias__prefixo { display: inline; } }
.fc-aviso-pendencias__lista {
  position: absolute;
  top: 100%;
  inset-inline: var(--gut);
  max-width: 480px;
  margin: 0 auto;
  padding: 12px 16px 12px 28px;
  background: var(--fc-creme);
  color: var(--fc-marrom);
  border: 1px solid var(--fc-marrom);
  font: 400 var(--fc-fs-legenda) / 1.45 var(--fc-ff-corpo);
  letter-spacing: normal;
  text-align: left;
  box-shadow: var(--fc-sombra-2);
}
@media print { .fc-faixa-previa { display: none; } }
</style>
