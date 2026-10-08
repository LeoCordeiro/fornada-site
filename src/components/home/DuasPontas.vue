<script setup>
/**
 * As duas pontas da Início: o problema, o "para quem é" e a chamada final numa seção — o fim da
 * página. Duas portas que não são cartões (sem fundo, borda, sombra ou raio) e o ícone oficial C+F no eixo entre elas,
 * com `pontos-conecta` em io(.5), 1× (IconeMarca, gatilho viewport): a Fornada no meio das duas pontas.
 * ≥ 1024: H2 nas colunas 1–8, sub nas 1–7; comércio nas 1–5 (foto 3:2, maior: é o público principal), ícone de
 * 160 px no centro da coluna 7 e na altura das fotos, produtor nas 9–12. A costura do rodapé desce na coluna 7, logo
 * abaixo do ícone (HomeView: useRodape coluna 7; o respiro de 96 px embaixo é do BlocoRota, último bloco).
 * Tablet: portas nas colunas 1–4 e 5–8, ícone de 96 px acima delas, à esquerda.
 * Celular: H2 → sub → comércio (foto sangrando as duas bordas) → ícone → produtor (idem).
 * Fotos sem legenda — a Início não afirma de quem é o balcão nem o forno. Sem foto no mapa, a porta fica só com o
 * texto, com os botões alinhados embaixo; na prévia o espaço tracejado com o briefing segura o lugar.
 */
import BlocoRota from '@/components/rota/BlocoRota.vue'
import BotaoMarca from '@/components/marca/BotaoMarca.vue'
import IconeMarca from '@/components/marca/IconeMarca.vue'
import FotoReal from '@/components/marca/FotoReal.vue'
import { CTA_COMERCIO, CTA_PRODUTOR_CURTO } from '@/data/navegacao'
import { fotoNoAr } from '@/data/fotos'
import { PONTAS as P } from './conteudo'

const fotoComercio = fotoNoAr('inicio-ponta-comercio')
const fotoProdutor = fotoNoAr('inicio-ponta-produtor')
// colunas 1–5 (459 a partir de 1200) e 9–12 (363); no tablet, 4 colunas da grade de 8 (W/2 − 44); no celular, a tela
const SIZES_COMERCIO = '(min-width: 1200px) 459px, (min-width: 1024px) calc(41.7vw - 41px), (min-width: 768px) calc(50vw - 44px), 100vw'
const SIZES_PRODUTOR = '(min-width: 1200px) 363px, (min-width: 1024px) calc(33.3vw - 37px), (min-width: 768px) calc(50vw - 44px), 100vw'
</script>

<template>
  <BlocoRota tom="creme" class="fc-dp" :pad="{ topo: 'var(--fc-secao-home)', base: 'var(--fc-secao-home)' }" rotulado="pontas-titulo">
    <div class="fc-g fc-dp__g">
      <h2 id="pontas-titulo" class="fc-h2 fc-dp__titulo">{{ P.titulo }}</h2>
      <p class="fc-clg fc-txt fc-corpo fc-dp__sub">{{ P.sub }}</p>
      <div class="fc-dp__porta fc-dp__porta--comercio">
        <FotoReal v-if="fotoComercio" class="fc-dp__foto" chave="inicio-ponta-comercio" proporcao="3:2" :sizes="SIZES_COMERCIO" />
        <div class="fc-dp__corpo">
          <h3 class="fc-rot fc-dp__rotulo">{{ P.comercio.rotulo }}</h3>
          <p class="fc-corpo fc-dp__texto">{{ P.comercio.texto }}</p>
          <BotaoMarca class="fc-dp__cta" variante="ouro" :to="CTA_COMERCIO.to">{{ CTA_COMERCIO.rotulo }}</BotaoMarca>
        </div>
      </div>
      <div class="fc-dp__icone">
        <IconeMarca :tamanho="{ base: 96, desktop: 160 }" />
      </div>
      <div class="fc-dp__porta fc-dp__porta--produtor">
        <FotoReal v-if="fotoProdutor" class="fc-dp__foto" chave="inicio-ponta-produtor" proporcao="3:2" :sizes="SIZES_PRODUTOR" />
        <div class="fc-dp__corpo">
          <h3 class="fc-rot fc-dp__rotulo">{{ P.produtor.rotulo }}</h3>
          <p class="fc-corpo fc-dp__texto">{{ P.produtor.texto }}</p>
          <!-- rótulo curto (o mesmo do cabeçalho): o longo não cabe nas 4 colunas da porta (363 px a 1440) e
               virava botão de 2 linhas; a porta já diz "Para quem tem forno" -->
          <BotaoMarca class="fc-dp__cta" variante="contorno" :to="CTA_PRODUTOR_CURTO.to">{{ CTA_PRODUTOR_CURTO.rotulo }}</BotaoMarca>
        </div>
      </div>
    </div>
  </BlocoRota>
</template>

<style scoped>
.fc-dp__sub { margin-top: 20px; }
.fc-dp__porta { margin-top: 40px; min-width: 0; }
.fc-dp__icone { margin-top: 40px; }
/* a porta é uma coluna: o botão vai para o pé dela (margin-top auto) — com as duas lado a lado (≥ 768) e textos de
   tamanhos diferentes, os dois botões ficam na mesma linha; empilhadas, o vão de 24 px é o do texto */
.fc-dp__corpo { display: flex; flex-direction: column; align-items: flex-start; }
.fc-dp__texto { margin: 12px 0 24px; }
.fc-dp__cta { margin-top: auto; }
/* celular: a foto da porta sangra as duas bordas, 20 px acima do rótulo */
@media (max-width: 767px) {
  .fc-dp__foto { margin: 0 calc(var(--gut) * -1) 20px; }
}
/* ≥ 768: cada porta ocupa 2 linhas da grade (subgrid): fotos numa linha, textos na outra — o ícone centra na das fotos */
@media (min-width: 768px) {
  .fc-dp__g { row-gap: 0; }
  .fc-dp__porta { display: grid; grid-template-rows: subgrid; grid-row: 4 / 6; margin-top: 32px; }
  .fc-dp__foto + .fc-dp__corpo { margin-top: 24px; }
  .fc-dp__porta--comercio { grid-column: 2 / 6; }
  .fc-dp__porta--produtor { grid-column: 6 / 10; }
  .fc-dp__icone { grid-row: 3; grid-column: 2 / 4; margin-top: 40px; }
}
@media (min-width: 1024px) {
  .fc-dp__titulo { grid-column: 2 / 10; }
  .fc-dp__sub { grid-column: 2 / 9; }
  .fc-dp__porta { grid-row: 3 / 5; margin-top: 56px; }
  .fc-dp__porta--comercio { grid-column: 2 / 7; }
  .fc-dp__porta--produtor { grid-column: 10 / 14; }
  .fc-dp__icone { grid-row: 3; grid-column: 8 / 9; justify-self: center; align-self: center; margin-top: 56px; }
}
</style>
