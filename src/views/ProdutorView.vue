<script setup>
/**
 * Seja produtor parceiro `/seja-produtor`.
 *   [C] 1ª tela: título · requisito (selo animado, 1 play) · FormProdutor (AberturaCadastro)
 *   [C] para quem é + pao-cresce (io .4, segmento de entrada, 1×) — mesmo tom, sem costura ═◖═ col 9
 *   [M] o que você ganha: ListaGarantias com reveal (a única cota da página) ═◖═ col 3
 *   [C] requisitos (âncora `requisitos`) ═◖═ col 9
 *   [M] como entrar: ParadasRota numerada (3) + "Preencher o cadastro" (rola e foca a regularização) + → /qualidade
 *   ═◖═ rodapé col 3
 * Lottie da página: selo-sanitario + pao-cresce (+ enviado-sucesso no estado de sucesso do formulário).
 */
import { ref } from 'vue'
import BlocoRota from '@/components/rota/BlocoRota.vue'
import BotaoMarca from '@/components/marca/BotaoMarca.vue'
import BrandLottie from '@/components/marca/BrandLottie.vue'
import TresPontos from '@/components/marca/TresPontos.vue'
import CabecalhoSecao from '@/components/secoes/CabecalhoSecao.vue'
import ListaGarantias from '@/components/secoes/ListaGarantias.vue'
import ParadasRota from '@/components/secoes/ParadasRota.vue'
import AberturaCadastro from '@/components/produtor/AberturaCadastro.vue'
import { useRodape } from '@/composables/useRodape'
import { COMO_ENTRAR, GANHOS, PARA_QUEM, REQUISITOS } from '@/components/produtor/conteudo'

useRodape({ coluna: 3 })

const abertura = ref(null)
const dois = (n) => String(n).padStart(2, '0')
</script>

<template>
  <div class="sp">
    <AberturaCadastro ref="abertura" />

    <BlocoRota tom="creme" rotulado="sp-para-quem">
      <!-- ordem do DOM: rótulo → lista → texto; no desktop a lista vai para a direita -->
      <div class="fc-g sp-pq">
        <!-- o desenho ocupa só x 44–156 / y 94–150 do comp de 200: a caixa da grade é a do DESENHO e o palco do Lottie
             (96/120 px) se desloca por dentro dela, para o pão alinhar com a coluna de texto -->
        <div class="sp-pq__pao"><div class="sp-pq__palco"><BrandLottie name="pao-cresce" trigger="viewport" :limiar="0.4" segmento="entrada" fluido /></div></div>
        <CabecalhoSecao id="sp-para-quem" class="sp-pq__cab" :rotulo="PARA_QUEM.rotulo" :titulo="PARA_QUEM.titulo" />
        <ul class="sp-pq__lista">
          <li v-for="tipo in PARA_QUEM.lista" :key="tipo"><TresPontos modo="bullet" class="sp-pq__ponto" /><span class="sp-pq__item">{{ tipo }}</span></li>
        </ul>
        <p class="fc-clg fc-txt fc-corpo sp-pq__texto">{{ PARA_QUEM.texto }}</p>
      </div>
    </BlocoRota>

    <BlocoRota tom="marrom" :costura="{ coluna: 9, halo: 'creme' }" :brilho="{ forma: 'circle', pos: '0% 100%', alfa: 0.2, alcance: '55%' }" rotulado="sp-ganhos">
      <div class="fc-g sp-ga">
        <CabecalhoSecao id="sp-ganhos" class="sp-ga__cab" :rotulo="GANHOS.rotulo" :titulo="GANHOS.titulo" />
        <div class="sp-ga__corpo">
          <ListaGarantias v-reveal="{ grupo: true }" :itens="GANHOS.itens" />
          <p class="fc-leg fc-txt fc-secundario sp-ga__nota">{{ GANHOS.nota }}</p>
          <router-link v-if="GANHOS.link" :to="GANHOS.link.to" class="fc-link fc-link--acao sp-ga__link">{{ GANHOS.link.rotulo }}</router-link>
        </div>
      </div>
    </BlocoRota>

    <BlocoRota :id="REQUISITOS.id" tom="creme" :costura="{ coluna: 3, halo: 'marrom' }" rotulado="sp-requisitos">
      <div class="fc-g sp-rq">
        <CabecalhoSecao id="sp-requisitos" class="sp-rq__cab" :rotulo="REQUISITOS.rotulo" :titulo="REQUISITOS.titulo" />
        <div class="sp-rq__corpo">
          <ol class="sp-rq__lista">
            <li v-for="(item, i) in REQUISITOS.itens" :key="item.titulo" class="sp-rq__item">
              <span class="sp-rq__num" aria-hidden="true">{{ dois(i + 1) }}</span>
              <div class="sp-rq__texto">
                <h3 class="fc-h3">{{ item.titulo }}</h3>
                <p class="fc-txt fc-corpo">{{ item.texto }}</p>
              </div>
            </li>
          </ol>
          <p class="fc-leg fc-txt fc-secundario sp-rq__nota">{{ REQUISITOS.nota }}</p>
        </div>
      </div>
    </BlocoRota>

    <BlocoRota tom="marrom" :costura="{ coluna: 9, halo: 'creme' }" :brilho="{ forma: 'circle', pos: '100% 0%', alfa: 0.2, alcance: '55%' }" rotulado="sp-como-entrar">
      <div class="fc-g sp-ce">
        <CabecalhoSecao id="sp-como-entrar" class="sp-ce__cab" :rotulo="COMO_ENTRAR.rotulo" :titulo="COMO_ENTRAR.titulo" />
        <ParadasRota class="sp-ce__paradas" :itens="COMO_ENTRAR.paradas" numerada />
        <div class="sp-ce__acoes">
          <BotaoMarca variante="ouro" @click="abertura?.focarFormulario()">{{ COMO_ENTRAR.botao }}</BotaoMarca>
          <router-link :to="COMO_ENTRAR.link.to" class="fc-link fc-link--acao">{{ COMO_ENTRAR.link.rotulo }}</router-link>
        </div>
      </div>
    </BlocoRota>
  </div>
