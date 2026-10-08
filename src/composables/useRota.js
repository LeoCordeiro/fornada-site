// Medição e gatilho da rota longa (RotaTracado): recalcula com ResizeObserver, fonts.ready e load (debounce 120 ms)
// SEM reanimar; acende uma vez por visita; arma o gatilho só quando a página foi revelada (t = 0 da página).
import { onBeforeUnmount, onMounted, ref, shallowRef } from 'vue'
import { segmentar } from '@/lib/rota'
import { reduzirAgora } from '@/lib/motion'
import { quandoRevelada } from './useVeu'
import { usePaginaVista } from './useVisita'
import { observarUmaVez } from '@/lib/gatilho'

export const ehDesktop = () => typeof window !== 'undefined' && window.innerWidth >= 1024

export function useRota(svgRef, { pernas, gatilho = 'viewport', limiar = 0.2 }) {
  const segmentos = shallowRef([])
  const paradas = shallowRef([])
  const tamanho = ref({ w: 0, h: 0 })
  const ligada = ref(false)
  const instantaneo = ref(false)
  const pernasLigadas = ref(new Set()) // acender trecho a trecho (U no celular)
  const vista = usePaginaVista()
  let host = null
  let ro = null
  let soltar = null
  let tmr = 0
  let cancelar = null

  function medir() {
    if (!host || typeof pernas !== 'function') return
    const H = host.getBoundingClientRect()
    const R = (el) => {
      const r = el.getBoundingClientRect()
      return { l: r.left - H.left, t: r.top - H.top, r: r.right - H.left, b: r.bottom - H.top, w: r.width, h: r.height, cx: r.left - H.left + r.width / 2, cy: r.top - H.top + r.height / 2 }
    }
    const RO = (el) => {
      let x = 0
      let y = 0
      let e = el
      while (e && e !== host) {
        x += e.offsetLeft
        y += e.offsetTop
        e = e.offsetParent
      }
      const w = el.offsetWidth
      const h = el.offsetHeight
      return { l: x, t: y, r: x + w, b: y + h, w, h, cx: x + w / 2, cy: y + h / 2 }
    }
    try {
      const { legs = [], pd = [] } = pernas(R, RO, ehDesktop(), host) || {}
      tamanho.value = { w: host.clientWidth, h: host.clientHeight }
      segmentos.value = segmentar(legs, pd)
      paradas.value = pd
    } catch (err) {
      if (import.meta.env.DEV) console.error('[rota]', err)
    }
  }
  const agendar = () => {
    clearTimeout(tmr)
    tmr = setTimeout(medir, 120)
  }

  /** Acende só a perna `i` (as outras seguem apagadas). */
  function ligarPerna(i) {
    if (reduzirAgora()) instantaneo.value = true
    pernasLigadas.value = new Set([...pernasLigadas.value, i])
  }

  /** Acende (uma vez). `instante`: sem transição (RM, página já vista, rota já passou da tela). */
  function ligar(instante = false) {
    if (instante || reduzirAgora()) instantaneo.value = true
    ligada.value = true
    soltar?.()
  }

  onMounted(() => {
    host = svgRef.value?.parentElement
    if (!host) return
    medir()
    document.fonts?.ready.then(medir)
    addEventListener('load', medir, { once: true })
    ro = new ResizeObserver(agendar)
    ro.observe(host)
    if (vista) return ligar(true)
    if (gatilho === 'monta') {
      cancelar = quandoRevelada(() => ligar())
    } else if (gatilho === 'viewport') {
      cancelar = quandoRevelada(() => {
        soltar = observarUmaVez(host, { limiar, entrar: () => ligar(), passou: () => ligar(true) })
      })
    }
  })

  onBeforeUnmount(() => {
    clearTimeout(tmr)
    ro?.disconnect()
    soltar?.()
    cancelar?.()
    removeEventListener('load', medir)
  })

  return { segmentos, paradas, tamanho, ligada, instantaneo, pernasLigadas, ligar, ligarPerna, redesenhar: medir }
}
