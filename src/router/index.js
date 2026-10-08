// Rotas do site. Cada página é a view src/views/<Nome>View.vue, carregada sob demanda; a Home vai no pacote inicial.
// Hash history: o site é estático e as rotas não dependem de regra no servidor.
// Armadilha do hash mode: âncora é sempre { path, hash } — nunca âncora crua com cerquilha (vira rota e cai no 404).
import { createRouter, createWebHashHistory, isNavigationFailure, NavigationFailureType } from 'vue-router'
import { nextTick } from 'vue'
import { doisQuadros, reduzirAgora } from '@/lib/motion'
import { cobrir, falhar, revelar } from '@/composables/useVeu'
import { marcarVista } from '@/composables/useVisita'

const views = import.meta.glob(['../views/*View.vue', '!../views/HomeView.vue'])
// A Home entra no pacote inicial: é a página de entrada mais comum e a do maior elemento da 1ª tela.
const homeEager = import.meta.glob('../views/HomeView.vue', { eager: true })
const v = (nome) => {
  if (nome === 'Home') return homeEager['../views/HomeView.vue'].default
  const view = views[`../views/${nome}View.vue`]
  if (!view) throw new Error(`[router] a view ${nome}View.vue não existe`)
  return view
}
// Título e descrição de cada página (SEO) + nome da página, que vai na mensagem do botão fixo de WhatsApp
const m = (titulo, descricao, nome) => ({ titulo, descricao, nome })

export const routes = [
  { path: '/', name: 'home', component: v('Home'), meta: m('Fornada Conecta · Pão para o comércio de Guarulhos', 'Pão, bolo, salgado assado e massa fresca com entrega recorrente para lanchonetes, cafés e mercadinhos de Guarulhos. Uma entrega e uma cobrança só.', 'Início') },
  { path: '/para-comercios', name: 'para-comercios', component: v('Comercios'), meta: m('Abastecimento de pão em Guarulhos · Fornada Conecta', 'Combina uma vez o que o seu balcão precisa e recebe pão, bolo e salgado no horário, numa entrega só e com uma cobrança só. Guarulhos e região.', 'Para comércios') },
  { path: '/produtos', name: 'produtos', component: v('Produtos'), meta: m('Pães, bolos, salgados e massas · Fornada Conecta', 'Pães, bolos, salgados assados e massas frescas para o giro do seu balcão em Guarulhos. Sem tabela de preço: pede um orçamento pelo WhatsApp.', 'Produtos') },
  { path: '/como-funciona', name: 'como-funciona', component: v('ComoFunciona'), meta: m('Como funciona o abastecimento · Fornada Conecta', 'Do pedido ao balcão em quatro passos: pedido recorrente, escolha do forno, fornada conferida e uma entrega só. Veja também as dúvidas mais comuns.', 'Como funciona') },
  { path: '/seja-produtor', name: 'seja-produtor', component: v('Produtor'), meta: m('Seja produtor parceiro em Guarulhos · Fornada Conecta', 'Tem forno com capacidade sobrando? A rede da Fornada Conecta liga você a comércios de Guarulhos com pedido recorrente. Requisito: regularização sanitária.', 'Seja produtor parceiro') },
  { path: '/qualidade', name: 'qualidade', component: v('Qualidade'), meta: m('Qualidade e segurança alimentar · Fornada Conecta', 'Todo produtor da rede tem regularização sanitária própria. Veja o que exigimos, como a fornada é conferida e como uma reclamação é resolvida.', 'Qualidade') },
  { path: '/sobre', name: 'sobre', component: v('Sobre'), meta: m('Sobre a Fornada Conecta · Parque Uirapuru, Guarulhos', 'Central de abastecimento de panificação no Parque Uirapuru, em Guarulhos: forno próprio e rede de produtores parceiros para o comércio da região.', 'Sobre') },
  { path: '/contato', name: 'contato', component: v('Contato'), meta: m('Contato · Fornada Conecta, Guarulhos/SP', 'Fala com a Fornada Conecta pelo WhatsApp ou por e-mail. Pedidos, parcerias e dúvidas. Parque Uirapuru, Guarulhos/SP.', 'Contato') },
  { path: '/privacidade', name: 'privacidade', component: v('Privacidade'), meta: m('Política de privacidade · Fornada Conecta', 'Como a Fornada Conecta trata os dados dos formulários: o site não grava nada, a mensagem vai pelo WhatsApp. Veja o que coletamos e os seus direitos.', 'Política de privacidade') },
  { path: '/termos', name: 'termos', component: v('Termos'), meta: m('Termos de uso · Fornada Conecta', 'Regras de uso do site da Fornada Conecta: o que o site é, como funcionam os formulários pelo WhatsApp e o que vale como pedido confirmado.', 'Termos de uso') },
  { path: '/repasse', name: 'repasse', component: v('Repasse'), meta: m('Política de repasse e intermediação · Fornada Conecta', 'O caminho do dinheiro na Fornada Conecta: o comércio paga só à Fornada, numa cobrança única, e a Fornada repassa a parte de cada produtor parceiro.', 'Política de repasse e intermediação') },
  { path: '/:pathMatch(.*)*', name: 'nao-encontrada', component: v('NaoEncontrada'), meta: m('Página não encontrada · Fornada Conecta', 'Essa página não existe ou mudou de endereço. Volta para o início ou fala com a Fornada Conecta pelo WhatsApp.', 'Página não encontrada') },
]

