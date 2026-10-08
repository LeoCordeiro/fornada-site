<script setup>
/**
 * Botão fixo de WhatsApp. Mesma posição em todas as
 * rotas (16 px no celular, 24 px ≥1024), depois do rodapé no DOM (último focável), visível desde o 1º quadro.
 *  - mensagem pronta com o nome da página; número pendente → <button> sem href + aviso role="status";
 *  - lembrete `whatsapp-nudge`: no máximo 2× por visita, contador em memória (useNudge), nunca sob RM;
 *  - < 768: sai de cena (inert + opacity + translateY) com foco em campo ou com o botão de envio na tela;
 *  - < 1280: sai de cena também quando um controle de formulário (ou [data-fc-fab-evita]) passa embaixo dele.
 */
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import BrandLottie from '@/components/marca/BrandLottie.vue'
import { linkWhatsApp } from '@/lib/whatsapp'
import { ATALHOS, nomeDaPagina } from '@/data/atalhosWhatsapp'
import { avisarWhatsappPendente, avisoWhatsapp } from '@/composables/useAvisoWhatsapp'
import { estadoEnvio, useNudge } from '@/composables/useNudge'

const route = useRoute()
const atalho = computed(() => linkWhatsApp(ATALHOS.falar(nomeDaPagina(route.path))))
const nudge = ref(null)
const sobre = ref(false) // hover ou foco no botão: lembrete espera

const mqCelular = window.matchMedia('(max-width: 767px)')
const celular = ref(mqCelular.matches)
const aoMudar = (e) => (celular.value = e.matches)
onMounted(() => mqCelular.addEventListener('change', aoMudar))
onBeforeUnmount(() => mqCelular.removeEventListener('change', aoMudar))

// a regra de "controle embaixo do botão" já mede só abaixo de 1280 (useNudge)
const foraDeCena = computed(() => (celular.value && (estadoEnvio.campoFocado || estadoEnvio.visiveis > 0)) || estadoEnvio.cruzando)

useNudge({
  podeAgora: () => !foraDeCena.value && !sobre.value,
  tocar: () => nudge.value?.play(),
})

function aoClicarPendente() {
  avisarWhatsappPendente(atalho.value.texto)
}
</script>

<template>
  <div class="fc-fab-area">
    <p class="fc-fab-aviso" :class="{ 'is-visivel': avisoWhatsapp.texto }" role="status">{{ avisoWhatsapp.texto }}</p>
    <div class="fc-fab" :class="{ 'is-fora': foraDeCena }" :inert="foraDeCena || undefined" data-fc-fab>
      <BrandLottie ref="nudge" class="fc-fab__nudge" name="whatsapp-nudge" trigger="manual" variant="normal" fluido ocultar-parado />
      <a
        v-if="atalho.url"
        :href="atalho.url"
        target="_blank"
        rel="noopener noreferrer"
        class="fc-fab__botao"
        aria-label="Falar no WhatsApp com a Fornada Conecta"
        data-fc-whatsapp
        @pointerenter="sobre = true"
        @pointerleave="sobre = false"
        @focus="sobre = true"
        @blur="sobre = false"
      >
        <svg width="40" height="40" viewBox="0 0 28 28" fill="none" aria-hidden="true" focusable="false">
          <path class="fc-fab__balao" d="M4 13.5C4 8.25 8.5 4 14 4s10 4.25 10 9.5S19.5 23 14 23c-1.6 0-3.1-.3-4.4-.9L4 24l1.7-4.6C4.6 17.7 4 15.7 4 13.5Z" />
        </svg>
      </a>
      <button
        v-else
        type="button"
        class="fc-fab__botao"
        aria-label="Falar no WhatsApp com a Fornada Conecta"
        data-fc-whatsapp
        @click="aoClicarPendente"
        @pointerenter="sobre = true"
        @pointerleave="sobre = false"
        @focus="sobre = true"
        @blur="sobre = false"
      >
        <svg width="40" height="40" viewBox="0 0 28 28" fill="none" aria-hidden="true" focusable="false">
          <path class="fc-fab__balao" d="M4 13.5C4 8.25 8.5 4 14 4s10 4.25 10 9.5S19.5 23 14 23c-1.6 0-3.1-.3-4.4-.9L4 24l1.7-4.6C4.6 17.7 4 15.7 4 13.5Z" />
        </svg>
      </button>
    </div>
  </div>
