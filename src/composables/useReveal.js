/**
 * Reveal genérico: op 0→1 + ty 14→0, 400 ms fermenta, limiar .2, stagger 100 ms, máx. 6 degraus,
 * UMA vez por visita. COTA: no máximo 2 seções por página, nunca duas seguidas; H2 de seção não anima.
 *
 *   <ul v-reveal="{ grupo: true }">  → cada filho direto entra em stagger (o 7º em diante usa o atraso do 6º)
 *   <p v-reveal>                      → o próprio elemento
 *
 * Escondido só existe com o JS ligado (.fc-js no <html>) — sem JS o texto aparece. Página já vista nesta visita,
 * foco dentro do bloco ou impressão → visível na hora. Sob reduzir movimento: só opacidade em 200 ms (movimento.css).
 */
import { jaVista } from './useVisita'
import { quandoRevelada } from './useVeu'
import { REVEAL } from '@/lib/motion'
import { ACIMA } from '@/lib/gatilho'

const acoes = new WeakMap()
let io = null
const observador = () =>
  (io ??= new IntersectionObserver(
    (es) =>
      es.forEach((e) => {
        if (!e.isIntersecting) return
        io.unobserve(e.target)
        acoes.get(e.target)?.(e.boundingClientRect.bottom < 0) // acima da tela (a rolagem saltou): visível sem animar
      }),
    { threshold: REVEAL.limiar, rootMargin: `${ACIMA} 0px 0px 0px` },
  ))

if (typeof window !== 'undefined') {
  window.addEventListener('beforeprint', () => document.querySelectorAll('[data-fc-reveal]').forEach((el) => el.classList.add('is-revelado', 'is-instantaneo')))
}

const alvosDe = (el, grupo) => (grupo ? [...el.children] : [el])

export const vReveal = {
  mounted(el, { value }) {
    const { grupo = false } = value || {}
    const alvos = alvosDe(el, grupo)
    alvos.forEach((a, i) => {
      a.dataset.fcReveal = ''
      a.style.setProperty('--fc-i', String(Math.min(i, REVEAL.maxDegraus - 1)))
    })
    const revelar = (instante = false) => {
      alvos.forEach((a) => {
        if (instante) a.classList.add('is-instantaneo')
        a.classList.add('is-revelado')
      })
      io?.unobserve(el)
    }
    const aoFocar = () => revelar(true)
    el.addEventListener('focusin', aoFocar)
    el._fcReveal = { aoFocar, cancelar: null }
    if (typeof IntersectionObserver === 'undefined' || jaVista(location.hash.replace(/^#/, '').split(/[?#]/)[0] || '/')) return revelar(true)
    el._fcReveal.cancelar = quandoRevelada(() => {
      if (!el.isConnected) return
      acoes.set(el, (instante) => revelar(instante))
      observador().observe(el)
    })
  },
  beforeUnmount(el) {
    io?.unobserve(el)
    acoes.delete(el)
    el._fcReveal?.cancelar?.()
    if (el._fcReveal) el.removeEventListener('focusin', el._fcReveal.aoFocar)
  },
}
