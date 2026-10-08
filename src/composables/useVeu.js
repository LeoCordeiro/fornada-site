// O véu da rota: SEMPRE que o path muda. Creme opaco sobre o conteúdo, trio de
// carga em CSS no centro; a página nova monta e rola por baixo dele; só sai com componente montado, rolagem feita,
// foco no H1 e fontes prontas. O router chama cobrir()/revelar()/falhar(); o CarregandoTela desenha `estado`.
import { reactive, readonly } from 'vue'
import { reduzirAgora, VEU } from '@/lib/motion'

const estado = reactive({
  fase: 'oculto', // 'oculto' | 'entrando' | 'cheio' | 'saindo'
  estatico: false, // sob reduzir movimento: sem fade, pontos parados, texto visível
  anunciar: false, // role="status" passa a dizer "Carregando…"
  demorou: false, // 5 s sem carregar: texto visível + "Tentar de novo" (o véu ainda sai se a página chegar)
  falhou: false, // router.onError: idem, e o véu fica até "Tentar de novo"
  alvo: '', // destino da navegação (o "Tentar de novo" recarrega nele)
  destino: '', // path de destino desde o beforeEach (o trio da nav desliza junto com o véu)
})

let revelada = true // 1º carregamento: a página é revelada na montagem (não há véu)
let inicio = 0
let mostradoEm = 0
let timers = []
const esperando = new Set()

const espera = (ms) => new Promise((ok) => setTimeout(ok, ms))
const limpar = () => {
  timers.forEach(clearTimeout)
  timers = []
}
const agendar = (fn, ms) => timers.push(setTimeout(fn, ms))

/** beforeEach com troca de path. Resolve quando o véu está opaco (a troca nunca aparece pela metade). */
export async function cobrir(alvo, destino) {
  estado.alvo = alvo
  estado.destino = destino
  estado.falhou = false
  estado.demorou = false
  if (estado.fase !== 'oculto' && estado.fase !== 'saindo') return // já coberto: outra navegação redireciona
  revelada = false
  limpar()
  inicio = performance.now()
  agendar(() => (estado.anunciar = true), VEU.anunciaCarga)
  agendar(() => (estado.demorou = true), VEU.avisoDemora)
  if (reduzirAgora()) {
    // RM: sem fade e sem guard de 120 ms; só aparece se a resolução passar de 100 ms, estático e com texto
    estado.estatico = true
    agendar(() => {
      estado.fase = 'cheio'
      mostradoEm = performance.now()
    }, VEU.semVeuRM)
    return
  }
  estado.estatico = false
  estado.fase = 'entrando'
  mostradoEm = inicio
  await espera(VEU.entra)
  if (estado.fase === 'entrando') estado.fase = 'cheio'
}

/** afterEach, depois de montar, rolar e focar: tempo mínimo, fontes (teto 300 ms) e saída de 200 ms. */
export async function revelar() {
  if (estado.fase === 'oculto') return finalizar()
  await Promise.race([document.fonts?.ready ?? Promise.resolve(), espera(VEU.fontesMax)])
  if (estado.estatico) {
    // RM: se o véu chegou a aparecer, fica no mínimo `mostraCarga` (sem pisca); some sem fade
    const visto = estado.fase === 'cheio' ? performance.now() - mostradoEm : null
    if (visto !== null && visto < VEU.mostraCarga) await espera(VEU.mostraCarga - visto)
    estado.fase = 'oculto'
    return finalizar()
  }
  const decorrido = performance.now() - inicio
  if (decorrido < VEU.minimo) await espera(VEU.minimo - decorrido)
  if (estado.falhou) return // erro na tela: o véu fica até "Tentar de novo"
  estado.fase = 'saindo'
  finalizar()
  await espera(VEU.sai)
  if (estado.fase === 'saindo') estado.fase = 'oculto'
}

function finalizar() {
  limpar()
  estado.anunciar = false
  estado.demorou = false
  estado.falhou = false
  revelada = true
  window.dispatchEvent(new CustomEvent('fc:pagina-revelada'))
  esperando.forEach((fn) => fn())
  esperando.clear()
}

/** router.onError (pedaço da rota não baixou): mostra o texto de falha + "Tentar de novo". */
export function falhar() {
  if (estado.fase === 'oculto') estado.fase = 'cheio'
  estado.falhou = true
}

/** t = 0 da página: já revelada → no próximo quadro; senão quando o véu começar a sair. */
export function quandoRevelada(fn) {
  if (revelada) requestAnimationFrame(() => fn())
  else esperando.add(fn)
  return () => esperando.delete(fn)
}

export function useVeu() {
  return { estado: readonly(estado) }
}
