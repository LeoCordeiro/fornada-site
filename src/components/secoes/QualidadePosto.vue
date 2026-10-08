<script setup>
/**
 * "Posto de conferência na rota". Desktop partido: marrom
 * (cols 1–5: selo animado 200 px invertido, rótulo, H2) | creme (cols 6–12: sub, ListaGarantias, nota, foto 3:2).
 * Celular: marrom em cima (selo 140) → creme. A rota desce do bloco de cima até os 3 pontos do selo (parada na
 * borda de cima, halo = `haloTopo`), sai pela abertura do C e cruza a divisa (parada, halo marrom) até o 2º item.
 * Sem `titulo`: o posto não tem H2 próprio e se rotula pelo H1 da página (`rotuladoPor` — Qualidade).
 */
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import SeloSanitario from '@/components/marca/SeloSanitario.vue'
import RotaTracado from '@/components/rota/RotaTracado.vue'
import ListaGarantias from './ListaGarantias.vue'
import { quandoRevelada } from '@/composables/useVeu'
import { reduzirAgora } from '@/lib/motion'
import { observarUmaVez } from '@/lib/gatilho'

// Sem texto padrão: a página passa o seu
const props = defineProps({
  rotulo: { type: String, default: '' },
  titulo: { type: String, default: '' }, // '' = sem H2 (use rotuladoPor)
  sub: { type: String, default: '' },
  itens: { type: Array, required: true }, // [{ titulo, texto }] — a rota do desktop chega ao trio do 2º item
  nota: { type: String, default: '' },
  acao: { type: Object, default: null }, // { rotulo, to }
  idTitulo: { type: String, default: 'qualidade-titulo' },
  rotuladoPor: { type: String, default: '' },
  haloTopo: { type: String, default: 'creme' }, // tom do bloco de cima (parada da borda)
  // nível dos títulos das garantias: 3 abaixo do H2 do posto (Home); sem H2 próprio (Qualidade, rotulado pelo H1) a
  // página passa 2 — o esqueleto não salta de H1 para H3
  nivelItens: { type: Number, default: 3 },
})

const rotulado = computed(() => (props.titulo ? props.idTitulo : props.rotuladoPor || undefined))
const secao = ref(null)
const rota = ref(null)
let soltar = null
let cancelar = null
let esperar = null

// a rota acende quando o selo COMEÇA a tocar, não no gatilho do io. Na carga direta o Lottie ainda espera o
// liberar() (load + ocioso + 1000 ms) e a rota passava ~600 ms pelo lugar vazio do selo. Selo no pôster (os
// 600 ms sem arquivo) ou com falha → a rota acende inteira junto; trava: acende sozinha em 2,5 s.
function quandoSeloComecar(fn) {
  const lottie = secao.value?.querySelector('.fc-q__selo [data-lottie]')
  if (!lottie) {
    fn(false)
    return null
  }
  const estado = () => lottie.dataset.lottieEstado
  const comecou = () => ['tocando', 'poster', 'falha'].includes(estado())
  let mo = null
  let trava = 0
  const parar = () => {
    mo?.disconnect()
    clearTimeout(trava)
  }
  const pronto = (inteira) => {
    parar()
    fn(inteira)
  }
  if (comecou()) {
    pronto(estado() !== 'tocando')
    return null
  }
  mo = new MutationObserver(() => comecou() && pronto(estado() !== 'tocando'))
  mo.observe(lottie, { attributes: true, attributeFilter: ['data-lottie-estado'] })
  trava = setTimeout(() => pronto(false), 2500)
  return parar
}

// a rota e o selo têm o MESMO gatilho: io(selo, .4) — e a rota espera o selo começar
onMounted(() => {
  if (reduzirAgora()) return rota.value?.ligar(true)
  cancelar = quandoRevelada(() => {
    soltar = observarUmaVez(secao.value.querySelector('.fc-q__selo .fc-selo__desenho'), {
      limiar: 0.4,
      entrar: () => {
        esperar = quandoSeloComecar((inteira) => rota.value?.ligar(inteira))
      },
      passou: () => rota.value?.ligar(true),
    })
  })
})
onBeforeUnmount(() => {
  soltar?.()
  cancelar?.()
  esperar?.()
})

function pernas(R, RO, desktop, host) {
  const sel = R(host.querySelector('.fc-q__selo .fc-selo__desenho'))
  const s = sel.w / 200
  const tx = sel.l + 176 * s
  const ty = sel.t + 82 * s
  const mx = tx
  const my = sel.t + 100 * s
  const qc = R(host.querySelector('.fc-q__c'))
  // parada só onde há divisa: bloco de cima marrom = mesma cor da metade do selo, sem divisa a marcar
  const semDivisa = props.haloTopo === 'marrom'
  // a rota desce do bloco de cima (3 pontos acima da divisa); sem divisa, só 1 — o texto do bloco de cima pode
  // terminar a 72 px dela
  const topo = semDivisa ? -30 : -66
  const legs = [{ pts: [[tx, topo], [tx, ty - 18]], delay: 0, dur: 450 }]
  const pd = semDivisa ? [] : [{ x: tx, y: 0, halo: props.haloTopo }]
  if (desktop) {
    const gap = parseFloat(getComputedStyle(host.querySelector('.fc-q')).columnGap) || 24
    const seamX = qc.l - gap / 2
    const lane = seamX + 48
    const bl = R(host.querySelectorAll('.fc-garantias__trio')[1])
    legs.push({ pts: [[mx + 18, my], [lane, my], [lane, bl.cy], [bl.l - 18, bl.cy]], delay: 450, dur: 550 })
    pd.push({ x: seamX, y: my, halo: 'marrom' })
  } else {
    const xr = host.clientWidth - 24
    legs.push({ pts: [[mx + 18, my], [xr, my], [xr, qc.t + 66]], delay: 450, dur: 550 })
    pd.push({ x: xr, y: qc.t, halo: 'marrom' })
  }
  return { legs, pd }
}
</script>

