<script setup>
/**
 * Segurança alimentar da Início: logo depois da abertura, num creme só — a foto 2 sangrando à
 * esquerda e o selo com o texto à direita. Sem os 3 itens (moram na Qualidade: repetiam o H2, o sub e o H1).
 * ≥ 1024: foto 4:5 da borda da tela até o fim da coluna 3 (418 × 523 a 1440 — menor que a da abertura, de
 * propósito: a abertura passou para as colunas 9–12); texto nas colunas 5–12, centrado na altura da foto.
 * < 1024: selo → rótulo → H2 → sub → foto 4:3 sangrando → nota → link (ordem do DOM, sem `order`).
 * Sem foto no mapa: o texto vai para as colunas 1–8.
 * Embaixo, 80 px de respiro em toda largura: é por ali que a rota da faixa marrom entra (coluna 7 / x 24).
 * Textos: QUALIDADE_HOME (data/garantias), sem mudança. Selo: Lottie normal em io(.4), 1× (SeloSanitario).
 */
import BlocoRota from '@/components/rota/BlocoRota.vue'
import SeloSanitario from '@/components/marca/SeloSanitario.vue'
import FotoReal from '@/components/marca/FotoReal.vue'
import { QUALIDADE_HOME as Q } from '@/data/garantias'
import { fotoNoAr } from '@/data/fotos'

const comFoto = fotoNoAr('inicio-qualidade-etiqueta')
// da borda da tela ao fim da coluna 3: W/2 − 302 a partir de 1200 e (W − 8)/4 abaixo
const SIZES_DESKTOP = '(min-width: 1200px) calc(50vw - 302px), calc(25vw - 2px)'
</script>

<template>
  <BlocoRota
    tom="creme"
    class="fc-qf"
    :class="{ 'fc-qf--sem-foto': !comFoto }"
    :pad="{ topo: 'var(--fc-secao-home)', base: 'var(--fc-respiro-rota)' }"
    rotulado="qualidade-titulo"
  >
    <div class="fc-g fc-qf__g">
      <div class="fc-qf__a">
        <SeloSanitario class="fc-qf__selo" variante="animado" tamanho="medio" tom="creme" />
        <p class="fc-rot fc-qf__rotulo">{{ Q.rotulo }}</p>
        <h2 id="qualidade-titulo" class="fc-h2 fc-qf__titulo">{{ Q.titulo }}</h2>
        <p class="fc-clg fc-txt fc-corpo fc-qf__sub">{{ Q.sub }}</p>
      </div>
      <FotoReal
        v-if="comFoto"
        class="fc-qf__foto"
        chave="inicio-qualidade-etiqueta"
        proporcao="4:3"
        proporcao-desktop="4:5"
        sizes="100vw"
        :sizes-desktop="SIZES_DESKTOP"
        legenda-fora
      />
      <div class="fc-qf__b">
        <p class="fc-leg fc-txt fc-secundario fc-qf__nota">{{ Q.nota }}</p>
        <p class="fc-qf__acao">
          <router-link :to="Q.acao.to" class="fc-link fc-link--acao">{{ Q.acao.rotulo }}</router-link>
        </p>
      </div>
    </div>
  </BlocoRota>
</template>

<style scoped>
.fc-qf__rotulo { margin-top: 24px; }
.fc-qf__titulo { margin-top: 16px; }
.fc-qf__sub { margin-top: 20px; }
.fc-qf__foto { grid-column: full-start / full-end; margin-top: 32px; }
.fc-qf__foto :deep(.fc-foto__legenda--fora) { padding-inline: var(--gut); }
.fc-qf__b { margin-top: 24px; }
.fc-qf__acao { margin-top: 8px; }
@media (min-width: 1024px) {
  /* a foto ocupa as duas linhas; o texto (a em cima, b embaixo) se encontra no meio dela */
  .fc-qf__foto { grid-column: full-start / 5; grid-row: 1 / 3; margin-top: 0; }
  .fc-qf__foto :deep(.fc-foto__legenda--fora) { padding-inline: var(--gut) 0; }
  .fc-qf__a { grid-column: 6 / 14; grid-row: 1; align-self: end; }
  .fc-qf__b { grid-column: 6 / 14; grid-row: 2; align-self: start; }
  .fc-qf--sem-foto .fc-qf__a, .fc-qf--sem-foto .fc-qf__b { grid-column: 2 / 10; }
}
</style>
