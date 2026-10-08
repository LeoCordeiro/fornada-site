<script setup>
/**
 * Quem responde pelo quê — `[M | C]` com costura vertical. Faixa marrom do título (a costura do
 * bloco de cima entra nela) que continua na metade da Fornada; ao lado, a metade creme de cada produtor parceiro;
 * embaixo, a frase da costura numa linha própria, centrada no x da parada, e a nota final.
 * Desktop: divisa no meio do vão entre as cols 6 e 7 (centro da página), costura horizontal no meio da altura, 80 px
 * de texto até ela (pernas de 72). Celular: empilha — título + Fornada (marrom) ═◖═ produtor (creme) → frase e nota.
 * Da metade marrom para a faixa da frase (só desktop): costura na col 3, sob a metade marrom. Da faixa do título para a
 * metade creme (só desktop): costura na col 12, o mesmo x da que entra na faixa: a rota atravessa a faixa.
 */
import BlocoRota from '@/components/rota/BlocoRota.vue'
import RotaDivisa from '@/components/rota/RotaDivisa.vue'
import CabecalhoSecao from '@/components/secoes/CabecalhoSecao.vue'
import TresPontos from '@/components/marca/TresPontos.vue'
import { RESPONSABILIDADES as R } from './conteudo'

// centro da coluna 12 medido a partir da borda esquerda da metade creme (que começa no meio do vão entre as cols 6 e
// 7): 5,5 × (coluna + vão), com a coluna da grade de 12 calculada na largura da seção (cqw do .resp__duplo)
const X_COL12_NA_METADE = 'calc(5.5 * ((min(100cqw, var(--fc-wrap-max)) - 2 * var(--gut) - 11 * var(--gap)) / 12 + var(--gap)))'

defineProps({
  costura: { type: Object, default: null }, // costura no topo da faixa do título (halo = tom do bloco de cima)
})
</script>

<template>
  <section class="resp" :class="{ 'fc-pede-respiro': costura }" aria-labelledby="responsabilidades-titulo">
    <BlocoRota tag="div" tom="marrom" :costura="costura" :pad="{ topo: 48, base: 0 }" class="resp__topo">
      <div class="fc-g">
        <CabecalhoSecao id="responsabilidades-titulo" class="resp__cab" :rotulo="R.rotulo" :titulo="R.titulo" />
      </div>
    </BlocoRota>

    <div class="resp__duplo">
      <div class="fc-g">
        <div class="resp__lado resp__lado--m fc-tom fc-tom--marrom">
          <h3 class="fc-h3">{{ R.fornada.titulo }}</h3>
          <ul class="resp__lista">
            <li v-for="item in R.fornada.itens" :key="item"><TresPontos modo="bullet" class="resp__ponto" /><span class="fc-corpo">{{ item }}</span></li>
          </ul>
        </div>
        <div class="resp__lado resp__lado--c fc-tom fc-tom--creme">
          <RotaDivisa somente="celular" halo="marrom" />
          <!-- desktop: a faixa do título (marrom) encontra a metade creme; costura no x da que entra na faixa (col 12) -->
          <RotaDivisa somente="desktop" halo="marrom" :x="X_COL12_NA_METADE" />
          <h3 class="fc-h3">{{ R.produtor.titulo }}</h3>
          <ul class="resp__lista">
            <li v-for="item in R.produtor.itens" :key="item"><TresPontos modo="bullet" class="resp__ponto" /><span class="fc-corpo">{{ item }}</span></li>
          </ul>
        </div>
      </div>
      <RotaDivisa somente="desktop" orientacao="horizontal" x="50%" halo="marrom" />
    </div>

    <BlocoRota tag="div" tom="creme" :pad="{ topo: 8, base: 'var(--fc-respiro-rota)' }" :costura="{ coluna: 3, halo: 'marrom', somente: 'desktop' }" class="resp__fecho">
      <div class="fc-g">
        <div class="resp__fecho-corpo">
          <p class="fc-clg fc-corpo resp__frase">{{ R.frase }}</p>
          <p class="fc-leg resp__nota">{{ R.nota }}</p>
        </div>
      </div>
    </BlocoRota>
  </section>
</template>

<style scoped>
.resp__duplo { position: relative; overflow-x: clip; container-type: inline-size; }
.resp__lado { grid-column: full-start / full-end; position: relative; }
/* celular/tablet: empilha; a costura do topo da metade creme pede 72 px dos dois lados */
.resp__lado--m {
  background: var(--fc-ruido-e), var(--fc-marrom);
  background-color: var(--fc-marrom);
  padding: 32px var(--gut) var(--fc-respiro-rota);
}
.resp__lado--c {
  background: var(--fc-ruido-c), var(--fc-creme);
  background-color: var(--fc-creme);
  padding: var(--fc-respiro-rota) var(--gut) 32px;
}
.resp__lista { list-style: none; margin: 20px 0 0; padding: 0; }
.resp__lista li { display: flex; align-items: flex-start; gap: 14px; padding: 14px 0; border-top: 1px solid var(--fc-linha); }
.resp__lista li:last-child { border-bottom: 1px solid var(--fc-linha); }
.resp__ponto { margin-top: calc((1.6em - 8px) / 2); }
.resp__frase { font-weight: 500; max-width: 34ch; }
.resp__nota { margin-top: 20px; max-width: 62ch; color: var(--fc-marrom-medio); } /* marrom-médio só sobre creme, ≥ 14 px */

@media (min-width: 1024px) {
  .resp__topo { --fc-min-base: 24px; } /* a metade creme começa um pouco abaixo do título, não colada nele */
  .resp__cab { grid-column: 2 / 11; }
  /* metades = ancestrais reais do texto; divisa no centro da página; o recuo em cqw devolve o
     conteúdo às colunas e 80 px separam o texto da costura horizontal (pernas de 72 px) */
  .resp__lado--m {
    grid-column: full-start / 8;
    margin-right: calc(var(--gap) / -2);
    padding: 40px calc(80px + var(--gap) / 2) var(--fc-respiro-rota) calc((100cqw - min(100cqw, var(--fc-wrap-max))) / 2 + var(--gut));
  }
  .resp__lado--c {
    grid-column: 8 / full-end;
    margin-left: calc(var(--gap) / -2);
    padding: 40px calc((100cqw - min(100cqw, var(--fc-wrap-max))) / 2 + var(--gut)) var(--fc-respiro-rota) calc(80px + var(--gap) / 2);
  }
  /* cols 2–11: centro no x da divisa vertical e da parada, o centro da página */
  .resp__fecho-corpo { grid-column: 3 / 13; display: grid; justify-items: center; text-align: center; }
  .resp__frase { max-width: 36ch; }
}
</style>
