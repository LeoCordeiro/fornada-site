<script setup>
/**
 * Sobre `/sobre`:
 *  abertura [creme] → costura → [marrom] · origem [creme] + foto 4:3 · a proposta [marrom] com o ícone
 *  oficial invertido e pontos-conecta (o único Lottie da página, 1×) · quem está por trás [creme] + FichaEmpresa
 *  (sem foto e sem trajetória até a empresa autorizar) · chamada final [marrom].
 * Grade no desktop: texto nas colunas 1–5, a outra metade nas 7–11 — a 6 e a 12 ficam livres, e as costuras passam
 * por elas (x sem texto em volta) em zigue-zague: 2 (abertura) → 7 → 12 → 6 → 12 → 7 (rodapé). Celular: x 24.
 * Na origem o texto vai até a coluna 6 (o H2 "Do Parque Uirapuru / para os balcões / de Guarulhos" cabe em 3 linhas com o
 * nome do bairro inteiro) e a costura de cima passa na 7, sobre a foto, longe do título.
 * Na proposta, os pontos chegam ao ícone depois de a costura de cima acender (a rota chega, a conexão acontece — mesma ordem
 * da chamada final da Home) e com o ícone visível (io .5). Sem reveal: o momento de cada seção é a costura ou o ícone.
 */
import { onBeforeUnmount, onMounted, ref } from 'vue'
import AberturaPagina from '@/components/secoes/AberturaPagina.vue'
import BlocoRota from '@/components/rota/BlocoRota.vue'
import CabecalhoSecao from '@/components/secoes/CabecalhoSecao.vue'
import ListaGarantias from '@/components/secoes/ListaGarantias.vue'
import FichaEmpresa from '@/components/secoes/FichaEmpresa.vue'
import CtaFinal from '@/components/secoes/CtaFinal.vue'
import FotoReal from '@/components/marca/FotoReal.vue'
import IconeMarca from '@/components/marca/IconeMarca.vue'
import { useRodape } from '@/composables/useRodape'
import { fotoNoAr } from '@/data/fotos'
import { quandoRevelada } from '@/composables/useVeu'
import { usePaginaVista } from '@/composables/useVisita'
import { observarUmaVez } from '@/lib/gatilho'
import { COSTURA } from '@/lib/motion'
import { ABERTURA, FIM, ORIGEM, PROPOSTA, QUEM } from '@/components/sobre/conteudo'

useRodape({ coluna: 7 })

// origem sem foto (produção, até a foto real chegar): o FotoReal não desenha nada, o texto ocupa as colunas 1–8 (linhas
// 2 / 10) e a costura de cima passa na 10, no lado vazio à direita do texto. Com foto (e na prévia), nada muda.
const fotoOrigem = fotoNoAr('sobre-forno')

// proposta — pontos-conecta depois da costura (transitionend dos 2 trios; trava em 400 + 200 ms) e com o ícone em io(.5)
const proposta = ref(null)
const icone = ref(null)
const vista = usePaginaVista()
const soltar = []
let trava = 0
let cancelar = null

onMounted(() => {
  if (vista) return // página já vista nesta visita: ícone parado, pontos no lugar
  let costuraAcesa = false
  let naTela = false
  let tocou = false
  const tentar = () => {
    if (tocou || !costuraAcesa || !naTela) return
    tocou = true
    icone.value?.tocar()
  }
  cancelar = quandoRevelada(() => {
    const bloco = proposta.value?.$el
    const el = bloco?.querySelector('.fc-icone')
    if (!el) return
    let trios = 0
    const acesa = () => {
      if (costuraAcesa) return
      costuraAcesa = true
      bloco.removeEventListener('transitionend', aoFim)
      clearTimeout(trava)
      tentar()
    }
    const aoFim = (e) => {
      if (e.target.classList?.contains('fc-divisa__mascara') && ++trios >= 2) acesa()
    }
    soltar.push(
      observarUmaVez(bloco, {
        margemBaixo: COSTURA.rootMargin.split(' ')[2],
        entrar: () => {
          bloco.addEventListener('transitionend', aoFim)
          trava = setTimeout(acesa, 600)
        },
        passou: acesa,
      }),
      () => bloco.removeEventListener('transitionend', aoFim),
      // rolagem que saltou por cima do ícone: ele fica parado (os pontos da logo já estão no lugar)
      observarUmaVez(el, { limiar: 0.5, entrar: () => ((naTela = true), tentar()), passou: () => (tocou = true) }),
    )
  })
})
onBeforeUnmount(() => {
  clearTimeout(trava)
  soltar.forEach((f) => f())
  cancelar?.()
})
</script>

