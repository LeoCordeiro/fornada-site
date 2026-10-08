<script setup>
// Layout. Botão fixo, véu, gaveta e diálogos ficam FORA do <main> e do <router-view>, e não há
// <Transition> em volta do router-view: transform de entrada prenderia o position:fixed.
import { onBeforeUnmount, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import AppHeader from '@/components/layout/AppHeader.vue'
import AppFooter from '@/components/layout/AppFooter.vue'
import WhatsAppFab from '@/components/layout/WhatsAppFab.vue'
import LinkPular from '@/components/layout/LinkPular.vue'
import AvisoPendencias from '@/components/layout/AvisoPendencias.vue'
import CarregandoTela from '@/components/layout/CarregandoTela.vue'
import { jaVista } from '@/composables/useVisita'

const route = useRoute()
const router = useRouter()

// Flags locais com import.meta.env direto (expressão unária = o compilador do SFC não embrulha em unref): o Vite troca o
// MODE por literal e o build de produção remove a faixa de prévia e o AvisoPendencias inteiros (medido no dist).
const previa = !!(import.meta.env.MODE === 'previa')
const pendencias = !!(import.meta.env.DEV || import.meta.env.MODE === 'previa' || import.meta.env.MODE === 'teste')

// Entrada da página: a classe que dispara as entradas entra no t = 0 — na montagem (1ª carga) ou
// quando o véu começa a sair (fc:pagina-revelada); sai quando a próxima navegação cobre a tela.
const entrando = ref(false)
const aoRevelar = () => (entrando.value = !jaVista(route.path))
const tirarGuarda = router.beforeEach((to, from) => {
  if (from.matched.length && to.path !== from.path) entrando.value = false
})
onMounted(() => {
  entrando.value = true
  window.addEventListener('fc:pagina-revelada', aoRevelar)
})
onBeforeUnmount(() => {
  tirarGuarda()
  window.removeEventListener('fc:pagina-revelada', aoRevelar)
})
</script>

<template>
  <v-app class="fc-app">
    <LinkPular />
    <!-- faixa do topo (dev, prévia, teste): o aviso da prévia e as pendências do cliente — nada flutua sobre a página -->
    <div v-if="pendencias" class="fc-faixa-previa">
      <p v-if="previa" class="fc-faixa-previa__texto" role="note">Prévia do site.</p>
      <AvisoPendencias :prefixo="previa ? 'Prévia' : ''" />
    </div>
    <div class="fc-pagina">
      <AppHeader />
      <v-main id="conteudo" tag="main" tabindex="-1" class="fc-main" :class="{ 'fc-pagina-entra': entrando }">
        <router-view />
      </v-main>
    </div>
    <CarregandoTela />
    <AppFooter />
    <WhatsAppFab />
  </v-app>
</template>

<style>
.fc-app.v-application { background: var(--fc-creme); }
.fc-pagina { position: relative; }
.fc-main.v-main { padding: 0; flex: 1 0 auto; }
.fc-faixa-previa {
  position: relative;
  z-index: 65; /* a lista das pendências abre por cima do cabeçalho (60) */
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  align-items: center;
  column-gap: 16px;
  padding: 0 var(--gut);
  background: var(--fc-marrom-profundo);
  color: var(--fc-creme);
  font: 500 var(--fc-fs-rot) / 1.4 var(--fc-ff-corpo);
  letter-spacing: .04em;
  text-align: center;
}
.fc-faixa-previa__texto { margin: 0; padding: 6px 0; }
/* < 768: uma linha só (44 px) — o aviso vira o prefixo do botão das pendências ("Prévia · …") */
@media (max-width: 767px) { .fc-faixa-previa__texto { display: none; } }
</style>
