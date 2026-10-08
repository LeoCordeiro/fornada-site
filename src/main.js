// Fontes auto-hospedadas (@fontsource): nenhuma requisição a host externo (política de privacidade).
import '@fontsource-variable/fraunces/full.css' // reserva da normal (wght + opsz + SOFT): só baixa caractere fora do subconjunto pt
import '@fontsource-variable/fraunces/soft-italic.css' // reserva do itálico: só baixa se aparecer glifo fora do subconjunto
import './styles/fontes.css' // subconjuntos da Fraunces (normal pt-BR e itálico de display) — DEPOIS do full.css e do soft-italic
import '@fontsource/poppins/latin-400.css'
import '@fontsource/poppins/latin-500.css'
import '@fontsource/poppins/latin-600.css'
import fraunces from './assets/fonts/fraunces-normal-pt.woff2?url' // o subconjunto que o @font-face de fontes.css usa

import 'vuetify/styles'
import './styles/tokens.css'
import './styles/base.css'
import './styles/tipografia.css'
import './styles/vuetify-overrides.css'
import './styles/movimento.css'

import { createApp } from 'vue'
import App from './App.vue'
import vuetify from './plugins/vuetify'
import router from './router'
import { vReveal } from './composables/useReveal'
import { verificarPendencias } from './config/site'

document.documentElement.classList.add('fc-js') // estados "escondido para animar" só existem com JS ligado
// a fonte do H1 (candidato a LCP): no build o preload já vem no index.html (vite.config); em dev, daqui
if (!document.querySelector('link[rel="preload"][as="font"]')) {
  document.head.appendChild(Object.assign(document.createElement('link'), { rel: 'preload', as: 'font', type: 'font/woff2', href: fraunces, crossOrigin: 'anonymous' }))
}

if (import.meta.env.DEV) verificarPendencias()

// Monta só com a 1ª rota resolvida: antes disso o layout pintaria sem página e a página empurraria tudo (CLS).
const app = createApp(App).use(vuetify).use(router).directive('reveal', vReveal)
router.isReady().then(() => app.mount('#app'))
