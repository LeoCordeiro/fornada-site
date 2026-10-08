<script setup>
/**
 * Se alguma coisa vier errada — bloco CREME: 4 paradas ESTÁTICAS (a rota já desenhada: aqui o
 * texto é o protagonista), o aviso de saúde num bloco com borda marrom (`role="note"`) e o atalho
 * "Avisar pelo WhatsApp" com a mensagem pronta.
 */
import BlocoRota from '@/components/rota/BlocoRota.vue'
import CabecalhoSecao from '@/components/secoes/CabecalhoSecao.vue'
import ParadasRota from '@/components/secoes/ParadasRota.vue'
import BotaoMarca from '@/components/marca/BotaoMarca.vue'
import { ATALHOS } from '@/data/atalhosWhatsapp'
import { RECLAMACOES as R } from './conteudo'

defineProps({
  costura: { type: Object, default: null },
})
</script>

<template>
  <BlocoRota tom="creme" :costura="costura" rotulado="reclamacoes-titulo" class="recl">
    <div class="fc-g">
      <CabecalhoSecao id="reclamacoes-titulo" class="recl__cab" :rotulo="R.rotulo" :titulo="R.titulo" />
      <ParadasRota class="recl__paradas" :itens="R.paradas" numerada estatica />
      <div class="recl__fim">
        <div class="recl__aviso" role="note">
          <p class="recl__aviso-titulo">{{ R.aviso.titulo }}</p>
          <p class="fc-txt fc-corpo">{{ R.aviso.texto }}</p>
        </div>
        <BotaoMarca class="recl__acao" variante="solido" :whatsapp="ATALHOS.problemaPedido()">{{ R.acao }}</BotaoMarca>
      </div>
    </div>
  </BlocoRota>
</template>

<style scoped>
.recl__paradas { margin-top: 40px; }
.recl__fim { display: grid; gap: 24px; justify-items: start; margin-top: 48px; }
.recl__aviso { display: grid; gap: 8px; padding: 20px 20px 24px; border: 2px solid var(--fc-marrom); border-radius: 0; }
.recl__aviso-titulo { font: 600 17px / 1.4 var(--fc-ff-corpo); }
@media (min-width: 1024px) {
  .recl__cab { grid-column: 2 / 11; }
  .recl__paradas { grid-column: 2 / 13; margin-top: 56px; }
  /* aviso nas cols 2–8, atalho ao lado, centrado na altura do aviso */
  .recl__fim { grid-column: 2 / 13; grid-template-columns: minmax(0, 7fr) minmax(0, 4fr); column-gap: calc(var(--gap) * 2); align-items: center; margin-top: 64px; }
  .recl__aviso { padding: 24px 28px 28px; }
}
</style>
