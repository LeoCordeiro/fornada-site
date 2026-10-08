<script setup>
/**
 * A linha de três pontos: proporção da logo — passo = 1,5 × diâmetro. XS 4/6 · S 6/9 · M 12/18 · L 16/24.
 *  trio   — divisor/rota (M) ou trio do botão (S, cor="atual"); decorativo
 *  bullet — ponto único de 8 px em lista comum
 *  passo  — indicador: marcadores M (12) ligados por trios XS + texto visível "Passo 2 de 4"; `tamanho="L"` =
 *           marcadores 16 ligados por trios S, a mesma proporção (a assinatura da 404); outro tamanho = M
 *  carga  — loader: ciclo 900 ms, op .3→1→.3 e ty 0→−3→0, 150 ms entre pontos (sob RM: parado + texto)
 * Regra: trio sem função de rota, divisão, passo, bullet ou carga não é renderizado.
 */
import { computed } from 'vue'
import { useTom } from '@/composables/useTom'

const props = defineProps({
  modo: { type: String, default: 'trio', validator: (v) => ['trio', 'bullet', 'passo', 'carga'].includes(v) },
  tamanho: { type: String, default: 'M', validator: (v) => ['XS', 'S', 'M', 'L'].includes(v) },
  orientacao: { type: String, default: 'horizontal', validator: (v) => ['horizontal', 'vertical'].includes(v) },
  cor: { type: String, default: 'dourado', validator: (v) => ['dourado', 'atual'].includes(v) },
  total: { type: Number, default: 4 }, // passo
  atual: { type: Number, default: 1 }, // passo: antes = concluído, igual = atual, depois = pendente
  estados: { type: Array, default: null }, // passo: ['ok'|'atual'|'pendente', …] — vence total/atual (ex.: 404)
  rotulo: { type: String, default: null }, // passo: texto visível (padrão "Passo n de N"; '' = sem texto)
  // passo: os concluídos "acendem" no t = 0 da página (miolo op 0→1 e sc .6→1, 1º em 100–300 ms,
  // 2º em 220–420 ms, assa); sob reduzir movimento e em página já vista, estado final
  acende: { type: Boolean, default: false },
  texto: { type: String, default: 'Carregando…' }, // carga: '' = sem texto ao lado (quem usa anuncia)
  tom: { type: String, default: '' },
})

const { escuro } = useTom(props)
const marcadores = computed(() =>
  props.estados ?? Array.from({ length: props.total }, (_, i) => (i + 1 < props.atual ? 'ok' : i + 1 === props.atual ? 'atual' : 'pendente')),
)
const textoPasso = computed(() => (props.rotulo ?? `Passo ${props.atual} de ${props.total}`))
</script>

<template>
  <span
    v-if="modo === 'trio'"
    class="fc-pontos"
    :class="[`fc-pontos--${tamanho}`, `fc-pontos--${orientacao}`, `fc-pontos--${cor}`]"
    aria-hidden="true"
  ><i /><i /><i /></span>

  <span v-else-if="modo === 'bullet'" class="fc-pontos-bullet" aria-hidden="true" />

  <span v-else-if="modo === 'passo'" class="fc-passos" :class="{ 'fc-passos--escuro': escuro, 'fc-passos--acende': acende, 'fc-passos--L': tamanho === 'L' }">
    <span class="fc-passos__linha" aria-hidden="true">
      <template v-for="(e, i) in marcadores" :key="i">
        <span v-if="i > 0" class="fc-pontos fc-pontos--horizontal fc-pontos--dourado" :class="tamanho === 'L' ? 'fc-pontos--S' : 'fc-pontos--XS'"><i /><i /><i /></span>
        <i class="fc-passos__marca" :class="`fc-passos__marca--${e}`" :style="acende ? { '--fc-i': i } : undefined" />
      </template>
    </span>
    <span v-if="textoPasso" class="fc-passos__texto fc-leg">{{ textoPasso }}</span>
  </span>

  <span v-else class="fc-carga" :class="[`fc-carga--${tamanho}`, { 'fc-carga--escuro': escuro }]">
    <span class="fc-carga__pontos" aria-hidden="true"><i /><i /><i /></span>
    <span v-if="texto" class="fc-carga__texto">{{ texto }}</span>
  </span>
</template>

<style>
.fc-pontos { display: inline-flex; flex: none; vertical-align: middle; }
.fc-pontos i { display: block; border-radius: 50%; background: var(--fc-dourado); }
.fc-pontos--atual i { background: currentColor; }
.fc-pontos--vertical { flex-direction: column; }
.fc-pontos--XS { gap: 2px; } .fc-pontos--XS i { width: 4px; height: 4px; }
.fc-pontos--S { gap: 3px; } .fc-pontos--S i { width: 6px; height: 6px; }
.fc-pontos--M { gap: 6px; } .fc-pontos--M i { width: 12px; height: 12px; }
.fc-pontos--L { gap: 8px; } .fc-pontos--L i { width: 16px; height: 16px; }

.fc-pontos-bullet { display: inline-block; flex: none; width: 8px; height: 8px; border-radius: 50%; background: var(--fc-dourado); }

