<script setup>
/**
 * Para comércios `/para-comercios`.
 *   [C] 1ª tela: título · FormPedido · apoio (AberturaPedido) ═◖═ col 9
 *   [M] abastecimento recorrente: ParadasRota numerada (4) + foto 4:3 ═◖═ col 3
 *   [C] assinatura de fornada (contorno → WhatsApp) ═◖═ col 9
 *   [M] segurança, faixa curta → /qualidade ═◖═ col 6 (a coluna livre entre o título e o texto do fim)
 *   [C] fim → perguntas frequentes (/como-funciona#faq) e produtos ═◖═ rodapé col 9
 * Costuras em zigue-zague, num x sem texto no desktop sempre que a coluna existe; respiro de
 * 80 px dos dois lados de cada costura pelo token `--fc-respiro-rota`. Sem Lottie de página
 * (o `enviado-sucesso` mora no estado de sucesso do formulário) e sem reveal genérico.
 */
import BlocoRota from '@/components/rota/BlocoRota.vue'
import BotaoMarca from '@/components/marca/BotaoMarca.vue'
import FotoReal from '@/components/marca/FotoReal.vue'
import TresPontos from '@/components/marca/TresPontos.vue'
import CabecalhoSecao from '@/components/secoes/CabecalhoSecao.vue'
import ParadasRota from '@/components/secoes/ParadasRota.vue'
import AberturaPedido from '@/components/comercios/AberturaPedido.vue'
import { ATALHOS } from '@/data/atalhosWhatsapp'
import { useRodape } from '@/composables/useRodape'
import { ASSINATURA, FIM, RECORRENTE, SEGURANCA } from '@/components/comercios/conteudo'

useRodape({ coluna: 9 })
</script>

<template>
  <div class="pc">
    <AberturaPedido />

    <BlocoRota tom="marrom" :costura="{ coluna: 9, halo: 'creme' }" :brilho="{ forma: 'circle', pos: '100% 0%', alfa: 0.2, alcance: '55%' }" rotulado="pc-recorrente">
      <div class="fc-g pc-rec">
        <CabecalhoSecao id="pc-recorrente" class="pc-rec__cab" :rotulo="RECORRENTE.rotulo" :titulo="RECORRENTE.titulo" />
        <FotoReal class="pc-rec__foto" chave="comercios-balcao" proporcao="4:3" />
        <ParadasRota class="pc-rec__paradas" :itens="RECORRENTE.paradas" numerada />
      </div>
    </BlocoRota>

    <!-- base 96 (o respiro da costura é 80): a assinatura termina no botão, logo acima da costura da faixa de segurança
         (x 24 / col 9) — 24 px de folga entre a pílula e o 1º ponto, e não 8 -->
    <BlocoRota tom="creme" :costura="{ coluna: 3, halo: 'marrom' }" :pad="{ base: 96 }" :brilho="{ forma: 'circle', pos: '100% 100%', alfa: 0.16, alcance: '50%' }" rotulado="pc-assinatura">
      <div class="fc-g pc-ass">
        <CabecalhoSecao id="pc-assinatura" class="pc-ass__cab" :rotulo="ASSINATURA.rotulo" :titulo="ASSINATURA.titulo" />
        <div class="pc-ass__corpo">
          <p class="fc-clg fc-txt fc-corpo">{{ ASSINATURA.texto }}</p>
          <BotaoMarca class="pc-ass__botao" variante="contorno" :whatsapp="ATALHOS.assinatura()">{{ ASSINATURA.botao }}</BotaoMarca>
        </div>
      </div>
    </BlocoRota>

    <BlocoRota tag="div" tom="marrom" :costura="{ coluna: 9, halo: 'creme' }">
      <div class="fc-g pc-seg">
        <p class="pc-seg__texto"><TresPontos tamanho="XS" orientacao="vertical" class="pc-seg__trio" /><span>{{ SEGURANCA.texto }}</span></p>
        <router-link :to="SEGURANCA.link.to" class="fc-link fc-link--acao pc-seg__link">{{ SEGURANCA.link.rotulo }}</router-link>
      </div>
    </BlocoRota>

    <!-- topo 96: o bloco abre direto no H2 (sem rótulo) e a caixa de texto do H2 de entrelinha 1,08 sobra ~3 px acima
         da linha — com o respiro de 80 o último ponto ficava a 5 px de "Ficou dúvida?" no celular -->
    <BlocoRota tom="creme" :costura="{ coluna: 6, halo: 'marrom' }" :pad="{ topo: 96 }" rotulado="pc-fim">
      <div class="fc-g pc-fim">
        <h2 id="pc-fim" class="fc-h2 pc-fim__titulo">{{ FIM.titulo }}</h2>
        <div class="pc-fim__corpo">
          <p class="fc-clg fc-txt fc-corpo">{{ FIM.texto }}</p>
          <ul class="pc-fim__links">
            <li v-for="l in FIM.links" :key="l.rotulo"><router-link :to="l.to" class="fc-link fc-link--acao">{{ l.rotulo }}</router-link></li>
          </ul>
        </div>
      </div>
    </BlocoRota>
  </div>