</template>

<style scoped>
/* ---- para quem é (creme, continua a 1ª tela: mesmo tom, sem costura) ---- */
.sp-pq { row-gap: 0; }
/* o pão (pictograma de 96/120 px, como no passo do Como funciona) abre a seção, acima do rótulo. Caixa = o desenho
   (x 44–156 · y 94–150 do comp 200 × 200, quadro 18): 96 px → 54 × 27 deslocado −21/−45; 120 px → 67 × 34, −26/−56 */
.sp-pq__pao { position: relative; width: 54px; height: 27px; margin-bottom: 16px; }
.sp-pq__palco { position: absolute; left: -21px; top: -45px; width: 96px; }
.sp-pq__lista { list-style: none; margin: 24px 0 0; padding: 0; display: grid; grid-template-columns: minmax(0, 1fr); }
.sp-pq__lista li { display: flex; align-items: flex-start; gap: 12px; padding: 16px 0; border-top: 1px solid var(--fc-linha); }
.sp-pq__lista li:last-child { border-bottom: 1px solid var(--fc-linha); }
/* ponto no meio da 1ª linha do item (o item pode quebrar em 2 linhas) */
.sp-pq__ponto { margin-top: calc((1.2 * var(--fc-fs-h3) - 8px) / 2); }
.sp-pq__item {
  font-family: var(--fc-ff-titulo);
  font-optical-sizing: auto;
  font-variation-settings: "SOFT" 100;
  font-weight: 600;
  font-size: var(--fc-fs-h3);
  line-height: 1.2;
  letter-spacing: -.005em;
}
.sp-pq__texto { margin-top: 24px; }
@media (min-width: 1024px) {
  /* pão, cabeçalho e texto nas cols 1–5; a lista nas 7–12 (col 6 livre), com o 1º fio na linha do rótulo; a
     última linha (1fr) absorve a altura da lista */
  .sp-pq { grid-template-rows: auto auto auto 1fr; column-gap: var(--gap); align-items: start; }
  .sp-pq__pao { grid-column: c-start / span 5; grid-row: 1; width: 67px; height: 34px; }
  .sp-pq__palco { left: -26px; top: -56px; width: 120px; }
  .sp-pq__cab { grid-column: c-start / span 5; grid-row: 2; }
  .sp-pq__texto { grid-column: c-start / span 5; grid-row: 3; }
  .sp-pq__lista { grid-column: 8 / c-end; grid-row: 2 / -1; margin-top: 0; align-self: start; }
}

/* ---- o que você ganha (marrom) ---- */
.sp-ga { row-gap: 32px; }
.sp-ga__nota { margin-top: 24px; }
.sp-ga__link { margin-top: 8px; }
@media (min-width: 1024px) {
  .sp-ga { align-items: start; }
  .sp-ga__cab { grid-column: c-start / span 5; }
  .sp-ga__corpo { grid-column: 8 / c-end; } /* cols 7–12: a col 6 fica livre */
}

/* ---- requisitos (creme): lista de exigências numerada, sem caixa (fio entre os itens) ---- */
.sp-rq { row-gap: 32px; }
.sp-rq__lista { list-style: none; margin: 0; padding: 0; border-top: 1px solid var(--fc-linha); }
.sp-rq__item {
  display: grid;
  grid-template-columns: 48px minmax(0, 1fr);
  column-gap: 16px;
  padding: 24px 0;
  border-bottom: 1px solid var(--fc-linha);
}
/* numeral no tamanho e na entrelinha do h3 ao lado: os dois dividem a mesma linha de base */
.sp-rq__num {
  font-family: var(--fc-ff-titulo);
  font-weight: 700;
  font-size: var(--fc-fs-h3);
  line-height: 1.2;
  font-variant-numeric: tabular-nums lining-nums;
  letter-spacing: -.01em;
}
.sp-rq__texto { display: grid; gap: 8px; }
.sp-rq__nota { margin-top: 24px; }
@media (min-width: 1024px) {
  .sp-rq { align-items: start; }
  .sp-rq__cab { grid-column: c-start / span 4; position: sticky; top: 32px; }
  .sp-rq__corpo { grid-column: 7 / c-end; } /* cols 6–12 */
  .sp-rq__item { grid-template-columns: 64px minmax(0, 1fr); }
}

/* ---- como entrar (marrom) ---- */
.sp-ce { row-gap: 32px; }
.sp-ce__acoes { display: flex; flex-wrap: wrap; align-items: center; gap: 16px 32px; }
@media (min-width: 1024px) {
  .sp-ce { row-gap: 48px; }
  .sp-ce__cab { grid-column: c-start / span 7; }
}
</style>
