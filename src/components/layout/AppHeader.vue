<script setup>
/**
 * Cabeçalho NÃO fixo: absoluto sobre o 1º bloco (creme) de toda página.
 *  ≥1280: logo · Produtos · Como funciona · Qualidade · Sobre · Contato · "Seja produtor" · "Quero receber fornada"
 *  768–1279: logo · "Quero receber fornada" · Menu      < 768: logo · Menu
 * Página atual: aria-current + sublinhado 2 px marrom (informação) + trio S dourado que desliza (decoração).
 */
import { computed, nextTick, onMounted, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import LogoMarca from '@/components/marca/LogoMarca.vue'
import BotaoMarca from '@/components/marca/BotaoMarca.vue'
import TresPontos from '@/components/marca/TresPontos.vue'
import MenuGaveta from './MenuGaveta.vue'
import { CTA_COMERCIO, CTA_PRODUTOR_CURTO, NAV_PRINCIPAL } from '@/data/navegacao'
import { useVeu } from '@/composables/useVeu'
import { CURVA, DUR, reduzirAgora } from '@/lib/motion'

const route = useRoute()

/** CTA da página em que a pessoa já está: leva ao formulário dela (rola e foca o 1º campo), sem trocar de rota —
 *  antes o clique não fazia nada. Os formulários ouvem `fc:ir-ao-formulario`. */
function irAoFormulario(e, destino) {
  if (route.path !== destino) return
  e.preventDefault()
  window.dispatchEvent(new CustomEvent('fc:ir-ao-formulario'))
}
const { estado: veu } = useVeu()
const nav = ref(null)
const trio = ref(null)

// o trio vai para o destino já no beforeEach (junto com o véu); fora de navegação, segue a rota atual
const ativo = computed(() => (veu.fase === 'entrando' || veu.fase === 'cheio' ? veu.destino : route.path))
let xAtual = null

function posicionar(animar) {
  const el = trio.value
  const link = nav.value?.querySelector(`[data-fc-path="${ativo.value}"]`)
  if (!el || !nav.value) return
  if (!link || !link.offsetWidth) {
    el.style.opacity = '0'
    xAtual = null
    return
  }
  const x = link.offsetLeft + link.offsetWidth / 2 - el.offsetWidth / 2
  const de = xAtual
  el.style.transform = `translateX(${x}px)`
  el.style.opacity = '1'
  if (animar && de !== null && de !== x && !reduzirAgora()) {
    el.animate([{ transform: `translateX(${de}px)` }, { transform: `translateX(${x}px)` }], { duration: DUR.flip, easing: CURVA.assa })
  }
  xAtual = x
}

watch(ativo, () => nextTick(() => posicionar(true)))
onMounted(() => {
  posicionar(false)
  document.fonts?.ready.then(() => posicionar(false))
  new ResizeObserver(() => posicionar(false)).observe(nav.value)
})
</script>

<template>
  <header class="fc-header">
    <div class="fc-wrap fc-header__linha">
      <LogoMarca />
      <nav ref="nav" class="fc-header__nav" aria-label="Principal">
        <ul class="fc-header__links">
          <li v-for="item in NAV_PRINCIPAL" :key="item.to">
            <router-link :to="item.to" class="fc-header__link" :data-fc-path="item.to">{{ item.rotulo }}</router-link>
          </li>
        </ul>
        <span ref="trio" class="fc-header__indicador" aria-hidden="true"><TresPontos tamanho="S" /></span>
      </nav>
      <div class="fc-header__acoes">
        <BotaoMarca class="fc-header__so-largo" variante="contorno" :to="CTA_PRODUTOR_CURTO.to" :pontos="false" @click="irAoFormulario($event, CTA_PRODUTOR_CURTO.to)">{{ CTA_PRODUTOR_CURTO.rotulo }}</BotaoMarca>
        <BotaoMarca class="fc-header__desde-tablet" variante="ouro" :to="CTA_COMERCIO.to" :pontos="false" @click="irAoFormulario($event, CTA_COMERCIO.to)">{{ CTA_COMERCIO.rotulo }}</BotaoMarca>
        <MenuGaveta />
      </div>
    </div>
  </header>
</template>

<style>
.fc-header {
  position: absolute;
  inset: 0 0 auto;
  z-index: 60; /* acima do véu (50): cabeçalho e menu seguem clicáveis durante a troca de página */
  padding-top: var(--fc-header-pad);
  --fc-foco: var(--fc-marrom);
  color: var(--fc-marrom);
  pointer-events: none;
}
.fc-header__linha { display: flex; align-items: center; justify-content: space-between; gap: 16px; pointer-events: auto; min-height: var(--fc-header-logo-h); }
.fc-header__nav { position: relative; display: none; margin-left: auto; }
.fc-header__links { display: flex; align-items: center; gap: 28px; list-style: none; margin: 0; padding: 0; }
.fc-header__link {
  display: inline-flex;
  align-items: center;
  min-height: 48px;
  font: 500 var(--fc-fs-apoio) / 1.2 var(--fc-ff-corpo);
  color: var(--fc-marrom);
  text-decoration: none;
  text-underline-offset: 5px;
  white-space: nowrap;
}
.fc-header__link[aria-current="page"] { text-decoration: underline; text-decoration-thickness: 2px; }
@media (hover: hover) and (pointer: fine) {
  .fc-header__link:hover { text-decoration: underline; text-decoration-thickness: 1px; }
  .fc-header__link[aria-current="page"]:hover { text-decoration-thickness: 2px; }
}
.fc-header__indicador { position: absolute; left: 0; bottom: -2px; display: inline-flex; opacity: 0; pointer-events: none; }
.fc-header__acoes { display: flex; align-items: center; gap: 16px; flex: none; }
.fc-header__so-largo, .fc-header__desde-tablet { display: none; }
@media (min-width: 768px) { .fc-header__desde-tablet { display: inline-flex; } }
@media (min-width: 1280px) {
  .fc-header__linha { gap: 28px; }
  .fc-header__nav { display: block; }
  .fc-header__so-largo { display: inline-flex; }
  .fc-header .fc-menu-botao { display: none; }
  .fc-header__acoes { margin-left: 0; }
}
@media (max-width: 767px) {
  .fc-header__acoes .fc-btn { padding-inline: 20px; }
}
</style>
