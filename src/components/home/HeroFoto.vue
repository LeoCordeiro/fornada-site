<script setup>
/**
 * Abertura da Início: num creme só, o texto e a foto 1 sangrando — sem faixa marrom, sem ícone,
 * sem rota, sem garantias (moram na Qualidade).
 * ≥ 1024: foto nas colunas 9–12 até a borda direita, com o topo em y 116; texto nas colunas 1–8, centralizado na
 * altura da foto (com o H1 de 80 px, "na hora combinada." mede 696 px: nas 7 colunas o H1 iria para 4 linhas). A foto
 * é 4:5 até HERO_FOTO.alturaMax (e nunca passa do fim da tela); em tela larga o quadro fica mais largo que alto e a
 * foto corta em cima e embaixo pelo ponto focal do mapa — a altura da abertura acompanha o texto em vez de crescer com
 * a largura. É o LCP do desktop: fetchpriority high + preload pela pré-busca da rota (vite.config, só ≥ 1024).
 * < 1024: rótulo → H1 → sub → CTAs → foto 4:3 (3:2 no tablet) sangrando as duas bordas, com o topo ≥ 700 a 375×812:
 * no celular o LCP continua sendo o H1 e a foto carrega lazy, sem disputar banda com a fonte.
 * Sem foto no mapa (fotoNoAr): H1 de 96 px nas colunas 1–10, uma coluna só.
 * Entrada: H1 por linha ≥ 1024 (0–500, 80 ms entre linhas), inteiro abaixo (0–340); sub com
 * opacidade 160–560 e CTAs subindo 14 px no mesmo tempo. CTA clicável desde o t = 0. Foto não anima.
 * Página já vista e reduzir movimento: tudo no estado final.
 */
import { onBeforeUnmount, onMounted, ref } from 'vue'
import BlocoRota from '@/components/rota/BlocoRota.vue'
import BotaoMarca from '@/components/marca/BotaoMarca.vue'
import FotoReal from '@/components/marca/FotoReal.vue'
import { CTA_COMERCIO, CTA_PRODUTOR } from '@/data/navegacao'
import { fotoNoAr } from '@/data/fotos'
import { quandoRevelada } from '@/composables/useVeu'
import { usePaginaVista } from '@/composables/useVisita'
import { HERO, HERO_FOTO } from './conteudo'

const t = HERO.titulo
const comFoto = fotoNoAr('inicio-abertura-caixas')
const alturaFoto = { '--fc-ab-foto-max': `${HERO_FOTO.alturaMax}px` }

const vista = usePaginaVista()
// sequência terminada: as animações de entrada saem do CSS (trocar de largura ou ligar o reduzir movimento depois
// disso não faz nada entrar de novo)
const pronto = ref(vista)
let cancelar = null
let tmr = 0
onMounted(() => {
  if (vista) return
  cancelar = quandoRevelada(() => {
    tmr = setTimeout(() => (pronto.value = true), 1000)
  })
})
onBeforeUnmount(() => {
  clearTimeout(tmr)
  cancelar?.()
})
</script>

<template>
  <BlocoRota
    tom="creme"
    class="fc-ab"
    :class="{ 'fc-ab--sem-foto': !comFoto, 'is-pronto': pronto }"
    :pad="{ topo: 'var(--fc-ab-topo)', base: 'var(--fc-secao-home)' }"
    :style="alturaFoto"
    rotulado="hero-titulo"
  >
    <div class="fc-g fc-ab__g">
      <div class="fc-ab__texto">
        <p class="fc-rot fc-ab__rotulo">{{ HERO.rotulo }}<span class="fc-ab__sep"> · </span><span class="fc-ab__cidade">{{ HERO.cidade }}</span></p>
        <!-- spans na mesma linha: o espaço entre eles é parte do texto (abaixo de 1024 as linhas correm juntas) -->
        <h1 id="hero-titulo" class="fc-display fc-ab__h1"><span class="fc-ab__l">{{ t.linha1 }}</span> <span class="fc-ab__l">{{ t.linha2 }} <em class="fc-leve">{{ t.leve }}</em>{{ t.virgula }}</span> <span class="fc-ab__l">{{ t.linha3 }}</span></h1>
        <p class="fc-clg fc-txt fc-ab__sub">{{ HERO.sub }}</p>
        <div class="fc-ab__ctas">
          <BotaoMarca variante="ouro" :to="CTA_COMERCIO.to">{{ CTA_COMERCIO.rotulo }}</BotaoMarca>
          <BotaoMarca variante="contorno" :to="CTA_PRODUTOR.to">{{ CTA_PRODUTOR.rotulo }}</BotaoMarca>
        </div>
      </div>
      <FotoReal
        v-if="comFoto"
        class="fc-ab__foto"
        chave="inicio-abertura-caixas"
        proporcao="4:3"
        proporcao-tablet="3:2"
        proporcao-desktop="4:5"
        sizes="100vw"
        :sizes-desktop="HERO_FOTO.sizesDesktop"
        :media-largo="HERO_FOTO.mediaLarga"
        :sizes-largo="HERO_FOTO.sizesLarga"
        prioridade="(min-width: 1024px)"
        legenda-fora
      />
    </div>
  </BlocoRota>
