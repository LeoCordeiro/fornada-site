<script setup>
/**
 * CTA de assinatura. Pílula, 48/52 px, rótulo Poppins 600 16, trio S à direita.
 * Variantes: 'ouro' (fundo dourado, texto marrom-profundo) · 'contorno' (marrom no creme, creme no escuro — pelo tom) ·
 * 'solido' (marrom). Destino: `to` (rota interna) | `href` (externo, nova aba) | `whatsapp` (texto pronto:
 * vira wa.me pela lib; com o número pendente vira <button> sem href e mostra o aviso) | nada (<button>).
 * `desabilitado` → aria-disabled="true": continua focável, o clique não faz nada.
 */
import { computed } from 'vue'
import TresPontos from './TresPontos.vue'
import { useTom } from '@/composables/useTom'
import { linkWhatsApp } from '@/lib/whatsapp'
import { avisarWhatsappPendente } from '@/composables/useAvisoWhatsapp'

const props = defineProps({
  variante: { type: String, default: 'ouro', validator: (v) => ['ouro', 'contorno', 'solido'].includes(v) },
  to: { type: [String, Object], default: null },
  href: { type: String, default: '' },
  whatsapp: { type: String, default: '' },
  bloco: { type: Boolean, default: false }, // largura total no celular (< 768)
  pontos: { type: Boolean, default: true }, // trio S à direita (no cabeçalho: false, economia de largura)
  desabilitado: { type: Boolean, default: false },
  type: { type: String, default: 'button' }, // só quando vira <button> (ex.: submit de formulário)
  tom: { type: String, default: '' },
})
const emit = defineEmits(['click'])

const { escuro } = useTom(props)
const atalho = computed(() => (props.whatsapp ? linkWhatsApp(props.whatsapp) : null))
const classes = computed(() => [
  'fc-btn',
  `fc-btn--${props.variante}`,
  { 'fc-btn--escuro': escuro.value, 'fc-btn--bloco': props.bloco },
])
const desab = computed(() => (props.desabilitado ? { 'aria-disabled': 'true' } : {}))

function aoClicar(e, navegar) {
  if (props.desabilitado) {
    e.preventDefault()
    return
  }
  if (atalho.value?.pendente) {
    e.preventDefault()
    avisarWhatsappPendente(atalho.value.texto)
  }
  emit('click', e)
  if (navegar && !e.defaultPrevented) navegar(e)
}
</script>

<template>
  <router-link v-if="to && !desabilitado" v-slot="{ href: alvo, navigate, isExactActive }" :to="to" custom>
    <a :href="alvo" :class="classes" :aria-current="isExactActive ? 'page' : undefined" @click="aoClicar($event, navigate)">
      <span class="fc-btn__rotulo"><slot /></span>
      <TresPontos v-if="pontos" tamanho="S" cor="atual" class="fc-btn__trio" />
    </a>
  </router-link>
  <a
    v-else-if="atalho && atalho.url && !desabilitado"
    :href="atalho.url"
    target="_blank"
    rel="noopener noreferrer"
    :class="classes"
    data-fc-whatsapp
    @click="aoClicar($event)"
  >
    <span class="fc-btn__rotulo"><slot /></span>
    <TresPontos v-if="pontos" tamanho="S" cor="atual" class="fc-btn__trio" />
  </a>
  <a v-else-if="href && !desabilitado" :href="href" target="_blank" rel="noopener noreferrer" :class="classes" @click="aoClicar($event)">
    <span class="fc-btn__rotulo"><slot /></span>
    <TresPontos v-if="pontos" tamanho="S" cor="atual" class="fc-btn__trio" />
  </a>
  <button v-else :type="type" :class="classes" v-bind="{ ...desab, ...(atalho ? { 'data-fc-whatsapp': '' } : {}) }" @click="aoClicar($event)">
    <span class="fc-btn__rotulo"><slot /></span>
    <TresPontos v-if="pontos" tamanho="S" cor="atual" class="fc-btn__trio" />
  </button>
</template>