</template>

<style>
.fc-fab-area { position: fixed; right: 0; bottom: 0; z-index: 70; width: 0; height: 0; }
.fc-fab {
  position: fixed;
  right: 16px;
  bottom: calc(16px + env(safe-area-inset-bottom));
  width: 64px;
  height: 64px;
  z-index: 70;
  transition: opacity var(--fc-dur-hover) var(--fc-curva-assa), transform var(--fc-dur-hover) var(--fc-curva-assa);
}
@media (min-width: 1024px) { .fc-fab { right: 24px; bottom: 24px; } }
.fc-fab.is-fora {
  opacity: 0;
  transform: translateY(calc(100% + 24px));
  transition-duration: var(--fc-dur-saida);
  pointer-events: none;
}
.fc-fab__botao {
  position: relative;
  z-index: 1;
  display: grid;
  place-items: center;
  width: 64px;
  height: 64px;
  padding: 0;
  border: 2px solid var(--fc-creme);
  border-radius: 50%;
  background-color: var(--fc-marrom);
  color: var(--fc-creme);
  cursor: pointer;
  -webkit-tap-highlight-color: transparent;
  transition: background-color var(--fc-dur-hover) var(--fc-curva-assa), transform var(--fc-dur-pressao) var(--fc-curva-assa);
}
.fc-fab__balao { stroke: var(--fc-creme); stroke-width: 1.6; stroke-linejoin: round; }
@media (hover: hover) and (pointer: fine) { .fc-fab__botao:hover { background-color: var(--fc-marrom-profundo); } }
.fc-fab__botao:active { background-color: var(--fc-marrom-profundo); transform: translateY(1px); }
/* anel duplo: escuro + creme, ≥ 3:1 sobre creme e sobre marrom */
.fc-fab__botao:focus-visible { outline: 3px solid var(--fc-marrom-profundo); outline-offset: 3px; box-shadow: 0 0 0 9px var(--fc-creme); }
/* lembrete centrado no botão e inteiro dentro da tela: no comp de 120 o anel chega a raio 61,8 (88/2 × 136 % + traço);
   do centro do botão à borda são 48 px no celular (16 + 32) e 56 no desktop (24 + 32) → caixa de 92 e de 108 px */
.fc-fab__nudge.fc-lottie { position: absolute; left: 50%; top: 50%; width: 92px; margin: -46px 0 0 -46px; pointer-events: none; }
@media (min-width: 1024px) { .fc-fab__nudge.fc-lottie { width: 108px; margin: -54px 0 0 -54px; } }
.fc-fab-aviso {
  position: fixed;
  right: 16px;
  bottom: calc(96px + env(safe-area-inset-bottom));
  z-index: 70;
  max-width: min(320px, calc(100vw - 32px));
  margin: 0;
  padding: 12px 16px;
  border: 2px solid var(--fc-creme); /* destaca sobre o creme e sobre o rodapé (mesmo fundo profundo) */
  background: var(--fc-marrom-profundo);
  color: var(--fc-creme);
  font: 500 var(--fc-fs-legenda) / 1.45 var(--fc-ff-corpo);
  opacity: 0;
  pointer-events: none;
}
.fc-fab-aviso.is-visivel { opacity: 1; }
@media (min-width: 1024px) { .fc-fab-aviso { right: 24px; bottom: 104px; } }
@media (prefers-reduced-motion: reduce) {
  .fc-fab, .fc-fab__botao { transition: none; }
}
</style>
