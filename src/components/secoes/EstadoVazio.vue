<script setup>
/**
 * Catálogo vazio do filtro de Produtos. O TEXTO está no DOM desde t = 0 (a
 * informação nunca depende do Lottie); `catalogo-vazio` toca 1× 160 ms depois de aparecer (se estiver fora da tela,
 * toca quando entrar), decorativo; sob RM, pôster. Ações: "Perguntar no WhatsApp" (atalho pronto com a
 * categoria) e "Ver todas as categorias" (emite `ver-todas`; quem usa volta o filtro para "Todos").
 */
import { onBeforeUnmount, onMounted, ref } from 'vue'
import BrandLottie from '@/components/marca/BrandLottie.vue'
import BotaoMarca from '@/components/marca/BotaoMarca.vue'
import { ATALHOS } from '@/data/atalhosWhatsapp'
import { DUR } from '@/lib/motion'
import { observarUmaVez } from '@/lib/gatilho'

const props = defineProps({
  texto: { type: String, default: 'Nada nessa categoria por enquanto. Pergunta no WhatsApp — a rede pode ter.' },
  categoria: { type: String, default: '' }, // nome visível da categoria (vai na mensagem do WhatsApp)
  verTodas: { type: Boolean, default: true },
})
defineEmits(['ver-todas'])

const raiz = ref(null)
const anim = ref(null)
let soltar = null
let tmr = 0
onMounted(() => {
  soltar = observarUmaVez(raiz.value, {
    entrar: () => (tmr = setTimeout(() => anim.value?.play(), DUR.saida)),
    passou: () => anim.value?.poster(),
  })
})
onBeforeUnmount(() => {
  soltar?.()
  clearTimeout(tmr)
})
const mensagem = () => ATALHOS.categoriaVazia(props.categoria || 'isso')
</script>

<template>
  <div ref="raiz" class="fc-vazio">
    <BrandLottie ref="anim" class="fc-vazio__lottie" name="catalogo-vazio" trigger="manual" fluido />
    <p class="fc-clg fc-vazio__texto">{{ texto }}</p>
    <div class="fc-vazio__acoes">
      <BotaoMarca variante="contorno" :whatsapp="mensagem()">Perguntar no WhatsApp</BotaoMarca>
      <button v-if="verTodas" type="button" class="fc-link fc-vazio__todas" @click="$emit('ver-todas')">Ver todas as categorias</button>
    </div>
  </div>
</template>

<style>
.fc-vazio { display: grid; justify-items: start; gap: 16px; }
.fc-vazio__lottie.fc-lottie { width: 160px; }
.fc-vazio__texto { max-width: 40ch; }
/* < 768: o Lottie em 96 px AO LADO do texto — a mensagem sobe para a 1ª tela depois do clique no filtro */
@media (max-width: 767px) {
  .fc-vazio { grid-template-columns: 96px minmax(0, 1fr); align-items: center; column-gap: 16px; }
  .fc-vazio__lottie.fc-lottie { width: 96px; }
  .fc-vazio__acoes { grid-column: 1 / -1; }
}
.fc-vazio__acoes { display: flex; flex-wrap: wrap; align-items: center; gap: 12px 24px; margin-top: 8px; }
.fc-vazio__todas { min-height: 44px; padding: 0; border: 0; background: none; cursor: pointer; font: inherit; color: inherit; }
</style>
