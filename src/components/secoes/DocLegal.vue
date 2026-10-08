<script setup>
/**
 * Página de texto longo (Privacidade, Termos). O texto legal vem INTEGRAL
 * (privacidade/texto.js, termos/texto.js) como `secoes: [{ id, titulo, html }]` — HTML estático do próprio projeto.
 * Desktop: sumário à esquerda (sticky, ponto 8 dourado, seção visível em marrom 600 sublinhada) e texto em 62ch.
 * Celular: sumário dentro de "Neste documento" no topo. Links do sumário: router-link com hash (nunca âncora crua com cerquilha).
 * Tabela vira lista empilhada < 768 px (cada célula ganha o rótulo da coluna via data-rotulo — quem monta o HTML).
 * `minuta` (= !SITE.docsRevisados): faixa "Minuta, pendente de revisão jurídica" visível.
 */
import { nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import TresPontos from '@/components/marca/TresPontos.vue'

const props = defineProps({
  secoes: { type: Array, required: true }, // [{ id, titulo, html }]
  vigencia: { type: String, default: '' }, // texto já formatado ("20 de outubro de 2026")
  minuta: { type: Boolean, default: false },
})

const route = useRoute()
const atual = ref(props.secoes[0]?.id ?? '')
const corpo = ref(null)
const listaLarga = ref(null)
// a lista que rola por dentro esmaece a borda do lado em que ainda há item (sinal de que continua)
const maisAcima = ref(false)
const maisAbaixo = ref(false)
const ESMAECE = 24 // px — o mesmo de --fc-doc-esmaece; item atual e foco param fora dessa faixa
let roLista = null

// item atual: a ÚLTIMA seção cujo topo está a ≤ 24 px
// do topo da tela (os 16 do scrollBehavior + 8 de folga); no topo da página, a 1ª; no fim da página, a última.
// Uma linha mais baixa (40 % da tela) marcava a seção SEGUINTE à escolhida quando a escolhida é curta.
const LINHA = 24
let quadro = 0
let escolhido = '' // item clicado/Enter no sumário: vale na hora e segura até a rolagem terminar
let rolou = false // a rolagem do escolhido já começou (um scrollend de antes do clique não solta)
let soltar = 0
const TEM_SCROLLEND = 'onscrollend' in window
function medir() {
  quadro = 0
  if (escolhido) return
  const ids = props.secoes.map((s) => s.id)
  let id = ids[0] ?? ''
  if (window.scrollY > 0 && window.scrollY >= document.documentElement.scrollHeight - window.innerHeight - 2) id = ids[ids.length - 1]
  else for (const s of ids) if ((document.getElementById(s)?.getBoundingClientRect().top ?? Infinity) <= LINHA) id = s
  atual.value = id
}
function soltarEscolha() {
  clearTimeout(soltar)
  escolhido = ''
  medir()
}
// a rolagem suave passa por cima das seções do meio: o escolhido segura até o scrollend (sem scrollend — Safari —, até
// 250 ms sem evento de rolagem; um tranco no meio da rolagem não solta antes da hora) e solta em 1 s se a rolagem nem
// começar (seção já no lugar)
function escolher(id) {
  escolhido = id
  rolou = false
  atual.value = id
  clearTimeout(soltar)
  soltar = setTimeout(soltarEscolha, 1000)
}
const aoRolar = () => {
  if (escolhido) {
    rolou = true
    clearTimeout(soltar)
    soltar = setTimeout(soltarEscolha, TEM_SCROLLEND ? 3000 : 250)
    return
  }
  if (!quadro) quadro = requestAnimationFrame(medir)
}
const aoParar = () => {
  if (escolhido && rolou) soltarEscolha()
}
// em tela baixa (notebook 1366×657, 1024×650) o sumário largo rola por dentro; quando o item atual muda, ele
// entra na área visível da lista pelo scrollTop dela — nunca scrollIntoView, que rolaria a página junto
// pelo que está escondido de verdade (1º/último item fora da caixa de conteúdo), não pela rolagem: o padding de 6 px
// da lista também rola, e com 1–6 px de sobra o trio diria "tem mais" com o último item inteiro à vista
function medirBordas() {
  const ol = listaLarga.value
  if (!ol?.firstElementChild) return
  const caixa = ol.getBoundingClientRect()
  const cs = getComputedStyle(ol)
  maisAcima.value = ol.firstElementChild.getBoundingClientRect().top < caixa.top + parseFloat(cs.paddingTop) - 1
  maisAbaixo.value = ol.lastElementChild.getBoundingClientRect().bottom > caixa.bottom - parseFloat(cs.paddingBottom) + 1
}
function mostrarAtual() {
  const ol = listaLarga.value
  if (!ol || ol.scrollHeight <= ol.clientHeight) return
  const li = ol.querySelector('li.is-atual')
  if (!li) return
  const folga = ESMAECE // fora da faixa esmaecida, com o anel de foco (3 + 3) inteiro
  const caixa = ol.getBoundingClientRect()
  const item = li.getBoundingClientRect()
  if (item.top < caixa.top + folga) ol.scrollTop -= caixa.top + folga - item.top
  else if (item.bottom > caixa.bottom - folga) ol.scrollTop += item.bottom - (caixa.bottom - folga)
}
watch(atual, () => nextTick(mostrarAtual))
onMounted(() => {
  medir()
  if (listaLarga.value) {
    listaLarga.value.addEventListener('scroll', medirBordas, { passive: true })
    roLista = new ResizeObserver(medirBordas) // a altura máxima acompanha a janela
    roLista.observe(listaLarga.value)
  }
  window.addEventListener('scroll', aoRolar, { passive: true })
  window.addEventListener('scrollend', aoParar)
  window.addEventListener('resize', aoRolar)
})
onBeforeUnmount(() => {
  cancelAnimationFrame(quadro)
  clearTimeout(soltar)
  roLista?.disconnect()
  listaLarga.value?.removeEventListener('scroll', medirBordas)
  window.removeEventListener('scroll', aoRolar)
  window.removeEventListener('scrollend', aoParar)
  window.removeEventListener('resize', aoRolar)
})
</script>

<template>
  <div class="fc-doc">
    <p v-if="minuta" class="fc-doc__minuta" role="note">Minuta, pendente de revisão jurídica</p>
    <div class="fc-doc__grade">
      <div class="fc-doc__lado">
        <!-- < 1024: o botão e a lista ficam dentro do MESMO landmark do desktop, aberto ou fechado -->
        <nav class="fc-doc__nav-celular" aria-label="Neste documento">
        <v-expansion-panels class="fc-doc__sumario-celular">
          <v-expansion-panel>
            <v-expansion-panel-title>Neste documento</v-expansion-panel-title>
            <v-expansion-panel-text>
              <ol class="fc-doc__sumario">
                <li v-for="s in secoes" :key="s.id">
                  <router-link :to="{ path: route.path, hash: `#${s.id}` }" class="fc-doc__ancora" @click="escolher(s.id)">{{ s.titulo }}</router-link>
                </li>
              </ol>
            </v-expansion-panel-text>
          </v-expansion-panel>
        </v-expansion-panels>
        </nav>
        <nav class="fc-doc__sumario-largo" aria-label="Neste documento">
          <p class="fc-rot">Neste documento</p>
          <ol ref="listaLarga" class="fc-doc__sumario" :class="{ 'is-mais-acima': maisAcima, 'is-mais-abaixo': maisAbaixo }">
            <li v-for="s in secoes" :key="s.id" :class="{ 'is-atual': atual === s.id }">
              <TresPontos modo="bullet" />
              <router-link
                :to="{ path: route.path, hash: `#${s.id}` }"
                class="fc-doc__ancora"
                :aria-current="atual === s.id ? 'location' : undefined"
                @click="escolher(s.id)"
              >{{ s.titulo }}</router-link>
            </li>
          </ol>
          <!-- com mais itens abaixo, o trio vertical dourado diz "a rota continua" — fora da lista, a máscara não
               o apaga, e aparece onde quer que caia o corte (o esmaecido sozinho sumia com o corte entre dois itens) -->
          <TresPontos modo="trio" tamanho="XS" orientacao="vertical" class="fc-doc__mais" :class="{ 'is-visivel': maisAbaixo }" />
        </nav>
      </div>
      <div ref="corpo" class="fc-doc__corpo">
        <p v-if="vigencia" class="fc-leg fc-doc__vigencia">Versão de {{ vigencia }}</p>
        <section v-for="s in secoes" :id="s.id" :key="s.id" class="fc-doc__secao" :aria-labelledby="`${s.id}-t`">
          <h2 :id="`${s.id}-t`" class="fc-h2 fc-doc__h2">{{ s.titulo }}</h2>
          <!-- v-html: texto legal estático do próprio repositório, escapado em legal.js -->
          <div class="fc-doc__texto" v-html="s.html" />
        </section>
      </div>
    </div>
  </div>
</template>

<style>
.fc-doc__minuta {
  margin: 0 0 32px;
  padding: 12px 16px;
  border-left: 4px solid var(--fc-marrom);
  background: var(--fc-creme-2);
  color: var(--fc-marrom-profundo);
  font-weight: 500;
}
.fc-doc__grade { display: grid; gap: 32px; }
.fc-doc__sumario-largo { display: none; }
/* o ar entre itens é o mesmo com 1, 2 ou 3 linhas (padding 10 + gap 4 + 10) e o ponto fica na 1ª linha */
.fc-doc__sumario { list-style: none; margin: 0; padding: 0; display: grid; gap: 4px; line-height: 1.5; }
.fc-doc__sumario li { display: flex; align-items: flex-start; gap: 12px; }
.fc-doc__sumario li > .fc-pontos-bullet { margin-top: calc(10px + .75em - 4px); } /* padding + meia linha − meio ponto */
.fc-doc__ancora { display: inline-flex; align-items: center; min-height: 44px; padding-block: 10px; color: inherit; text-decoration: none; }
.fc-doc__sumario li.is-atual .fc-doc__ancora { font-weight: 600; text-decoration: underline; text-underline-offset: 4px; }
@media (hover: hover) and (pointer: fine) { .fc-doc__ancora:hover { text-decoration: underline; text-underline-offset: 4px; } }
.fc-doc__sumario-celular { border-top: 1px solid var(--fc-linha); border-bottom: 1px solid var(--fc-linha); }
.fc-doc__sumario-celular .v-expansion-panel { background: none; color: inherit; }
.fc-doc__sumario-celular .v-expansion-panel-title { padding: 12px 0; min-height: 56px; font-weight: 600; color: inherit; }
.fc-doc__sumario-celular .v-expansion-panel-text__wrapper { padding: 0 0 16px; }
.fc-doc__corpo { min-width: 0; }
.fc-doc__vigencia { color: var(--fc-tinta-2); margin-bottom: 24px; }
.fc-doc__secao + .fc-doc__secao { margin-top: 48px; }
.fc-doc__h2 { font-size: clamp(32px, 2.8vw, 40px); }
/* texto corrido em 62ch; a tabela sai da medida e usa a coluna inteira (a 1024 ela ficava com ~515 px) */
.fc-doc__texto { margin-top: 16px; display: grid; gap: 16px; }
.fc-doc__texto > :not(table) { max-width: 62ch; }
.fc-doc__texto h3 { font-family: var(--fc-ff-titulo); font-optical-sizing: auto; font-variation-settings: "SOFT" 100; font-weight: 600; font-size: var(--fc-fs-h3); line-height: 1.2; margin: 16px 0 0; }
.fc-doc__texto ul, .fc-doc__texto ol { padding-left: 1.2em; display: grid; gap: 8px; }
/* lista comum com o ponto da marca: 8 px dourado na altura da 1ª linha; o ol mantém o número */
.fc-doc__texto ul { list-style: none; padding-left: 20px; }
.fc-doc__texto ul > li { position: relative; }
.fc-doc__texto ul > li::before { content: ""; position: absolute; left: -20px; top: calc(.8em - 4px); width: 8px; height: 8px; border-radius: 50%; background: var(--fc-dourado); }
.fc-doc__texto a { color: inherit; text-decoration: underline; text-underline-offset: 4px; }
.fc-doc__texto table { width: 100%; border-collapse: collapse; font-size: 15px; }
.fc-doc__texto th, .fc-doc__texto td { text-align: left; vertical-align: top; padding: 10px 12px 10px 0; border-bottom: 1px solid var(--fc-linha); }
@media (max-width: 767px) {
  /* tabela empilhada: zero rolagem lateral em 360 */
  .fc-doc__texto table, .fc-doc__texto tbody, .fc-doc__texto tr, .fc-doc__texto td { display: block; width: 100%; }
  .fc-doc__texto thead { display: none; }
  .fc-doc__texto tr { padding: 12px 0; border-bottom: 1px solid var(--fc-linha); }
  .fc-doc__texto td { border: 0; padding: 4px 0; }
  /* o rótulo da coluna numa linha própria, com a voz do rótulo (.fc-rot) — não se funde com o negrito do texto */
  .fc-doc__texto td[data-rotulo]::before {
    content: attr(data-rotulo);
    display: block;
    margin-bottom: 2px;
    font-family: var(--fc-ff-corpo);
    font-weight: 500;
    font-size: var(--fc-fs-rot);
    line-height: 1.2;
    letter-spacing: .22em;
    text-transform: uppercase;
    color: var(--fc-marrom);
  }
  /* título de seção do documento a 28 px — num texto de leitura, o título não pesa mais que o parágrafo */
  .fc-doc__h2 { font-size: 28px; }
}
@media (min-width: 1024px) {
  .fc-doc__grade { grid-template-columns: minmax(0, 4fr) minmax(0, 8fr); gap: var(--gap); align-items: start; }
  /* o sumário do celular sai inteiro, landmark junto (um "Neste documento" por largura) */
  .fc-doc__nav-celular { display: none; }
  /* o aside estica até a altura do texto: é o trilho do sticky */
  .fc-doc__lado { align-self: stretch; }
  /* grudado, o sumário nunca passa da tela (24 em cima e embaixo); quando não cabe, só a lista rola por dentro
     e o rótulo fica. 6 px de folga em volta da lista: o anel de foco (3 + 3) não é cortado pela área que rola */
  .fc-doc__sumario-largo { --fc-doc-esmaece: 24px; display: flex; flex-direction: column; position: sticky; top: 24px; max-height: calc(100vh - 48px); max-height: calc(100dvh - 48px); }
  .fc-doc__sumario-largo .fc-rot { flex: none; margin-bottom: 12px; }
  /* trio de continuação: espaço sempre reservado (sem pulo de layout), centrado na coluna dos pontos de 8 px */
  .fc-doc__sumario-largo .fc-doc__mais { flex: none; align-self: flex-start; margin: 8px 0 0 2px; visibility: hidden; opacity: 0; transition: opacity var(--fc-dur-hover) var(--fc-curva-assa); }
  .fc-doc__sumario-largo .fc-doc__mais.is-visivel { visibility: visible; opacity: 1; }
  @media (prefers-reduced-motion: reduce) { .fc-doc__sumario-largo .fc-doc__mais { transition: none; } }
  .fc-doc__sumario-largo .fc-doc__sumario {
    min-height: 0;
    overflow-y: auto; /* sem overscroll-behavior: no fim da lista a roda segue para a página */
    margin: -6px;
    padding: 6px;
    scroll-padding-block: var(--fc-doc-esmaece); /* o foco por Tab leva o item para fora da faixa esmaecida */
    scrollbar-width: thin;
    scrollbar-color: var(--fc-marrom-medio) transparent;
  }
  /* esmaece só a borda do lado em que a lista ainda continua (a linha cortada vira sinal de "tem mais") */
  .fc-doc__sumario-largo .fc-doc__sumario.is-mais-abaixo {
    -webkit-mask-image: linear-gradient(to top, transparent, black var(--fc-doc-esmaece));
    mask-image: linear-gradient(to top, transparent, black var(--fc-doc-esmaece));
  }
  .fc-doc__sumario-largo .fc-doc__sumario.is-mais-acima {
    -webkit-mask-image: linear-gradient(to bottom, transparent, black var(--fc-doc-esmaece));
    mask-image: linear-gradient(to bottom, transparent, black var(--fc-doc-esmaece));
  }
  .fc-doc__sumario-largo .fc-doc__sumario.is-mais-acima.is-mais-abaixo {
    -webkit-mask-image: linear-gradient(to bottom, transparent, black var(--fc-doc-esmaece), black calc(100% - var(--fc-doc-esmaece)), transparent);
    mask-image: linear-gradient(to bottom, transparent, black var(--fc-doc-esmaece), black calc(100% - var(--fc-doc-esmaece)), transparent);
  }
}
</style>
