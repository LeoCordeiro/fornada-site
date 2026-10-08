<script setup>
/**
 * Uma "caixa" da fileira de categorias. Sem raio, sem sombra, sem borda:
 * NÃO é cartão, apesar do nome. Tema do Vuetify pelo tom (fornece o tom para dentro).
 *  layout 'coluna' — Home 1×4: foto em cima nos creme e embaixo nos marrom (desktop); tablet: foto alterna lado;
 *                   celular: foto sempre em cima.
 *  layout 'faixa'  — Produtos: linha inteira, foto 4:3 alternando o lado (fotoPosicao), lista de exemplos.
 * `cruzaProximo`: trio M atravessando a divisa com o próximo bloco (desktop horizontal à direita; celular/tablet
 * vertical embaixo, x 50 %), acendendo por máscara. Entrada: `ligado` controla de fora
 * (fileira do desktop, com `ordem` k → atrasos k·120 / +100 / +160); null = o próprio bloco observa (io .2).
 * `costura` (mesmo objeto da BlocoRota: { coluna, colunaTablet, x, xMobile, halo, gatilho, somente }): RotaDivisa na
 * borda de cima, dentro da faixa — anda junto quando o filtro move as faixas (Produtos) — e o
 * respiro de 72 px dos dois lados da divisa: no topo desta e no fim da faixa de cima.
 */
import { computed, onBeforeUnmount, onMounted, ref, useId } from 'vue'
import { MOSTRAR_EXEMPLOS } from '@/data/categorias'
import { fotoNoAr } from '@/data/fotos'
import FotoReal from '@/components/marca/FotoReal.vue'
import RotaDivisa from '@/components/rota/RotaDivisa.vue'
import { provideTom, TEMA_DO_TOM } from '@/composables/useTom'
import { quandoRevelada } from '@/composables/useVeu'
import { usePaginaVista } from '@/composables/useVisita'
import { reduzirAgora } from '@/lib/motion'
import { observarUmaVez } from '@/lib/gatilho'

const props = defineProps({
  categoria: { type: Object, required: true }, // { chave, titulo, texto, link?, exemplos?, foto: chave em data/fotos }
  tom: { type: String, default: 'creme' },
  layout: { type: String, default: 'coluna', validator: (v) => ['coluna', 'faixa'].includes(v) },
  fotoPosicao: { type: String, default: '' }, // 'topo'|'base'|'esquerda'|'direita' (padrão pelo layout e tom)
  cruzaProximo: { type: Boolean, default: false },
  link: { type: [String, Object], default: null }, // destino do "Ver …" (Home → /produtos?categoria=slug)
  ligado: { type: Boolean, default: null },
  ordem: { type: Number, default: 0 },
  nivel: { type: Number, default: 3 },
  costura: { type: Object, default: null }, // costura no topo (halo = tom da faixa de cima)
})

provideTom(computed(() => props.tom))
const uid = `fc-cruza-${useId()}`.replace(/[^a-zA-Z0-9-]/g, '')
const raiz = ref(null)
const proprio = ref(false)
const instantaneo = ref(false)
const vista = usePaginaVista()
let soltar = null
let cancelar = null

const aceso = computed(() => (props.ligado === null ? proprio.value : props.ligado))
/** "Ver massas frescas" → ["Ver massas ", "frescas"] (a última palavra fica colada no trio) */
const partes = (t = '') => {
  const i = t.lastIndexOf(' ')
  return i < 0 ? ['', t] : [t.slice(0, i + 1), t.slice(i + 1)]
}
const posicao = computed(() => props.fotoPosicao || (props.layout === 'faixa' ? 'esquerda' : props.tom === 'creme' ? 'topo' : 'base'))
const atrasos = computed(() => ({
  '--fc-atraso-1': `${props.ordem * 120}ms`,
  '--fc-atraso-2': `${props.ordem * 120 + 100}ms`,
  '--fc-atraso-trio': `${props.ordem * 120 + 160}ms`,
}))

onMounted(() => {
  if (vista || reduzirAgora()) {
    instantaneo.value = true
    proprio.value = true
    return
  }
  if (props.ligado !== null) return
  cancelar = quandoRevelada(() => {
    soltar = observarUmaVez(raiz.value.$el ?? raiz.value, {
      limiar: 0.2,
      entrar: () => (proprio.value = true),
      passou: () => {
        instantaneo.value = true
        proprio.value = true
      },
    })
  })
})
onBeforeUnmount(() => {
  soltar?.()
  cancelar?.()
})
</script>

