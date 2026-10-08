<script setup>
/**
 * 404: uma tela creme, sem rota decorativa e sem Lottie. A assinatura é o
 * indicador de 3 pontos com o 1º e o 2º concluídos e o 3º pendente — a rota que não chegou. Entrada (H1 0–400,
 * texto e botões 100–500, clicáveis desde o 1º quadro); os pontos 1 e 2 acendem em 100–300 e 220–420 (assa) — a
 * entrada é do TresPontos (`acende`) e o trio usa o degrau L (marcador 16, ligação S).
 * Rota: /:pathMatch(.*)* (router) — #/qualquer-coisa e /qualquer-coisa caem aqui.
 */
import BlocoRota from '@/components/rota/BlocoRota.vue'
import BotaoMarca from '@/components/marca/BotaoMarca.vue'
import TresPontos from '@/components/marca/TresPontos.vue'
import { NAO_ENCONTRADA as T } from '@/components/nao-encontrada/conteudo'

const ESTADOS = ['ok', 'ok', 'pendente']
</script>

<template>
  <BlocoRota tom="creme" abre :brilho="{ forma: 'circle', pos: '90% 0%', alfa: 0.18, alcance: '60%' }" class="nf">
    <div class="fc-g">
      <div class="nf__corpo">
        <p class="fc-rot">{{ T.rotulo }}</p>
        <h1 class="fc-display fc-display--interna nf__titulo" data-fc-entrada="0">{{ T.titulo }}</h1>
        <p class="fc-clg fc-txt fc-corpo nf__texto" data-fc-entrada="1">{{ T.texto }}</p>
        <TresPontos modo="passo" tamanho="L" acende :estados="ESTADOS" rotulo="" class="nf__passos" />
        <div class="nf__acoes" data-fc-entrada="1">
          <BotaoMarca variante="ouro" :to="T.inicio.to">{{ T.inicio.rotulo }}</BotaoMarca>
          <BotaoMarca variante="contorno" :whatsapp="T.whatsapp.mensagem">{{ T.whatsapp.rotulo }}</BotaoMarca>
        </div>
        <ul class="nf__links">
          <li v-for="l in T.links" :key="l.to"><router-link :to="l.to" class="fc-link fc-link--acao fc-leg">{{ l.rotulo }}</router-link></li>
        </ul>
      </div>
    </div>
  </BlocoRota>
</template>

<style scoped>
.nf__titulo { margin-top: 20px; text-wrap: balance; }
.nf__texto { margin-top: 24px; }
.nf__passos { margin-top: 32px; }
.nf__acoes { display: flex; flex-wrap: wrap; align-items: flex-start; gap: 16px; margin-top: 32px; }
.nf__links { list-style: none; margin: 24px 0 0; padding: 0; display: flex; flex-wrap: wrap; column-gap: 24px; }
@media (min-width: 1024px) {
  .nf__corpo { grid-column: 2 / 11; }
}
</style>
