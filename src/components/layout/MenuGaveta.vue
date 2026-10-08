<script setup>
/**
 * Gaveta < 1280: v-dialog fullscreen — foco preso, Esc e devolução do foco ao "Menu" já vêm do
 * Vuetify. Entra da direita em 280 ms fermenta, sai em 200 ms assa. Ordem do DOM = ordem do foco:
 * "Fechar menu" · nav (8 destinos) · base fixa com os 2 CTAs · links legais. Fechar por navegação → foco no H1 (router).
 */
import { ref } from 'vue'
import { useRoute } from 'vue-router'
import LogoMarca from '@/components/marca/LogoMarca.vue'
import BotaoMarca from '@/components/marca/BotaoMarca.vue'
import TresPontos from '@/components/marca/TresPontos.vue'
import { CTA_COMERCIO, CTA_PRODUTOR, NAV_GAVETA, NAV_LEGAL } from '@/data/navegacao'
import { provideTom } from '@/composables/useTom'

provideTom('marrom')
const aberta = ref(false)
const fecharBtn = ref(null)
const fechar = () => (aberta.value = false)
// abrir → foco no "Fechar menu" (o VDialog focaria o contêiner; o evento vem antes e ele respeita)
const focarFechar = () => fecharBtn.value?.focus()

// CTA da página em que a pessoa já está: fecha e leva ao formulário dela — depois de a gaveta sair, senão o Vuetify
// devolve o foco ao "Menu" por cima do campo
const route = useRoute()
let irAoFormulario = false
function aoCta(e, destino) {
  if (route.path === destino) {
    e.preventDefault()
    irAoFormulario = true
  }
  fechar()
}
function depoisDeFechar() {
  if (!irAoFormulario) return
  irAoFormulario = false
  window.dispatchEvent(new CustomEvent('fc:ir-ao-formulario'))
}
</script>

<template>
  <v-dialog
    v-model="aberta"
    fullscreen
    :scrim="false"
    transition="fc-gaveta"
    theme="fornadaMarrom"
    class="fc-gaveta-raiz"
    aria-label="Menu"
    @after-enter="focarFechar"
    @after-leave="depoisDeFechar"
  >
    <template #activator="{ props: ativador }">
      <!-- sem aria-controls: com a gaveta fechada o id não existe na página; aria-haspopup (do ativador) + expanded bastam -->
      <button v-bind="ativador" type="button" class="fc-btn fc-btn--contorno fc-menu-botao" :aria-expanded="String(aberta)">
        <span>Menu</span>
        <v-icon icon="$fcMenu" size="22" aria-hidden="true" />
      </button>
    </template>

    <div id="gaveta" class="fc-gaveta fc-tom fc-tom--marrom">
      <div class="fc-gaveta__topo">
        <button ref="fecharBtn" type="button" class="fc-gaveta__fechar" aria-label="Fechar menu" @click="fechar">
          <v-icon icon="$fcFechar" size="28" aria-hidden="true" />
        </button>
        <LogoMarca invertida :to="null" />
      </div>
      <nav class="fc-gaveta__nav" aria-label="Menu">
        <ul>
          <li v-for="item in NAV_GAVETA" :key="item.to">
            <router-link :to="item.to" class="fc-gaveta__link" @click="fechar">{{ item.rotulo }}</router-link>
          </li>
        </ul>
      </nav>
      <div class="fc-gaveta__base">
        <TresPontos class="fc-gaveta__divisor" tamanho="M" />
        <BotaoMarca variante="ouro" :to="CTA_COMERCIO.to" bloco @click="aoCta($event, CTA_COMERCIO.to)">{{ CTA_COMERCIO.rotulo }}</BotaoMarca>
        <BotaoMarca variante="contorno" :to="CTA_PRODUTOR.to" bloco @click="aoCta($event, CTA_PRODUTOR.to)">{{ CTA_PRODUTOR.rotulo }}</BotaoMarca>
        <p class="fc-gaveta__legais fc-leg">
          <template v-for="(item, i) in NAV_LEGAL" :key="item.to">
            <span v-if="i" aria-hidden="true"> · </span>
            <router-link :to="item.to" class="fc-link" @click="fechar">{{ item.rotulo }}</router-link>
          </template>
        </p>
      </div>
    </div>
  </v-dialog>
</template>

<style>
.fc-menu-botao { padding: 10px 18px 10px 22px; gap: 8px; }
.fc-menu-botao .v-icon { color: currentColor; }

/* o painel fora da tela durante a entrada não pode alargar a área rolável (memória gaveta-fora-da-tela) */
.v-overlay.fc-gaveta-raiz { overflow: clip; }
.fc-gaveta-raiz .v-overlay__content { margin: 0; }
.fc-gaveta-enter-active { transition: transform var(--fc-dur-gaveta) var(--fc-curva-fermenta); }
.fc-gaveta-leave-active { transition: transform var(--fc-dur-hover) var(--fc-curva-assa); }
.fc-gaveta-enter-from, .fc-gaveta-leave-to { transform: translateX(100%); }
@media (prefers-reduced-motion: reduce) {
  .fc-gaveta-enter-active, .fc-gaveta-leave-active { transition: none; }
}

.fc-gaveta {
  display: flex;
  flex-direction: column;
  height: 100%;
  min-height: 100dvh;
  background: var(--fc-ruido-e), var(--fc-marrom);
  color: var(--fc-creme);
  padding: var(--fc-header-pad) var(--gut) max(24px, env(safe-area-inset-bottom));
  overflow-y: auto;
}
.fc-gaveta__topo { display: flex; align-items: center; justify-content: space-between; gap: 16px; min-height: 48px; }
/* "Fechar menu" é o 1º do foco: 1º no DOM, à direita na tela */
.fc-gaveta__topo { flex-direction: row-reverse; }
.fc-gaveta__fechar {
  display: grid;
  place-items: center;
  width: 48px;
  height: 48px;
  margin-right: -8px;
  border: 0;
  border-radius: 50%;
  background: none;
  color: var(--fc-creme);
  cursor: pointer;
}
.fc-gaveta__nav { flex: 1 0 auto; margin-top: 24px; }
.fc-gaveta__nav ul { list-style: none; margin: 0; padding: 0; }
.fc-gaveta__link {
  display: flex;
  align-items: center;
  min-height: 56px;
  font-family: var(--fc-ff-titulo);
  font-optical-sizing: auto;
  font-variation-settings: "SOFT" 100;
  font-weight: 600;
  font-size: var(--fc-fs-gaveta);
  line-height: 1.2;
  color: var(--fc-creme);
  text-decoration: none;
  text-underline-offset: 6px;
}
.fc-gaveta__link[aria-current="page"] { text-decoration: underline; text-decoration-thickness: 2px; }
@media (hover: hover) and (pointer: fine) { .fc-gaveta__link:hover { text-decoration: underline; text-decoration-thickness: 1px; } }
.fc-gaveta__base { display: flex; flex-direction: column; align-items: stretch; gap: 12px; padding-top: 24px; }
.fc-gaveta__base .fc-btn { width: 100%; justify-content: space-between; }
.fc-gaveta__divisor { margin-bottom: 12px; }
.fc-gaveta__legais { margin-top: 8px; color: var(--fc-creme-2); }
.fc-gaveta__legais .fc-link { display: inline-flex; align-items: center; min-height: 44px; }
@media (min-width: 768px) {
  .fc-gaveta { padding-inline: max(var(--gut), calc((100% - 560px) / 2)); }
}
</style>
