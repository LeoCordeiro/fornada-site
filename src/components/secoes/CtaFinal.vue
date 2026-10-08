<script setup>
/**
 * Fecho duplo: título, texto e os 2 CTAs de conversão — dourado "Quero receber
 * fornada" → /para-comercios e contorno "Sou produtor, quero entrar na rede" → /seja-produtor (slot `acoes` troca).
 * `icone`: 'normal' (Home, creme) | 'invertido' (Sobre, marrom) liga o ícone oficial com o Lottie pontos-conecta
 * tocando 1× em io(.5); título e botões ficam estáticos. Sem rota bifurcada. O tom é decisão da página.
 * O texto padrão serve a Home, Como funciona, Qualidade e Sobre.
 * Ordem: os pontos chegam no ícone no mínimo 400 ms DEPOIS da costura de cima acender (a divisa
 * cruzando 65 % da tela) e com o ícone visível (io .5) — o fim da rota da página. Sem costura: só o io(.5).
 */
import { onBeforeUnmount, onMounted, ref } from 'vue'
import BlocoRota from '@/components/rota/BlocoRota.vue'
import BotaoMarca from '@/components/marca/BotaoMarca.vue'
import IconeMarca from '@/components/marca/IconeMarca.vue'
import { CTA_COMERCIO, CTA_PRODUTOR } from '@/data/navegacao'
import { COSTURA } from '@/lib/motion'
import { observarUmaVez } from '@/lib/gatilho'
import { quandoRevelada } from '@/composables/useVeu'
import { usePaginaVista } from '@/composables/useVisita'

const props = defineProps({
  rotulo: { type: String, default: 'Próxima fornada' },
  // "Combina uma vez." não se parte e o "A" não fica sozinho no fim da linha
  titulo: { type: String, default: 'Combina uma\u00a0vez. A\u00a0fornada chega no horário.' },
  texto: {
    type: String,
    default: 'Conta o que o seu balcão precisa e a gente monta a proposta pelo WhatsApp. Tem forno com hora livre e regularização sanitária em dia? Manda o seu cadastro.',
  },
  tom: { type: String, default: 'creme' },
  icone: { type: String, default: 'nenhum', validator: (v) => ['nenhum', 'normal', 'invertido'].includes(v) },
  costura: { type: Object, default: null }, // repassado ao BlocoRota (halo = tom do bloco anterior)
  id: { type: String, default: 'cta-final' }, // id do H2
})

const bloco = ref(null)
const iconeMarca = ref(null) // não pode se chamar `icone`: no template o nome é o da prop
const vista = usePaginaVista()
const soltos = []
let tmr = 0
let cancelar = null

onMounted(() => {
  if (props.icone === 'nenhum' || vista) return
  let costuraPronta = !props.costura
  let iconeNaTela = false
  let tocou = false
  const tentar = () => {
    if (tocou || !costuraPronta || !iconeNaTela) return
    tocou = true
    iconeMarca.value?.tocar()
  }
  cancelar = quandoRevelada(() => {
    const raiz = bloco.value?.$el
    const el = iconeMarca.value && raiz?.querySelector('.fc-cta-final__icone')
    if (!el) return
    if (props.costura) {
      // pronta = os dois trios terminaram de acender (transitionend); trava de segurança em 400 + 200 ms
      const pronta = () => {
        if (costuraPronta) return
        costuraPronta = true
        raiz.removeEventListener('transitionend', aoFim)
        clearTimeout(tmr)
        tentar()
      }
      let acesos = 0
      const aoFim = (e) => {
        if (e.target.classList?.contains('fc-divisa__mascara') && ++acesos >= 2) pronta()
      }
      soltos.push(observarUmaVez(raiz, {
        margemBaixo: COSTURA.rootMargin.split(' ')[2],
        entrar: () => {
          raiz.addEventListener('transitionend', aoFim)
          tmr = setTimeout(pronta, 600)
        },
        passou: pronta,
      }))
      soltos.push(() => raiz.removeEventListener('transitionend', aoFim))
    }
    // rolagem que saltou por cima: fica o ícone parado (os pontos da logo já estão no lugar)
    soltos.push(observarUmaVez(el, { limiar: 0.5, entrar: () => ((iconeNaTela = true), tentar()), passou: () => (tocou = true) }))
  })
})
onBeforeUnmount(() => {
  clearTimeout(tmr)
  soltos.forEach((f) => f())
  cancelar?.()
})
</script>

<template>
  <BlocoRota ref="bloco" :tom="tom" :costura="costura" :rotulado="id" class="fc-cta-final">
    <div class="fc-g">
      <div class="fc-cta-final__corpo" :class="{ 'fc-cta-final__corpo--icone': icone !== 'nenhum' }">
        <IconeMarca v-if="icone !== 'nenhum'" ref="iconeMarca" class="fc-cta-final__icone" :invertido="icone === 'invertido'" gatilho="manual" :tamanho="{ base: 96, desktop: 160 }" />
        <div class="fc-cta-final__texto">
          <p v-if="rotulo" class="fc-rot">{{ rotulo }}</p>
          <h2 :id="id" class="fc-h2 fc-cta-final__titulo">{{ titulo }}</h2>
          <p v-if="texto" class="fc-clg fc-txt fc-cta-final__sub fc-corpo">{{ texto }}</p>
          <div class="fc-cta-final__acoes">
            <slot name="acoes">
              <BotaoMarca variante="ouro" :to="CTA_COMERCIO.to">{{ CTA_COMERCIO.rotulo }}</BotaoMarca>
              <BotaoMarca variante="contorno" :to="CTA_PRODUTOR.to">{{ CTA_PRODUTOR.rotulo }}</BotaoMarca>
            </slot>
          </div>
        </div>
      </div>
    </div>
  </BlocoRota>
</template>

<style>
.fc-cta-final__corpo { display: grid; gap: 32px; }
.fc-cta-final__titulo { margin-top: 16px; }
.fc-cta-final__sub { margin-top: 16px; }
.fc-cta-final__acoes { display: flex; flex-wrap: wrap; align-items: flex-start; gap: 16px; margin-top: 32px; }
@media (min-width: 1024px) {
  .fc-cta-final__corpo { grid-column: 2 / 12; }
  .fc-cta-final__corpo--icone { grid-template-columns: 200px minmax(0, 1fr); align-items: start; column-gap: 48px; }
}
</style>