</template>

<style scoped>
/* ---- abastecimento recorrente (marrom) ---- */
.pc-rec { row-gap: 32px; }
.pc-rec__paradas { margin-top: 8px; }
/* espaço de foto no escuro: #5B3A22 com tracejado #F0E6D2, herdado do bloco — a foto clara virava o elemento
   mais forte do bloco, acima do H2 */
@media (min-width: 1024px) {
  /* cabeçalho à esquerda e foto à direita na mesma faixa; a rota das 4 paradas corre embaixo, de ponta a ponta */
  .pc-rec { row-gap: 64px; align-items: end; }
  .pc-rec__cab { grid-column: c-start / span 6; grid-row: 1; padding-bottom: 8px; }
  /* +16 px: a perna da costura (col 9) termina 24 px acima da foto, sem apontar para a borda dela */
  .pc-rec__foto { grid-column: 9 / c-end; grid-row: 1; margin-top: 16px; }
  .pc-rec__paradas { grid-row: 2; margin-top: 0; }
}

/* ---- assinatura (creme) ---- */
.pc-ass { row-gap: 24px; }
.pc-ass__corpo { display: grid; justify-items: start; gap: 32px; }
@media (min-width: 1024px) {
  .pc-ass { align-items: end; }
  .pc-ass__cab { grid-column: c-start / span 5; }
  .pc-ass__corpo { grid-column: 8 / c-end; } /* cols 7–12: a col 6 fica livre */
}

/* ---- segurança: faixa curta (marrom) ---- */
.pc-seg { row-gap: 24px; align-items: center; }
.pc-seg__texto {
  display: flex;
  align-items: flex-start;
  gap: 16px;
  max-width: 40ch;
  font-family: var(--fc-ff-titulo);
  font-optical-sizing: auto;
  font-variation-settings: "SOFT" 100;
  font-weight: 600;
  font-size: var(--fc-fs-h3);
  line-height: 1.25;
  letter-spacing: -.005em;
  color: var(--fc-tinta);
}
/* trio no meio da 1ª linha do texto */
.pc-seg__trio { margin-top: calc((1.25 * var(--fc-fs-h3) - 16px) / 2); }
.pc-seg__link { justify-self: start; }
@media (min-width: 1024px) {
  .pc-seg__texto { grid-column: c-start / span 8; }
  .pc-seg__link { grid-column: 10 / c-end; justify-self: end; text-align: right; }
}

/* ---- fim (creme) ---- */
.pc-fim { row-gap: 24px; }
.pc-fim__corpo { display: grid; gap: 24px; }
.pc-fim__links { list-style: none; margin: 0; padding: 0; display: flex; flex-wrap: wrap; gap: 4px 32px; }
@media (min-width: 1024px) {
  .pc-fim { align-items: start; }
  .pc-fim__titulo { grid-column: c-start / span 5; }
  .pc-fim__corpo { grid-column: 8 / c-end; padding-top: 8px; } /* cols 7–12 */
}
</style>
