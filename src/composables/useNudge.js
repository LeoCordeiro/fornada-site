// Lembrete do botão fixo (whatsapp-nudge) e "sair de cena" no celular.
// Contador EM MEMÓRIA DO MÓDULO: nada gravado no navegador (a política promete zero armazenamento).
// Com o hash router a contagem sobrevive à navegação interna; recarregar ou abrir outra aba = visita nova.
import { onBeforeUnmount, onMounted, reactive, readonly, watch } from 'vue'
import { useRoute } from 'vue-router'
import { NUDGE, reduzirAgora } from '@/lib/motion'

let lembretesNestaVisita = 0
let ultimoLembrete = { em: -Infinity, rota: null }
let cliquesWhatsApp = 0

/** Qualquer clique em CTA de WhatsApp (link ou botão pendente) zera os lembretes da visita. */
export const registrarCliqueWhatsApp = () => {
  cliquesWhatsApp++
}
if (typeof document !== 'undefined') {
  document.addEventListener('click', (e) => {
    if (e.target instanceof Element && e.target.closest('[data-fc-whatsapp], a[href^="https://wa.me/"]')) registrarCliqueWhatsApp()
  }, true)
}

// ---- botões de envio de formulário na tela (o botão fixo sai de cena no celular) ----
// cruzando: algum controle de formulário (ou [data-fc-fab-evita]) está embaixo do botão fixo — < 1280 ele sai de
// cena para o toque não cair no WhatsApp genérico em vez do campo
const envio = reactive({ visiveis: 0, campoFocado: false, cruzando: false })
let ioEnvio = null
const naTela = new Set()
function observarEnvio(el) {
  ioEnvio ??= new IntersectionObserver((es) => {
    es.forEach((e) => (e.isIntersecting ? naTela.add(e.target) : naTela.delete(e.target)))
    envio.visiveis = naTela.size
  })
  ioEnvio.observe(el)
  return () => {
    ioEnvio.unobserve(el)
    naTela.delete(el)
    envio.visiveis = naTela.size
  }
}

const CONTROLES = '[data-fc-form] :is(.v-field, .v-selection-control, .fc-form__rotulo, a[href], button), [data-fc-fab-evita]'
let quadroCruza = 0
let ouvintesCruza = 0
/** O canto do botão fixo (64 px + 8 de folga, a 16 px da borda < 1024 e 24 px ≥ 1024) cruza algum controle? */
function medirCruzamento() {
  quadroCruza = 0
  if (window.innerWidth >= 1280) return (envio.cruzando = false)
  const borda = window.innerWidth >= 1024 ? 24 : 16
  const zona = { l: window.innerWidth - borda - 72, t: window.innerHeight - borda - 72 }
  envio.cruzando = [...document.querySelectorAll(CONTROLES)].some((el) => {
    const r = el.getBoundingClientRect()
    return r.width > 0 && r.right > zona.l && r.bottom > zona.t && r.left < window.innerWidth && r.top < window.innerHeight
  })
}
const agendarCruzamento = () => {
  if (!quadroCruza) quadroCruza = requestAnimationFrame(medirCruzamento)
}
// o layout também muda SEM rolagem — o "Qual?" que abre com "Outro", o erro no blur, a troca para o sucesso
// empurram os campos para baixo do botão (ou tiram de lá). ResizeObserver no <main>, na raiz de cada formulário e em
// cada [data-fc-fab-evita], mais change/focusin no documento, pedem a mesma medição (1 por quadro).
let roCruza = null
const EVENTOS_CRUZA = ['change', 'focusin']
function ligarCruzamento(raiz) {
  if (ouvintesCruza++ === 0) {
    window.addEventListener('scroll', agendarCruzamento, { passive: true })
    window.addEventListener('resize', agendarCruzamento)
    EVENTOS_CRUZA.forEach((ev) => document.addEventListener(ev, agendarCruzamento, true))
    roCruza = new ResizeObserver(agendarCruzamento)
    const main = document.getElementById('conteudo')
    if (main) roCruza.observe(main)
    document.querySelectorAll('[data-fc-fab-evita]').forEach((el) => roCruza.observe(el))
  }
  if (raiz) roCruza.observe(raiz)
  agendarCruzamento()
  return () => {
    if (raiz) roCruza?.unobserve(raiz)
    if (--ouvintesCruza === 0) {
      window.removeEventListener('scroll', agendarCruzamento)
      window.removeEventListener('resize', agendarCruzamento)
      EVENTOS_CRUZA.forEach((ev) => document.removeEventListener(ev, agendarCruzamento, true))
      roCruza?.disconnect()
      roCruza = null
      cancelAnimationFrame(quadroCruza)
      quadroCruza = 0
      envio.cruzando = false
    }
  }
}