<template>
  <section ref="secao" class="fc-q-sec fc-pede-respiro" :aria-labelledby="rotulado" data-fc-tom="creme">
    <div class="fc-g fc-q">
      <div class="fc-q__m fc-tom fc-tom--marrom">
        <!-- sob reduzir movimento a rota nasce pronta e o selo mostra o desenho fixo do quadro 14 desde o 1º quadro,
             até o pôster do Lottie chegar (SeloSanitario) -->
        <SeloSanitario class="fc-q__selo" variante="animado" tamanho="secao" tom="marrom" />
        <p v-if="rotulo" class="fc-rot fc-q__rotulo">{{ rotulo }}</p>
        <h2 v-if="titulo" :id="idTitulo" class="fc-h2 fc-q__titulo">{{ titulo }}</h2>
        <!-- slot `marrom`: o que a página põe embaixo do selo/título na metade marrom (ex.: foto da conferência) -->
        <div v-if="$slots.marrom" class="fc-q__marrom-extra"><slot name="marrom" /></div>
      </div>
      <div class="fc-q__c fc-tom fc-tom--creme">
        <p v-if="sub" class="fc-txt fc-clg">{{ sub }}</p>
        <ListaGarantias :itens="itens" :nivel="nivelItens" />
        <p v-if="nota" class="fc-leg fc-q__nota">{{ nota }}</p>
        <p v-if="acao" class="fc-q__acao">
          <router-link :to="acao.to" class="fc-link fc-link--acao">{{ acao.rotulo }}</router-link>
        </p>
      </div>
    </div>
    <RotaTracado ref="rota" :pernas="pernas" gatilho="manual" />
  </section>
</template>

<style>
.fc-q-sec { position: relative; overflow-x: clip; container-type: inline-size; }
.fc-q { position: relative; }
.fc-q > .fc-q__m, .fc-q > .fc-q__c { grid-column: full-start / full-end; }
.fc-q__m {
  background: var(--fc-ruido-e), radial-gradient(circle at 34% 22%, color-mix(in srgb, var(--fc-dourado) 22%, transparent), transparent 58%), var(--fc-marrom);
  background-color: var(--fc-marrom);
  padding: 48px var(--gut) 64px;
}
.fc-q__selo { position: relative; z-index: 2; }
.fc-q__rotulo { margin-top: 32px; padding-right: 48px; }
.fc-q__titulo { margin-top: 16px; padding-right: 48px; }
.fc-q__c { background: var(--fc-ruido-c), var(--fc-creme); background-color: var(--fc-creme); padding: 96px var(--gut) 72px; display: flex; flex-direction: column; gap: 28px; }
.fc-q__nota { color: var(--fc-marrom-medio); } /* marrom-médio só sobre creme, ≥ 14 px */
.fc-q__marrom-extra { position: relative; z-index: 2; margin-top: 40px; padding-right: 48px; } /* < 1024 a rota desce em x − 24 */
/* o slot só tinha a foto e ela não existe em produção (FotoReal sem src → comentário vazio): o vão some junto */
.fc-q__marrom-extra:empty { display: none; }
@media (min-width: 1024px) { .fc-q__marrom-extra { padding-right: 0; } }
@media (min-width: 1024px) {
  /* metades = ancestrais reais do texto (o fundo efetivo de cada texto é o da metade dele): marrom da borda esquerda até a divisa (meio do vão depois da col 5), creme da divisa até a
     borda direita. A margem negativa leva cada metade meio vão até a divisa; o recuo interno em cqw (largura da seção)
     devolve o conteúdo às colunas. */
  .fc-q > .fc-q__m {
    grid-column: full-start / 7;
    margin-right: calc(var(--gap) / -2);
    padding: 72px calc(var(--gap) / 2) 72px calc((100cqw - min(100cqw, var(--fc-wrap-max))) / 2 + var(--gut));
    background: var(--fc-ruido-e), radial-gradient(circle at 40% 24%, color-mix(in srgb, var(--fc-dourado) 22%, transparent), transparent 58%), var(--fc-marrom);
    background-color: var(--fc-marrom);
  }
  .fc-q > .fc-q__c {
    grid-column: 7 / full-end;
    margin-left: calc(var(--gap) / -2);
    padding: 48px calc((100cqw - min(100cqw, var(--fc-wrap-max))) / 2 + var(--gut)) 72px calc(80px + var(--gap) / 2);
  }
  .fc-q__rotulo, .fc-q__titulo { padding-right: 0; }
  /* metade marrom SEM foto: o conteúdo dela fica no meio da altura, não colado em cima com o vazio todo embaixo.
     A rota mede o selo onde ele está. Com a foto na própria metade marrom (conferência da Qualidade), nada muda. */
  .fc-q > .fc-q__m:not(:has(.fc-foto)) { display: flex; flex-direction: column; justify-content: center; }
}
</style>
