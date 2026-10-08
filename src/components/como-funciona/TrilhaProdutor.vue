<script setup>
/**
 * Trilha do produtor — bloco CREME, UMA coluna com largura de leitura:
 * a parada de entrada "Antes de tudo" (selo-sanitario normal, io .4, o único play de selo da página) e 4 PassoRota.
 * Desktop: o selo de seção (200) à esquerda e o requisito à direita dele, na mesma linha; a rota NASCE dos 3 pontos do
 * selo — o 1º ponto dela é o 4º da fileira (x 176, passo 18, o mesmo desenho dos pontos da logo) — e desce reta pelo
 * centro dos ícones dos passos, que ficam recuados para isso; o texto dos passos e o do requisito começam no mesmo x.
 * Celular/tablet: uma coluna, rota na faixa x 24 e conteúdo em 48 (como o U no celular).
 * Cada trecho k−1→k acende (300 ms assa) quando o passo k cruza 65 % da tela (linha65) e nunca apaga; o marcador do
 * passo (props `estado`/`arco-vazio` do PassoRota) vai de pendente (arco marrom-médio) a atual (arco marrom +
 * miolo dourado) e o anterior vira concluído (miolo marrom), troca em 200 ms. `pao-cresce` no passo 3 dentro do arco C
 * (`moldura`; io .4, 1×, segmento de entrada). Reduzir movimento ou página já vista: rota inteira e todos os
 * marcadores concluídos.
 */
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import BlocoRota from '@/components/rota/BlocoRota.vue'
import RotaTracado from '@/components/rota/RotaTracado.vue'
import CabecalhoSecao from '@/components/secoes/CabecalhoSecao.vue'
import PassoRota from '@/components/secoes/PassoRota.vue'
import SeloSanitario from '@/components/marca/SeloSanitario.vue'
import BotaoMarca from '@/components/marca/BotaoMarca.vue'
import { CTA_PRODUTOR } from '@/data/navegacao'
import { quandoRevelada } from '@/composables/useVeu'
import { usePaginaVista } from '@/composables/useVisita'
import { COSTURA, reduzirAgora } from '@/lib/motion'
import { observarUmaVez } from '@/lib/gatilho'
import { PASSO } from '@/lib/rota'
import { TRILHA_PRODUTOR as T } from './conteudo'

defineProps({
  costura: { type: Object, default: null }, // costura no topo (halo = tom do bloco de cima)
})

const PERNA = 300 // ms por trecho
const selo = ref(null)
const rota = ref(null)
const passos = T.passos.map(() => ref(null))
const vista = usePaginaVista()
const alcancados = ref(new Set()) // índices dos passos a que a rota já chegou
const final = ref(false) // tudo de uma vez (RM, já vista): todos concluídos, nenhum "atual"
const soltos = []
const timers = []
let cancelar = null

const atual = computed(() => (alcancados.value.size ? Math.max(...alcancados.value) : -1))
// marcador do PassoRota: pendente → atual → ok; sob reduzir movimento o próprio PassoRota mostra `ok`
const estado = (i) => (!alcancados.value.has(i) ? 'pendente' : i === atual.value && !final.value ? 'atual' : 'ok')

function pernas(R, RO, desktop) {
  const I = passos.map((p) => R(p.value.icone()))
  const B = passos.map((p) => R(p.value.$el))
  if (desktop) {
    // pontos do selo = os do ícone oficial (viewBox 200: x 176, y 82/100/118, passo 18): a rota continua a fileira
    const S = R(selo.value.$el.querySelector('.fc-selo__desenho'))
    const k = S.w / 200
    const dx = S.l + 176 * k
    const y0 = S.t + 118 * k + PASSO
    const x = I[0].cx
    // o CSS alinha o eixo dos ícones com os pontos; se um compartilhado mudar de medida, a rota ainda liga os dois
    const saida = Math.abs(dx - x) < 1.5 ? [[x, y0]] : [[dx, y0], [dx, y0 + PASSO], [x, y0 + PASSO]]
    return {
      legs: [
        { pts: [...saida, [x, I[0].t - 14]], delay: 0, dur: PERNA },
        ...[1, 2, 3].map((n) => ({ pts: [[x, I[n - 1].b + 14], [x, I[n].t - 14]], delay: 0, dur: PERNA })),
      ],
      pd: [],
    }
  }
  // celular e tablet: faixa da rota em x 24 da tela (o caminho começa na calha de 20)
  const x = 4
  const E = R(selo.value.$el)
  return {
    legs: [
      { pts: [[x, E.t + 8], [x, B[0].t]], delay: 0, dur: PERNA },
      { pts: [[x, B[0].t], [x, B[1].t]], delay: 0, dur: PERNA },
      { pts: [[x, B[1].t], [x, B[2].t]], delay: 0, dur: PERNA },
      { pts: [[x, B[2].t], [x, B[3].b - 8]], delay: 0, dur: PERNA },
    ],
    pd: [],
  }
}