<template>
  <v-sheet
    ref="raiz"
    tag="article"
    :theme="TEMA_DO_TOM[tom]"
    class="fc-cat fc-tom"
    :class="[`fc-tom--${tom}`, `fc-cat--${layout}`, `fc-cat--foto-${posicao}`, { 'is-aceso': aceso || instantaneo, 'is-instantaneo': instantaneo, 'fc-cat--costura': costura, 'fc-cat--sem-foto': !fotoNoAr(categoria.foto) }]"
    :style="atrasos"
    :data-fc-tom="tom"
  >
    <RotaDivisa v-if="costura" v-bind="costura" />
    <FotoReal class="fc-cat__foto" :chave="categoria.foto" proporcao="4:3" />
    <div class="fc-cat__texto">
      <component :is="`h${nivel}`" class="fc-h3 fc-cat__titulo">{{ categoria.titulo }}</component>
      <p class="fc-cat__desc fc-corpo">{{ categoria.texto }}</p>
      <!-- lista de exemplos só com MOSTRAR_EXEMPLOS: em produção, sem CONFIRMADO.exemplosProduto, a categoria fica com nome e frase -->
      <ul v-if="layout === 'faixa' && MOSTRAR_EXEMPLOS && categoria.exemplos?.length" class="fc-cat__exemplos">
        <li v-for="ex in categoria.exemplos" :key="ex">{{ ex }}</li>
      </ul>
      <!-- a última palavra e o trio não se separam (nowrap): quando o texto quebra, o trio vai junto -->
      <router-link v-if="link" :to="link" class="fc-cat__link"><span class="fc-cat__link-texto">{{ partes(categoria.link)[0] }}</span><span class="fc-cat__link-fim"><span class="fc-cat__link-texto">{{ partes(categoria.link)[1] }}</span>&nbsp;<span class="fc-cat__trio" aria-hidden="true"><i /><i /><i /></span></span></router-link>
      <slot />
    </div>
    <template v-if="cruzaProximo">
      <svg class="fc-cat__cruza fc-cat__cruza--h" viewBox="0 0 54 12" width="54" height="12" aria-hidden="true" focusable="false">
        <defs><mask :id="`${uid}-h`" maskUnits="userSpaceOnUse" x="0" y="0" width="54" height="12"><rect class="fc-cat__mascara fc-cat__mascara--h" x="0" y="0" width="54" height="12" fill="white" /></mask></defs>
        <g :mask="`url(#${uid}-h)`"><circle cx="9" cy="6" r="6" /><circle cx="27" cy="6" r="6" /><circle cx="45" cy="6" r="6" /></g>
      </svg>
      <svg class="fc-cat__cruza fc-cat__cruza--v" viewBox="0 0 12 54" width="12" height="54" aria-hidden="true" focusable="false">
        <defs><mask :id="`${uid}-v`" maskUnits="userSpaceOnUse" x="0" y="0" width="12" height="54"><rect class="fc-cat__mascara fc-cat__mascara--v" x="0" y="0" width="12" height="54" fill="white" /></mask></defs>
        <g :mask="`url(#${uid}-v)`"><circle cx="6" cy="9" r="6" /><circle cx="6" cy="27" r="6" /><circle cx="6" cy="45" r="6" /></g>
      </svg>
    </template>
  </v-sheet>
</template>

<style>
.v-sheet.fc-cat {
  position: relative;
  border-radius: 0;
  box-shadow: none;
  background: var(--fc-ruido), var(--fc-superficie);
  color: var(--fc-tinta);
  display: flex;
  flex-direction: column;
  gap: 24px;
  padding: 40px var(--gut) 44px;
  min-width: 0;
}
.fc-cat__foto { order: -1; }
.fc-cat__titulo { margin-bottom: 8px; }
.fc-cat__exemplos { margin: 16px 0 0; padding: 0; list-style: none; display: grid; gap: 8px; }
.fc-cat__exemplos li { display: flex; align-items: center; gap: 12px; }
.fc-cat__exemplos li::before { content: ""; flex: none; width: 8px; height: 8px; border-radius: 50%; background: var(--fc-dourado); }
.fc-cat__link {
  display: inline-block;
  min-height: 44px;
  padding: 10px 0;
  margin-top: 12px;
  font-weight: 600;
  line-height: 1.5;
  color: inherit;
  text-decoration: none;
}
.fc-cat__link-texto { text-decoration: underline; text-underline-offset: 5px; text-decoration-thickness: 1px; }
.fc-cat__link-fim { white-space: nowrap; }
.fc-cat__trio { display: inline-flex; gap: 3px; margin-left: 4px; vertical-align: middle; transition: transform var(--fc-dur-hover) var(--fc-curva-assa); }
.fc-cat__trio i { width: 6px; height: 6px; border-radius: 50%; background: currentColor; }
@media (hover: hover) and (pointer: fine) { .fc-cat__link:hover .fc-cat__trio { transform: translateX(var(--fc-desloc-trio)); } }

