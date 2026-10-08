<script setup>
/**
 * Perguntas frequentes: VExpansionPanels (accordion) dentro de um BlocoRota.
 * Pergunta em h3 (o botão do Vuetify fica dentro), Fraunces 600, ícone mais/menos, fio entre itens.
 * Abrir: altura 240 ms assa (a única altura animada do site) + texto op 240 fermenta; ícone gira 180° em 200 ms assa; sob RM instantâneo.
 * `resposta` aceita parágrafos separados por linha em branco; marcador de pendência vai no próprio texto.
 * Com link: `paragrafos: [ 'texto', ['antes ', { rotulo, to }, ' depois'] ]` no item, no lugar de `resposta` —
 * cada parte objeto vira router-link (rota com hash: `{ path, hash }`, nunca âncora crua).
 * Slot `fim`: o fecho da seção depois da lista (no Como funciona: "Ficou outra dúvida?" + "Perguntar no WhatsApp"
 * com `ATALHOS.duvidaFaq()`), dentro da mesma seção rotulada.
 */
import BlocoRota from '@/components/rota/BlocoRota.vue'
import CabecalhoSecao from './CabecalhoSecao.vue'

defineProps({
  rotulo: { type: String, default: '' },
  titulo: { type: String, required: true },
  itens: { type: Array, required: true }, // [{ pergunta, resposta }]
  tom: { type: String, default: 'creme' },
  id: { type: String, default: 'faq' }, // âncora da seção (#/como-funciona#faq)
  costura: { type: Object, default: null },
})
const paragrafos = (t) => String(t ?? '').split(/\n\s*\n/).map((p) => p.trim()).filter(Boolean)
// cada parágrafo vira lista de partes: texto ou { rotulo, to }
const partesDe = (item) => (item.paragrafos ?? paragrafos(item.resposta)).map((p) => (Array.isArray(p) ? p : [p]))
</script>

<template>
  <BlocoRota :id="id" :tom="tom" :costura="costura" :rotulado="`${id}-titulo`" class="fc-faq">
    <div class="fc-g">
      <div class="fc-faq__corpo">
        <CabecalhoSecao :id="`${id}-titulo`" :rotulo="rotulo" :titulo="titulo" />
        <v-expansion-panels class="fc-faq__lista" multiple>
          <v-expansion-panel v-for="(item, i) in itens" :key="i" class="fc-faq__item">
            <h3 class="fc-faq__pergunta">
              <v-expansion-panel-title class="fc-faq__botao">{{ item.pergunta }}</v-expansion-panel-title>
            </h3>
            <v-expansion-panel-text class="fc-faq__resposta">
              <p v-for="(partes, k) in partesDe(item)" :key="k" class="fc-txt"><template v-for="(parte, j) in partes" :key="j"><router-link v-if="typeof parte === 'object'" :to="parte.to" class="fc-link">{{ parte.rotulo }}</router-link><template v-else>{{ parte }}</template></template></p>
            </v-expansion-panel-text>
          </v-expansion-panel>
        </v-expansion-panels>
        <!-- fecho da seção, dentro do aria-labelledby ("Ficou outra dúvida?" + BotaoMarca :whatsapp) -->
        <div v-if="$slots.fim" class="fc-faq__fim"><slot name="fim" /></div>
      </div>
    </div>
  </BlocoRota>
</template>

<style>
.fc-faq__lista { margin-top: 32px; border-top: 1px solid var(--fc-linha); }
.fc-faq__fim { margin-top: 40px; display: flex; flex-wrap: wrap; align-items: center; gap: 16px 24px; }
.fc-faq .v-expansion-panel { background: none; color: inherit; border-bottom: 1px solid var(--fc-linha); }
.fc-faq .v-expansion-panel::after { display: none; }
.fc-faq .v-expansion-panel:not(:first-child)::after { display: none; }
.fc-faq__pergunta { margin: 0; }
.fc-faq .v-expansion-panel-title {
  min-height: 64px;
  padding: 20px 0;
  font-family: var(--fc-ff-titulo);
  font-optical-sizing: auto;
  font-variation-settings: "SOFT" 100;
  font-weight: 600;
  font-size: var(--fc-fs-h3);
  line-height: 1.2;
  letter-spacing: -.005em;
  color: inherit;
  text-align: left;
  gap: 16px;
}
.fc-faq .v-expansion-panel-title__overlay { display: none; }
/* foco de teclado na pergunta: o overlay do Vuetify está escondido — o anel de foco vem da raiz (vuetify-overrides.css) */
/* estado no próprio glifo: mais fechado, menos aberto (defaults do plugin) — sem giro, que desvirava a seta */
.fc-faq .v-expansion-panel-text__wrapper { padding: 0 0 24px; display: grid; gap: 12px; }
.fc-faq .v-expansion-panel-text { animation: fc-faq-texto var(--fc-dur-expande) var(--fc-curva-fermenta) backwards; }
/* altura do abrir/fechar: regra de todo painel, em vuetify-overrides.css */
@keyframes fc-faq-texto { from { opacity: 0; } }
@media (prefers-reduced-motion: reduce) {
  .fc-faq .v-expansion-panel-text { animation: none; }
}
@media (min-width: 1024px) { .fc-faq__corpo { grid-column: 2 / 10; } }
</style>