</template>

<style scoped>
/* topo: abaixo do cabeçalho absoluto; no desktop a foto começa em 116 */
.fc-ab { --fc-ab-topo: var(--fc-topo-header); }
.fc-ab__rotulo { margin-bottom: 20px; }
/* < 400: a cidade desce inteira, sem "·" sozinho no fim da 1ª linha */
@media (max-width: 399px) {
  .fc-ab__sep { display: none; }
  .fc-ab__cidade { display: block; }
}
.fc-ab__h1 { font-size: var(--fc-fs-display-home); }
.fc-ab__l { display: inline; }
/* "todo dia" não se parte em largura nenhuma */
.fc-ab__h1 .fc-leve { white-space: nowrap; }
.fc-ab__sub { margin-top: 24px; }
.fc-ab__ctas { display: flex; flex-direction: column; align-items: flex-start; gap: 16px; margin-top: 32px; }
/* a foto sangra as duas bordas abaixo de 1024 (a legenda, quando a foto real tiver, volta para dentro da margem) */
.fc-ab__foto { grid-column: full-start / full-end; margin-top: 56px; }
.fc-ab__foto :deep(.fc-foto__legenda--fora) { padding-inline: var(--gut); }
@media (min-width: 768px) {
  .fc-ab__ctas { flex-direction: row; flex-wrap: wrap; }
}
@media (min-width: 1024px) {
  .fc-ab { --fc-ab-topo: 116px; }
  /* texto no meio da altura da foto (ou a foto em cima, quando o texto é o mais alto, como a 1024) */
  .fc-ab__g { align-items: center; }
  .fc-ab__texto { grid-column: 2 / 10; grid-row: 1; }
  .fc-ab__l { display: block; }
  .fc-ab__ctas { margin-top: 40px; }
  .fc-ab__foto { grid-column: 10 / full-end; grid-row: 1; margin-top: 0; align-self: start; }
  /* 4:5 até a altura máxima, que também não passa do fim da tela (mínimo 420): acima dela o quadro alarga e a foto
     corta em cima e embaixo (object-fit: cover, ponto focal do mapa). A largura explícita impede que o limite de altura
     passe para a largura pela proporção (a foto encolheria e deixaria a borda direita) */
  .fc-ab__foto :deep(.fc-foto__quadro) { width: 100%; max-height: clamp(420px, calc(100svh - 140px), var(--fc-ab-foto-max)); }
  .fc-ab__foto :deep(.fc-foto__legenda--fora) { padding-inline: 0; }
  /* sem foto: o H1 de 96 px em uma coluna só (colunas 1–10) */
  .fc-ab--sem-foto .fc-ab__texto { grid-column: 2 / 12; }
  .fc-ab--sem-foto .fc-ab__h1 { font-size: var(--fc-fs-display); }
}

/* Entrada (t = 0 = página revelada; App.vue liga .fc-pagina-entra). fill backwards: no fim não sobra transform. */
:where(.fc-js .fc-pagina-entra) .fc-ab__h1 { animation: fc-entra var(--fc-dur-linha-h1) var(--fc-curva-fermenta) backwards; }
:where(.fc-js .fc-pagina-entra) .fc-ab__sub { animation: fc-entra-op var(--fc-dur-elemento) var(--fc-curva-fermenta) calc(2 * var(--fc-stagger-linha)) backwards; }
:where(.fc-js .fc-pagina-entra) .fc-ab__ctas { animation: fc-entra var(--fc-dur-elemento) var(--fc-curva-fermenta) calc(2 * var(--fc-stagger-linha)) backwards; }
@media (min-width: 1024px) {
  /* ≥ 1024 as linhas são blocos: cada uma entra, 80 ms entre elas */
  :where(.fc-js .fc-pagina-entra) .fc-ab__h1 { animation: none; }
  :where(.fc-js .fc-pagina-entra) .fc-ab__l { animation: fc-entra var(--fc-dur-linha-h1) var(--fc-curva-fermenta) backwards; }
  :where(.fc-js .fc-pagina-entra) .fc-ab__l:nth-child(2) { animation-delay: var(--fc-stagger-linha); }
  :where(.fc-js .fc-pagina-entra) .fc-ab__l:nth-child(3) { animation-delay: calc(2 * var(--fc-stagger-linha)); }
}
@media (prefers-reduced-motion: reduce) {
  :where(.fc-js .fc-pagina-entra) .fc-ab__h1,
  :where(.fc-js .fc-pagina-entra) .fc-ab__sub,
  :where(.fc-js .fc-pagina-entra) .fc-ab__ctas { animation: fc-entra-op var(--fc-dur-reduzido) var(--fc-curva-fermenta) backwards; }
  :where(.fc-js .fc-pagina-entra) .fc-ab__l { animation: none; }
}
.fc-ab.is-pronto .fc-ab__h1,
.fc-ab.is-pronto .fc-ab__l,
.fc-ab.is-pronto .fc-ab__sub,
.fc-ab.is-pronto .fc-ab__ctas { animation: none; }
</style>