/* costura no topo: 72 px dos dois lados da divisa, vença o padding de qualquer largura e layout */
.v-sheet.fc-cat.fc-cat--costura { padding-top: max(56px, var(--fc-respiro-rota)); }
.v-sheet.fc-cat:has(+ .fc-cat--costura) { padding-bottom: max(56px, var(--fc-respiro-rota)); }

/* trio cruzando a divisa (sem parada) */
.fc-cat__cruza { position: absolute; z-index: 3; pointer-events: none; overflow: visible; }
.fc-cat__cruza circle { fill: var(--fc-dourado); }
.fc-cat__cruza--h { display: none; }
.fc-cat__cruza--v { left: 50%; bottom: -27px; margin-left: -6px; }
.fc-cat__mascara { transition: transform var(--fc-dur-hover) var(--fc-curva-assa) var(--fc-atraso-trio, 0ms); }
.fc-cat__mascara--h { transform: scaleX(0); transform-origin: 0 0; }
.fc-cat__mascara--v { transform: scaleY(0); transform-origin: 0 0; }
.fc-cat.is-aceso .fc-cat__mascara { transform: none; }

/* entrada da fileira: de cima (foto nos creme, texto nos marrom) e de baixo, k·120 / +100 */
.fc-js .fc-cat:not(.is-aceso) .fc-cat__foto, .fc-js .fc-cat:not(.is-aceso) .fc-cat__texto { opacity: 0; transform: translateY(var(--fc-desloc)); }
.fc-cat .fc-cat__foto, .fc-cat .fc-cat__texto {
  transition: opacity var(--fc-dur-elemento) var(--fc-curva-fermenta), transform var(--fc-dur-elemento) var(--fc-curva-fermenta);
}
.fc-cat--foto-topo .fc-cat__foto, .fc-cat--foto-base .fc-cat__texto, .fc-cat--foto-esquerda .fc-cat__foto, .fc-cat--foto-direita .fc-cat__foto { transition-delay: var(--fc-atraso-1, 0ms); }
.fc-cat--foto-topo .fc-cat__texto, .fc-cat--foto-base .fc-cat__foto, .fc-cat--foto-esquerda .fc-cat__texto, .fc-cat--foto-direita .fc-cat__texto { transition-delay: var(--fc-atraso-2, 100ms); }
.fc-cat.is-instantaneo .fc-cat__foto, .fc-cat.is-instantaneo .fc-cat__texto, .fc-cat.is-instantaneo .fc-cat__mascara { transition: none; }
@media (prefers-reduced-motion: reduce) {
  .fc-js .fc-cat:not(.is-aceso) .fc-cat__foto, .fc-js .fc-cat:not(.is-aceso) .fc-cat__texto { transform: none; }
  .fc-cat .fc-cat__foto, .fc-cat .fc-cat__texto { transition: opacity var(--fc-dur-reduzido) var(--fc-curva-fermenta); transition-delay: 0ms; }
  .fc-cat__mascara { transform: none !important; transition: none !important; }
}

/* tablet: faixas empilhadas, foto alternando o lado (2×2 é proibido) */
@media (min-width: 768px) and (max-width: 1023px) {
  .v-sheet.fc-cat--coluna { flex-direction: row; align-items: center; gap: 32px; padding: 40px var(--gut); }
  .fc-cat--coluna .fc-cat__foto { width: 44%; flex: none; }
  .fc-cat--coluna.fc-cat--foto-base { flex-direction: row-reverse; }
}
@media (min-width: 1024px) {
  .v-sheet.fc-cat--coluna { padding: 40px 36px 48px; }
  .fc-cat--coluna.fc-cat--foto-base { justify-content: space-between; }
  .fc-cat--coluna.fc-cat--foto-base .fc-cat__foto { order: 2; }
  .fc-cat__cruza--v { display: none; }
  .fc-cat__cruza--h { display: block; right: -27px; top: 50%; margin-top: -6px; }
}
/* faixa (Produtos): linha inteira, foto 4:3 alternando o lado */
@media (min-width: 768px) {
  .v-sheet.fc-cat--faixa {
    display: grid;
    grid-template-columns: minmax(0, 5fr) minmax(0, 7fr);
    align-items: center;
    gap: 32px var(--gap);
    padding: 56px max(var(--gut), calc((100% - var(--fc-wrap-max)) / 2 + var(--gut)));
  }
  .fc-cat--faixa .fc-cat__foto { order: 0; }
  .fc-cat--faixa.fc-cat--foto-direita { grid-template-columns: minmax(0, 7fr) minmax(0, 5fr); }
  .fc-cat--faixa.fc-cat--foto-direita .fc-cat__foto { order: 2; }
  /* sem foto (produção): o texto fica na coluna dele — a coluna da foto é por onde a costura desce */
  .fc-cat--faixa.fc-cat--sem-foto.fc-cat--foto-esquerda .fc-cat__texto { grid-column: 2; }
}
</style>
