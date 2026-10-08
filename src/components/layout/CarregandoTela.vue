<script setup>
/**
 * O véu da rota: creme OPACO sobre o conteúdo (camada translúcida deixa ver o que está embaixo), trio M em CSS no
 * centro (sem Lottie: precisa existir no 1º quadro). Cabeçalho, gaveta e botão fixo ficam acima e clicáveis. Sob
 * reduzir movimento: só se passar de 100 ms, parado, com texto.
 */
import { computed, nextTick, ref, watch } from 'vue'
import TresPontos from '@/components/marca/TresPontos.vue'
import BotaoMarca from '@/components/marca/BotaoMarca.vue'
import { useVeu } from '@/composables/useVeu'
import { useRouter } from 'vue-router'

const router = useRouter()
const { estado } = useVeu()
const erro = computed(() => estado.demorou || estado.falhou)
const TEXTO_ERRO = 'A página não carregou. Confere a sua conexão e tenta de novo.'
// a região viva diz o que está na tela: "Carregando…" enquanto espera, o texto da falha quando falha
const status = computed(() => (erro.value ? TEXTO_ERRO : estado.anunciar || estado.estatico ? 'Carregando…' : ''))
const tentar = ref(null)

// falhou: a página antiga sumiu sob o véu — o foco vai para a única ação útil, não fica no body
watch(
  () => estado.falhou,
  (falhou) => falhou && nextTick(() => tentar.value?.$el?.focus?.()),
)

function tentarDeNovo() {
  const alvo = router.resolve(estado.alvo || '/').href
  window.location.href = alvo
  window.location.reload()
}
</script>

<template>
  <div
    class="fc-veu fc-tom fc-tom--creme"
    :class="[`fc-veu--${estado.fase}`, { 'fc-veu--ativo': estado.fase !== 'oculto', 'fc-veu--estatico': estado.estatico }]"
    data-fc-veu
  >
    <div class="fc-veu__centro">
      <TresPontos modo="carga" tamanho="M" texto="" />
      <!-- um só texto: o da região viva (visível quando há falha ou sob reduzir movimento) -->
      <p class="fc-veu__status" :class="{ 'fc-sr': !estado.estatico && !erro }" role="status">{{ status }}</p>
      <div v-if="erro" class="fc-veu__erro">
        <BotaoMarca ref="tentar" variante="contorno" @click="tentarDeNovo">Tentar de novo</BotaoMarca>
      </div>
    </div>
  </div>
</template>

<style>
.fc-veu {
  position: fixed;
  inset: 0;
  z-index: 50; /* acima de toda a página; abaixo do cabeçalho (60), do botão fixo (70) e da gaveta (2400) */
  display: none;
  place-items: center;
  background: var(--fc-creme);
  color: var(--fc-marrom);
}
.fc-veu--ativo { display: grid; }
.fc-veu--entrando { animation: fc-veu-entra 120ms var(--fc-curva-assa) both; }
.fc-veu--saindo { animation: fc-veu-sai var(--fc-dur-hover) var(--fc-curva-fermenta) both; pointer-events: none; }
.fc-veu--estatico { animation: none; }
.fc-veu--estatico .fc-carga__pontos i, .fc-veu--estatico .fc-carga__pontos i::after { animation: none; opacity: 1; }
.fc-veu__centro { display: grid; justify-items: center; gap: 16px; padding: 24px var(--gut); text-align: center; max-width: 40ch; }
.fc-veu__status { margin: 0; font-size: var(--fc-fs-corpo); }
.fc-veu__erro { display: grid; justify-items: center; gap: 16px; }
@keyframes fc-veu-entra { from { opacity: 0; } to { opacity: 1; } }
@keyframes fc-veu-sai { from { opacity: 1; } to { opacity: 0; } }
@media print { .fc-veu { display: none !important; } }
</style>