/** Formulários registram o botão de envio: enquanto ele estiver na tela, o botão fixo sai de cena (< 768); e, com o
 *  formulário montado, o botão fixo também sai quando um controle passa embaixo dele (< 1280). */
export function useBotaoEnvio(elRef) {
  let soltar = null
  let soltarCruza = null
  onMounted(() => {
    const el = elRef.value?.$el ?? elRef.value
    if (el) soltar = observarEnvio(el)
    soltarCruza = ligarCruzamento(el?.closest?.('[data-fc-form]') ?? null)
  })
  onBeforeUnmount(() => {
    soltar?.()
    soltarCruza?.()
  })
}

const ehCampo = (el) => el instanceof Element && el.matches('input, textarea, select, [contenteditable="true"]') && Boolean(el.closest('form'))
if (typeof document !== 'undefined') {
  let tmr = 0
  document.addEventListener('focusin', (e) => {
    clearTimeout(tmr)
    envio.campoFocado = ehCampo(e.target) // campo → botão/título do sucesso: o botão fixo volta na hora certa
  })
  // volta 100 ms depois do último focusout: pular de um campo para outro não pisca o botão
  document.addEventListener('focusout', () => {
    clearTimeout(tmr)
    tmr = setTimeout(() => (envio.campoFocado = ehCampo(document.activeElement)), 100)
  })
}
export const estadoEnvio = readonly(envio)

/**
 * useNudge({ podeAgora, tocar }) — chama `tocar()` quando TODAS as condições abaixo valem.
 * `podeAgora()` é o que só o botão sabe (está na tela, sem hover/foco, não saiu de cena).
 */
export function useNudge({ podeAgora, tocar }) {
  const route = useRoute()
  let inicioPagina = performance.now()
  let rolagemMax = 0
  let quietoDesde = performance.now()
  let tmr = 0

  const mexeu = () => (quietoDesde = performance.now())
  const rolou = () => {
    mexeu()
    const alto = document.documentElement.scrollHeight - innerHeight
    const f = alto <= 2 ? 1 : scrollY / alto
    rolagemMax = Math.max(rolagemMax, f)
  }

  function condicoes() {
    const agora = performance.now()
    if (lembretesNestaVisita >= NUDGE.max || cliquesWhatsApp > 0 || reduzirAgora()) return false
    if (document.visibilityState !== 'visible') return false
    if (agora - inicioPagina < NUDGE.permanenciaMin) return false
    if (rolagemMax < NUDGE.rolagemMin) return false
    if (agora - quietoDesde < NUDGE.quietoMin) return false
    if (document.activeElement?.closest?.('form')) return false
    if (document.querySelector('.v-overlay--active') || document.querySelector('.fc-veu--ativo')) return false
    if (agora - ultimoLembrete.em < NUDGE.intervaloMin || ultimoLembrete.rota === route.path) return false
    return podeAgora()
  }

  function verificar() {
    if (!condicoes()) return
    lembretesNestaVisita++
    ultimoLembrete = { em: performance.now(), rota: route.path }
    tocar()
  }

  watch(
    () => route.path,
    () => {
      inicioPagina = performance.now()
      rolagemMax = 0
      quietoDesde = performance.now()
      rolou()
    },
  )

  onMounted(() => {
    addEventListener('scroll', rolou, { passive: true })
    ;['pointerdown', 'keydown', 'touchstart', 'input'].forEach((ev) => addEventListener(ev, mexeu, { passive: true, capture: true }))
    rolou()
    tmr = setInterval(verificar, 1000)
  })
  onBeforeUnmount(() => {
    clearInterval(tmr)
    removeEventListener('scroll', rolou)
    ;['pointerdown', 'keydown', 'touchstart', 'input'].forEach((ev) => removeEventListener(ev, mexeu, { capture: true }))
  })

  return { lembretes: () => lembretesNestaVisita }
}