<template>
  <div class="so">
    <AberturaPagina :rotulo="ABERTURA.rotulo" :sub="ABERTURA.sub" :costura-coluna="2">
      <template #titulo>{{ ABERTURA.titulo.forte }} <em class="fc-leve">{{ ABERTURA.titulo.leve }}</em></template>
    </AberturaPagina>

    <BlocoRota tom="creme" :costura="{ coluna: fotoOrigem ? 7 : 10, halo: 'marrom' }" rotulado="sobre-origem">
      <div class="fc-g so__duas so__duas--origem" :class="{ 'so__duas--sem-foto': !fotoOrigem }">
        <div class="so__esq">
          <CabecalhoSecao id="sobre-origem" :rotulo="ORIGEM.rotulo" :titulo="ORIGEM.titulo" />
          <p class="fc-clg fc-txt fc-corpo so__par">{{ ORIGEM.texto }}</p>
        </div>
        <FotoReal class="so__dir" chave="sobre-forno" proporcao="4:3" />
      </div>
    </BlocoRota>

    <BlocoRota
      ref="proposta"
      tom="marrom"
      :costura="{ coluna: 12, halo: 'creme' }"
      :brilho="{ forma: 'circle', pos: '18% 28%', alfa: 0.2, alcance: '55%' }"
      rotulado="sobre-proposta"
    >
      <div class="fc-g so__duas so__duas--topo">
        <div class="so__esq">
          <IconeMarca ref="icone" class="so__icone" invertido gatilho="manual" :tamanho="{ base: 96, desktop: 160 }" />
          <CabecalhoSecao id="sobre-proposta" class="so__marca-cab" :rotulo="PROPOSTA.rotulo" :titulo="PROPOSTA.titulo" />
        </div>
        <div class="so__dir">
          <p class="fc-clg fc-txt fc-corpo">{{ PROPOSTA.texto }}</p>
          <ListaGarantias class="so__principios" :itens="PROPOSTA.principios" />
        </div>
      </div>
    </BlocoRota>

    <BlocoRota tom="creme" :costura="{ coluna: 6, halo: 'marrom' }" rotulado="sobre-quem">
      <div class="fc-g so__duas so__duas--topo">
        <CabecalhoSecao id="sobre-quem" class="so__esq" :rotulo="QUEM.rotulo" :titulo="QUEM.titulo" />
        <div class="so__dir so__quem">
          <p v-if="QUEM.texto" class="fc-clg fc-txt fc-corpo">{{ QUEM.texto }}</p>
          <p v-if="QUEM.pendente" class="fc-leg fc-txt"><mark class="so__pendente">{{ QUEM.pendente }}</mark></p>
          <!-- a ficha assina com a MARCA, não com a razão social (que traz o nome do titular) -->
          <FichaEmpresa nome="marca" class="fc-leg so__ficha" />
        </div>
      </div>
    </BlocoRota>

    <CtaFinal id="sobre-fim" tom="marrom" :costura="{ coluna: 12, halo: 'creme' }" rotulo="" :titulo="FIM.titulo" texto="" />
  </div>
</template>

<style scoped>
.so__duas { row-gap: 40px; }
.so__par { margin-top: 24px; }
.so__marca-cab { margin-top: 32px; }
.so__principios { margin-top: 32px; }
.so__quem { display: grid; gap: 24px; }
.so__quem > * + .so__ficha { padding-top: 24px; border-top: 1px solid var(--fc-linha); }
/* pendência do cliente à vista na prévia, no mesmo desenho dos "[a preencher…]" das páginas legais (8,18 sobre creme-2) */
.so__pendente {
  background: var(--fc-creme-2);
  color: var(--fc-marrom);
  padding: 0 4px;
  border-bottom: 1px dashed var(--fc-marrom-medio);
  -webkit-box-decoration-break: clone;
  box-decoration-break: clone;
}
@media (min-width: 768px) and (max-width: 1023px) {
  .so__duas > .fc-foto { max-width: 560px; }
}
@media (min-width: 1024px) {
  .so__duas { align-items: center; }
  .so__duas--topo { align-items: start; }
  .so__esq { grid-column: 2 / 7; } /* colunas 1–5 */
  .so__duas--origem .so__esq { grid-column: 2 / 8; } /* origem: colunas 1–6 */
  .so__duas--sem-foto .so__esq { grid-column: 2 / 10; } /* origem sem foto: colunas 1–8 */
  .so__dir { grid-column: 8 / 13; grid-row: 1; } /* colunas 7–11: a 6 e a 12 ficam para as costuras */
}
</style>