// Caminho sem # (Netlify: /* → /index.html 200): /produtos vira /#/produtos; desconhecido cai no 404 do app
if (typeof window !== 'undefined') {
  const caminho = window.location.pathname.replace(/\/index\.html$/, '').replace(/\/+$/, '')
  if (caminho && !window.location.hash) window.history.replaceState(null, '', `/#${caminho}${window.location.search}`)
}

const router = createRouter({
  history: createWebHashHistory(),
  routes,
  // salvo → salvo · hash → seção (top 16; suave só na mesma rota) · troca de path → topo, instantâneo · só query → fica
  scrollBehavior(to, from, salvo) {
    if (salvo) return { ...salvo, behavior: 'instant' }
    if (to.hash) {
      // âncora que não existe na página (renomeada, link com erro): topo, como página nova — sem o elemento o
      // vue-router não rola, a página abria na rolagem da anterior e o foco ia para o H1 fora da tela.
      // getElementById: o hash já vem decodificado e não precisa de escape de seletor
      if (!document.getElementById(to.hash.slice(1))) return { top: 0, behavior: 'instant' }
      const mesma = to.path === from.path
      return { el: to.hash, top: 16, behavior: mesma && !reduzirAgora() ? 'smooth' : 'instant' }
    }
    if (to.path !== from.path) return { top: 0, behavior: 'instant' }
    return false
  },
})

const primeira = (from) => !from.matched.length

router.beforeEach(async (to, from) => {
  if (primeira(from) || to.path === from.path) return true
  marcarVista(from.path) // voltar para ela não reanima
  await cobrir(to.fullPath, to.path) // véu opaco antes de trocar
  return true
})

router.afterEach(async (to, from, falha) => {
  document.title = to.meta.titulo || 'Fornada Conecta'
  document.querySelector('meta[name="description"]')?.setAttribute('content', to.meta.descricao || '')
  if (primeira(from)) return
  if (falha) {
    // 2º clique na âncora da seção atual (duplicada): o vue-router rola de novo, o foco vai ao título
    if (isNavigationFailure(falha, NavigationFailureType.duplicated) && to.hash) {
      await nextTick()
      await doisQuadros()
      return focarAlvo(to.hash)
    }
    if (!isNavigationFailure(falha, NavigationFailureType.cancelled)) revelar() // abortada/duplicada: tira o véu
    return
  }
  if (to.path === from.path) {
    if (to.hash && to.hash !== from.hash) focarAlvo(to.hash) // âncora na mesma página
    return
  }
  await nextTick()
  await doisQuadros() // montou, rolou (scrollBehavior) e o diálogo da gaveta já devolveu o foco dele
  try {
    focarAlvo(to.hash)
  } finally {
    revelar() // o véu sai sempre: um erro no foco não pode deixar a tela coberta
  }
})

router.onError(() => falhar())

/** Foco depois da troca de rota: o H1 da página nova; com âncora, o título da seção-alvo. Nunca na 1ª carga. */
function focarAlvo(hash) {
  const main = document.getElementById('conteudo')
  let alvo = null
  if (hash) {
    // to.hash já chega decodificado do vue-router: decodificar de novo lança URIError com "%" (#/termos#100%25)
    const secao = document.getElementById(hash.slice(1))
    alvo = secao?.matches('h1, h2, h3') ? secao : secao?.querySelector('h2, h3, h1') ?? secao
  }
  alvo ??= main?.querySelector('h1')
  if (!alvo) return main?.focus({ preventScroll: true })
  if (!alvo.hasAttribute('tabindex')) alvo.setAttribute('tabindex', '-1')
  alvo.setAttribute('data-fc-alvo-foco', '')
  alvo.focus({ preventScroll: true })
}

export default router