/* indicador de passo: sobre creme o "atual" leva anel marrom (3:1); sobre escuro creme/dourado */
.fc-passos { display: inline-flex; flex-wrap: wrap; align-items: center; gap: 8px 12px; }
.fc-passos__linha { display: inline-flex; align-items: center; gap: 6px; }
.fc-passos__marca { display: block; width: 12px; height: 12px; border-radius: 50%; border: 2px solid var(--fc-marrom-medio); flex: none; }
.fc-passos__marca--atual { background: var(--fc-dourado); border-color: var(--fc-marrom); }
.fc-passos__marca--ok { background: var(--fc-marrom); border-color: var(--fc-marrom); }
.fc-passos--escuro .fc-passos__marca { border-color: var(--fc-creme-2); }
.fc-passos--escuro .fc-passos__marca--atual { background: var(--fc-dourado); border-color: var(--fc-dourado); }
.fc-passos--escuro .fc-passos__marca--ok { background: var(--fc-creme); border-color: var(--fc-creme); }
/* passo L: marcador 16 com vão 8 (passo 24 = 1,5 × 16) e ligação S — a proporção da logo */
.fc-passos--L .fc-passos__linha { gap: 8px; }
.fc-passos--L .fc-passos__marca { width: 16px; height: 16px; }
/* "acende": o concluído começa igual ao pendente — anel marrom-médio (creme-2 no escuro) — e o miolo
   é um ::after que cobre a borda inteira (inset −2 px: sem anel claro de emenda). O anel escurece junto com o
   miolo; o desenho final é o disco liso do estático. */
.fc-passos--acende .fc-passos__marca--ok { position: relative; background: none; }
.fc-passos--acende .fc-passos__marca--ok::after { content: ""; position: absolute; inset: -2px; border-radius: 50%; background: var(--fc-marrom); }
.fc-passos--acende.fc-passos--escuro .fc-passos__marca--ok::after { background: var(--fc-creme); }
:where(.fc-js .fc-pagina-entra) .fc-passos--acende .fc-passos__marca--ok,
:where(.fc-js .fc-pagina-entra) .fc-passos--acende .fc-passos__marca--ok::after {
  animation: fc-passo-acende var(--fc-dur-hover) var(--fc-curva-assa) backwards;
  animation-delay: calc(var(--fc-stagger) + var(--fc-i, 0) * var(--fc-stagger-passo));
}
:where(.fc-js .fc-pagina-entra) .fc-passos--acende .fc-passos__marca--ok { animation-name: fc-passo-anel; }
:where(.fc-js .fc-pagina-entra) .fc-passos--acende.fc-passos--escuro .fc-passos__marca--ok { animation-name: fc-passo-anel-escuro; }
@keyframes fc-passo-acende { from { opacity: 0; transform: scale(.6); } }
@keyframes fc-passo-anel { from { border-color: var(--fc-marrom-medio); } }
@keyframes fc-passo-anel-escuro { from { border-color: var(--fc-creme-2); } }
@media (prefers-reduced-motion: reduce) {
  :where(.fc-js .fc-pagina-entra) .fc-passos--acende .fc-passos__marca--ok,
  :where(.fc-js .fc-pagina-entra) .fc-passos--acende .fc-passos__marca--ok::after { animation: none; }
}

/* loader de pontos: M = anel 2 px marrom fixo + miolo dourado que pulsa */
.fc-carga { display: inline-flex; align-items: center; gap: 12px; }
.fc-carga__pontos { display: inline-flex; }
.fc-carga__pontos i {
  display: block;
  border-radius: 50%;
  animation: fc-carga var(--fc-dur-ciclo-carga) var(--fc-curva-assa) infinite;
}
.fc-carga__pontos i:nth-child(2) { animation-delay: var(--fc-stagger-carga); }
.fc-carga__pontos i:nth-child(3) { animation-delay: calc(2 * var(--fc-stagger-carga)); }
.fc-carga--S .fc-carga__pontos { gap: 3px; }
.fc-carga--S .fc-carga__pontos i { width: 6px; height: 6px; background: var(--fc-dourado); }
.fc-carga--M .fc-carga__pontos { gap: 6px; }
.fc-carga--M .fc-carga__pontos i {
  width: 12px;
  height: 12px;
  border: 2px solid var(--fc-marrom);
  background: none;
  animation-name: fc-carga-sobe;
}
.fc-carga--M .fc-carga__pontos i::after {
  content: "";
  display: block;
  width: 100%;
  height: 100%;
  border-radius: 50%;
  background: var(--fc-dourado);
  animation: fc-carga-luz var(--fc-dur-ciclo-carga) var(--fc-curva-assa) infinite;
  animation-delay: inherit;
}
.fc-carga--escuro.fc-carga--M .fc-carga__pontos i { border-color: var(--fc-creme); }
.fc-carga__texto { font-size: var(--fc-fs-legenda); line-height: 1.5; }
@keyframes fc-carga { 0%, 100% { opacity: .3; transform: translateY(0); } 50% { opacity: 1; transform: translateY(-3px); } }
@keyframes fc-carga-sobe { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-3px); } }
@keyframes fc-carga-luz { 0%, 100% { opacity: .3; } 50% { opacity: 1; } }
@media (prefers-reduced-motion: reduce) {
  .fc-carga__pontos i, .fc-carga__pontos i::after { animation: none; opacity: 1; }
}
</style>
