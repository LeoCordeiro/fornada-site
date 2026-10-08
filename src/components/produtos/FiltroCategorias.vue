<script setup>
/**
 * Filtro de Produtos. Grupo `role="group"` com BOTÕES `aria-pressed`
 * (não VChipGroup): "Todos" + 4 categorias, 44 px, raio de tag, ativo = fundo marrom + texto creme + check da marca à
 * esquerda, o traço do selo sanitário (não só cor). Quem usa guarda a escolha na URL (router.replace) — aqui só se emite `escolher(slug)`; '' = Todos.
 * Trio S dourado sob o chip ativo ("a rota está aqui"): desliza do chip antigo para o novo em 320 ms assa
 * (Web Animations, partindo da posição calculada se outro clique chegar no meio); no 1º quadro e sob reduzir
 * movimento ele nasce/salta no lugar. Região viva sem contagem. Foco fica no botão clicado; nada rola.
 */
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { CURVA, DUR, reduzirAgora } from '@/lib/motion'
import { CONFIRMADO, mostrarPendencias } from '@/config/site'
import { FILTRO } from './conteudo'

const props = defineProps({
  categorias: { type: Array, required: true }, // [{ chave, titulo }]
  ativa: { type: String, default: '' }, // slug ativo; '' = Todos
  vazia: { type: Boolean, default: false }, // a categoria ativa não tem exemplo (o vazio está na tela)
})
const emit = defineEmits(['escolher'])

const opcoes = computed(() => [{ chave: '', titulo: FILTRO.todos }, ...props.categorias.map(({ chave, titulo }) => ({ chave, titulo }))])
const anuncio = ref('') // vazio na carga: região viva só fala depois de uma troca
const grupo = ref(null)
const trio = ref(null)
const pos = ref(null) // { x, y } do trio, relativo ao grupo
let anim = null
let ro = null

function alvo() {
  const el = grupo.value?.querySelector('[aria-pressed="true"]')
  if (!el) return null
  // centro do chip ativo, 8 px abaixo dele (trio S: 3 × 6 px a cada 9 → 24 × 6)
  return { x: Math.round(el.offsetLeft + el.offsetWidth / 2 - 12), y: el.offsetTop + el.offsetHeight + 8 }
}
const transformDe = (p) => `translate(${p.x}px, ${p.y}px)`

/** Coloca o trio no chip ativo; `deslizar` anima do lugar atual (se não estiver reduzindo movimento). */
function posicionar(deslizar) {
  const novo = alvo()
  if (!novo || !trio.value) return
  const de = trio.value && anim ? getComputedStyle(trio.value).transform : null // no meio de outra viagem: parte daqui
  const antes = pos.value
  anim?.cancel()
  anim = null
  pos.value = novo
  if (!deslizar || !antes || reduzirAgora() || (antes.x === novo.x && antes.y === novo.y)) return
  anim = trio.value.animate([{ transform: de && de !== 'none' ? de : transformDe(antes) }, { transform: transformDe(novo) }], {
    duration: DUR.flip,
    easing: CURVA.assa,
  })
  anim.onfinish = () => (anim = null)
}

watch(
  () => props.ativa,
  async (slug) => {
    const op = opcoes.value.find((o) => o.chave === slug)
    anuncio.value = slug && op ? `${FILTRO.mostrando(op.titulo)}${props.vazia ? ` ${FILTRO.vazio}` : ''}` : FILTRO.mostrandoTodas
    await nextTick() // o check entra no chip ativo e os vizinhos andam: mede depois
    posicionar(true)
  },
)

onMounted(() => {
  posicionar(false) // chegando já filtrado (link da Home): nasce no chip certo, sem deslizar
  // quebra de linha dos chips muda com a largura: reposiciona sem animar
  ro = new ResizeObserver(() => posicionar(false))
  ro.observe(grupo.value)
  document.fonts?.ready.then(() => posicionar(false))
})
onBeforeUnmount(() => {
  ro?.disconnect()
  anim?.cancel()
})

// recado da prévia: some na produção e também quando o cliente confirmar a lista de produtos
const selo = mostrarPendencias && !CONFIRMADO.exemplosProduto
</script>