<style>
.fc-btn {
  --h: 48px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  min-height: var(--h);
  max-width: 100%;
  padding: 12px 24px 12px 28px;
  border-radius: var(--fc-raio-botao);
  border: 2px solid transparent;
  background: transparent;
  color: inherit;
  font: 600 var(--fc-fs-botao) / 1.2 var(--fc-ff-corpo);
  letter-spacing: .01em;
  text-align: left;
  text-decoration: none;
  white-space: normal;
  cursor: pointer;
  -webkit-tap-highlight-color: transparent;
  transition:
    background-color var(--fc-dur-hover) var(--fc-curva-assa),
    color var(--fc-dur-hover) var(--fc-curva-assa),
    border-color var(--fc-dur-hover) var(--fc-curva-assa),
    transform var(--fc-dur-pressao) var(--fc-curva-assa);
}
@media (min-width: 1024px) { .fc-btn { --h: 52px; } }
@media (max-width: 767px) { .fc-btn--bloco { width: 100%; justify-content: space-between; } }
/* < 400 px: padding 20/22 e vão do trio 8 — "Pedir orçamento no WhatsApp" cabe numa linha a 375.
   Onde ainda quebra, continua pílula (botão = 999 px, nunca cartão) e as linhas se equilibram
   ("Sou produtor, quero / entrar na rede", nunca "rede" sozinha) */
@media (max-width: 399px) { .fc-btn { gap: 8px; padding: 12px 20px 12px 22px; } }
.fc-btn__rotulo { min-width: 0; text-wrap: balance; }
.fc-btn__trio { transition: transform var(--fc-dur-hover) var(--fc-curva-assa); }

/* ouro — fundo dourado, texto marrom-profundo (6,25); sombra quente só no claro */
.fc-btn--ouro { background-color: var(--fc-dourado); color: var(--fc-marrom-profundo); }
.fc-btn--ouro:not(.fc-btn--escuro):not([aria-disabled="true"]) { box-shadow: var(--fc-sombra-2); }
/* contorno — marrom no creme, creme no escuro */
.fc-btn--contorno { border-color: var(--fc-marrom); color: var(--fc-marrom); }
.fc-btn--contorno.fc-btn--escuro { border-color: var(--fc-creme); color: var(--fc-creme); }
/* sólido marrom */
.fc-btn--solido { background-color: var(--fc-marrom); color: var(--fc-creme); }

/* hover só onde existe hover */
@media (hover: hover) and (pointer: fine) {
  .fc-btn--ouro:not([aria-disabled="true"]):hover { background-color: var(--fc-dourado-hover); }
  .fc-btn:not([aria-disabled="true"]):hover .fc-btn__trio { transform: translateX(var(--fc-desloc-trio)); }
  .fc-btn--contorno:not([aria-disabled="true"]):hover { background-color: var(--fc-marrom); color: var(--fc-creme); }
  .fc-btn--contorno.fc-btn--escuro:not([aria-disabled="true"]):hover { background-color: var(--fc-creme); color: var(--fc-marrom-profundo); }
  .fc-btn--solido:not([aria-disabled="true"]):hover { background-color: var(--fc-marrom-profundo); }
}
/* pressionado: desce 1 px em 120 ms */
.fc-btn:not([aria-disabled="true"]):active { transform: translateY(1px); }
.fc-btn--ouro:not([aria-disabled="true"]):active { background-color: var(--fc-dourado-pressed); box-shadow: none; }
.fc-btn--contorno:not([aria-disabled="true"]):active { background-color: var(--fc-marrom-profundo); border-color: var(--fc-marrom-profundo); color: var(--fc-creme); }
.fc-btn--contorno.fc-btn--escuro:not([aria-disabled="true"]):active { background-color: var(--fc-creme-2); border-color: var(--fc-creme-2); color: var(--fc-marrom-profundo); }
.fc-btn--solido:not([aria-disabled="true"]):active { background-color: var(--fc-marrom-profundo); }

/* desabilitado: claro creme-2/médio · escuro marrom/creme-2 · contorno tracejado marrom-médio */
.fc-btn[aria-disabled="true"] { cursor: not-allowed; box-shadow: none; }
.fc-btn--ouro[aria-disabled="true"], .fc-btn--solido[aria-disabled="true"] { background-color: var(--fc-creme-2); color: var(--fc-marrom-medio); }
.fc-btn--ouro.fc-btn--escuro[aria-disabled="true"] { background-color: var(--fc-marrom); color: var(--fc-creme-2); }
.fc-btn--ouro.fc-btn--escuro[aria-disabled="true"] .fc-pontos i { background: var(--fc-marrom-medio); }
.fc-btn--contorno[aria-disabled="true"] { border: 2px dashed var(--fc-marrom-medio); color: var(--fc-marrom-medio); }

@media (prefers-reduced-motion: reduce) {
  .fc-btn, .fc-btn__trio { transition: none; }
}
</style>