function alcancar(i, instante = false) {
  rota.value?.ligarPerna(i)
  const marcar = () => (alcancados.value = new Set([...alcancados.value, i]))
  if (instante || reduzirAgora()) return marcar()
  timers.push(setTimeout(marcar, PERNA)) // o marcador troca quando a rota chega a ele
}

function tudo() {
  final.value = true
  rota.value?.ligar(true)
  alcancados.value = new Set(passos.map((_, i) => i))
}

onMounted(() => {
  if (vista || reduzirAgora()) return tudo()
  cancelar = quandoRevelada(() => {
    // o passo k chega a 65 % da tela → trecho k−1→k (o 1º sai do selo)
    const margemBaixo = COSTURA.rootMargin.split(' ')[2]
    passos.forEach((p, i) =>
      soltos.push(observarUmaVez(p.value.icone(), { margemBaixo, entrar: () => alcancar(i), passou: () => alcancar(i, true) })),
    )
  })
})
onBeforeUnmount(() => {
  soltos.forEach((f) => f())
  timers.forEach(clearTimeout)
  cancelar?.()
})
</script>

<template>
  <BlocoRota id="trilha-produtor" tom="creme" :costura="costura" rotulado="trilha-produtor-titulo" class="trilha">
    <div class="fc-g">
      <div class="trilha__corpo">
        <CabecalhoSecao id="trilha-produtor-titulo" :rotulo="T.rotulo" :titulo="T.titulo" />
        <div class="trilha__caminho">
          <div class="trilha__entrada">
            <SeloSanitario ref="selo" class="trilha__selo" variante="animado" tamanho="secao" />
            <div class="trilha__entrada-texto">
              <p class="fc-rot">{{ T.entrada.rotulo }}</p>
              <h3 class="fc-h3 trilha__entrada-titulo">{{ T.entrada.titulo }}</h3>
              <p class="fc-txt fc-corpo trilha__entrada-frase">{{ T.entrada.texto }}</p>
              <router-link :to="T.entrada.link.to" class="fc-link fc-link--acao trilha__entrada-link">{{ T.entrada.link.rotulo }}</router-link>
            </div>
          </div>
          <ol class="trilha__passos">
            <li v-for="(p, i) in T.passos" :key="p.numero">
              <PassoRota
                :ref="(el) => (passos[i].value = el)"
                class="trilha__passo"
                :estado="estado(i)"
                :arco-vazio="!p.lottie"
                :moldura="!!p.lottie"
                :numero="p.numero"
                :titulo="p.titulo"
                :texto="p.texto"
                :lottie="p.lottie || ''"
                lottie-trigger="viewport"
                lottie-segmento="entrada"
              />
            </li>
          </ol>
          <BotaoMarca class="trilha__acao" variante="contorno" :to="CTA_PRODUTOR.to">{{ T.acao }}</BotaoMarca>
          <RotaTracado ref="rota" :pernas="pernas" gatilho="manual" />
        </div>
      </div>
    </div>
  </BlocoRota>
</template>

<style scoped>
/* celular/tablet: faixa da rota 20–48, conteúdo em 48 */
.trilha__caminho { position: relative; margin-top: 40px; padding-left: 28px; }
.trilha__passos { list-style: none; margin: 0; padding: 0; display: grid; gap: 48px; }
.trilha__entrada { display: grid; gap: 16px; justify-items: start; margin-bottom: 48px; }
.trilha__entrada-titulo { margin-top: 12px; }
.trilha__entrada-frase { margin-top: 8px; }
.trilha__entrada-link { margin-top: 4px; }

.trilha__acao { margin-top: 56px; }

@media (min-width: 1024px) {
  /* Medidas do alinhamento numa conta só: o selo de seção tem 200 no desktop (SeloSanitario "secao") e os
     pontos dele ficam em x 176/200; o ícone do passo e o vão até o texto vêm dos tokens do PassoRota. Eixo dos
     ícones = x dos pontos → recuo dos passos; texto dos passos = texto do requisito. */
  .trilha {
    --trilha-selo: 200px;
    --trilha-recuo: calc(var(--trilha-selo) * .88 - var(--fc-passo-icone) / 2);
    --trilha-texto: calc(var(--trilha-recuo) + var(--fc-passo-icone) + var(--fc-passo-vao));
  }
  .trilha__corpo { grid-column: 2 / 11; } /* cols 1–9: largura de leitura, uma coluna */
  .trilha__caminho { margin-top: 48px; padding-left: 0; }
  .trilha__entrada { grid-template-columns: var(--trilha-selo) minmax(0, 1fr); column-gap: calc(var(--trilha-texto) - var(--trilha-selo)); align-items: center; margin-bottom: 40px; }
  .trilha__entrada-texto { padding-top: 8px; }
  .trilha__passos { gap: 56px; margin-left: var(--trilha-recuo); }
  .trilha__acao { margin-left: var(--trilha-texto); }
}
</style>