<template>
  <div class="filtro">
    <!-- rótulo visível; o nome acessível do grupo é o aria-label (mesmo texto), sem leitura dobrada -->
    <p class="fc-rot filtro__rotulo" aria-hidden="true">{{ FILTRO.rotulo }}</p>
    <div ref="grupo" class="filtro__grupo" role="group" :aria-label="FILTRO.rotulo">
      <button
        v-for="op in opcoes"
        :key="op.chave || 'todos'"
        type="button"
        class="filtro__chip"
        :aria-pressed="String(op.chave === ativa)"
        @click="emit('escolher', op.chave)"
      >
        <!-- check da marca: o mesmo traço do check do selo sanitário (M74 102 L92 120 L128 82, ponta redonda) -->
        <svg v-if="op.chave === ativa" class="filtro__check" viewBox="60 70 80 64" width="18" height="18" aria-hidden="true" focusable="false"><path d="M74 102 L92 120 L128 82" /></svg>
        <span>{{ op.titulo }}</span>
      </button>
      <span ref="trio" class="filtro__trio" :class="{ 'is-pronto': pos }" :style="pos ? { transform: transformDe(pos) } : null" aria-hidden="true"><i /><i /><i /></span>
    </div>
    <!-- recado da prévia: no celular vai para depois dos chips (não empurra a barra para o pé da 1ª tela) -->
    <span v-if="selo" class="filtro__selo">{{ FILTRO.aConfirmar }}</span>
    <p class="fc-sr" aria-live="polite">{{ anuncio }}</p>
  </div>
</template>

<style scoped>
.filtro { display: grid; grid-template-columns: minmax(0, 1fr) auto; grid-template-areas: "rotulo rotulo" "grupo grupo" "selo selo"; align-items: center; column-gap: 24px; }
.filtro__rotulo { grid-area: rotulo; }
.filtro__selo {
  grid-area: selo;
  justify-self: start;
  margin-bottom: 12px; /* no celular é o último item da abertura: folga para o trio da costura logo abaixo */
  font: 500 12px / 1.2 var(--fc-ff-corpo);
  letter-spacing: .22em;
  text-transform: uppercase;
  border: 1px dashed var(--fc-marrom-medio);
  border-radius: var(--fc-raio-campo);
  padding: 6px 10px;
  color: var(--fc-marrom);
}
/* linhas de chips com vão para o trio (8 + 6 px) embaixo de cada uma */
.filtro__grupo { grid-area: grupo; position: relative; display: flex; flex-wrap: wrap; gap: 24px 8px; margin-top: 12px; padding-bottom: 16px; }
@media (min-width: 768px) {
  .filtro { grid-template-areas: "rotulo selo" "grupo grupo"; }
  .filtro__selo { justify-self: end; margin-bottom: 0; }
}
.filtro__chip {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  min-height: 44px;
  padding: 0 16px;
  border: 1px solid var(--fc-marrom-medio);
  border-radius: var(--fc-raio-campo);
  background-color: transparent;
  color: var(--fc-marrom);
  font: 500 15px / 1.2 var(--fc-ff-corpo);
  cursor: pointer;
  -webkit-tap-highlight-color: transparent;
  transition:
    background-color var(--fc-dur-hover) var(--fc-curva-assa),
    color var(--fc-dur-hover) var(--fc-curva-assa),
    border-color var(--fc-dur-hover) var(--fc-curva-assa);
}
.filtro__chip[aria-pressed="true"] { background-color: var(--fc-marrom); border-color: var(--fc-marrom); color: var(--fc-creme); padding-left: 12px; }
.filtro__check { flex: none; fill: none; stroke: var(--fc-dourado); stroke-width: 14; stroke-linecap: round; stroke-linejoin: round; }
@media (hover: hover) and (pointer: fine) {
  .filtro__chip[aria-pressed="false"]:hover { background-color: var(--fc-creme-2); border-color: var(--fc-marrom); }
}
.filtro__trio { position: absolute; left: 0; top: 0; display: inline-flex; gap: 3px; opacity: 0; pointer-events: none; }
.filtro__trio.is-pronto { opacity: 1; }
.filtro__trio i { display: block; width: 6px; height: 6px; border-radius: 50%; background: var(--fc-dourado); }
/* abaixo de 400 px os chips cabem em 2 linhas em qualquer estado (com o check no ativo): a 360 eram 3 e empurravam o
   vazio para fora da 1ª tela — corpo 14, laterais 12, check 16 */
@media (max-width: 399px) {
  .filtro__grupo { column-gap: 6px; }
  .filtro__chip { gap: 4px; padding: 0 12px; font-size: 14px; }
  .filtro__chip[aria-pressed="true"] { padding-left: 8px; }
  .filtro__check { width: 16px; height: 16px; }
}
@media (prefers-reduced-motion: reduce) {
  .filtro__chip { transition: none; }
}
</style>
