<script setup>
/**
 * Página de texto legal — Política de privacidade, Termos de uso e Política de repasse.
 * Abertura creme (rótulo, H1, a linha "Vigência · Versão" do próprio documento e, nos termos, o parágrafo de abertura)
 * → corpo creme com o DocLegal (texto legal integral, sumário, faixa "Minuta" enquanto !SITE.docsRevisados)
 * → fim da página (slot `fim`). Mesmo tom: sem costura interna, sem reveal, sem Lottie — só a costura do rodapé.
 *
 * Sumário: router-link com hash do DocLegal (#/privacidade#secao — a rota não muda; o router rola e foca o título,
 * também no 2º clique na mesma âncora). Links internos do texto legal (v-html) navegam pelo router.
 * O documento ocupa a largura inteira do conteúdo (c-start/c-end): a tabela ganha ~620 px a 1024.
 */
import { useRouter } from 'vue-router'
import AberturaPagina from '@/components/secoes/AberturaPagina.vue'
import BlocoRota from '@/components/rota/BlocoRota.vue'
import DocLegal from '@/components/secoes/DocLegal.vue'
import { SITE } from '@/config/site'
import { useRodape } from '@/composables/useRodape'

defineProps({
  rotulo: { type: String, required: true },
  titulo: { type: String, required: true },
  documento: { type: Object, required: true }, // { cabecalho, intro, secoes } — lerDocumentoLegal()
})

const router = useRouter()
useRodape({ coluna: 12 }) // o fim da página fica na coluna do texto; a costura do rodapé passa à direita, livre

// links do texto legal ("Política de privacidade" nos termos): navegação do router, com véu e foco no H1.
// O router-link do sumário já trata o próprio clique (defaultPrevented).
function aoClicar(e) {
  if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return
  const a = e.target.closest('a[href^="#/"]')
  if (!a) return
  const [, caminho, ancora] = a.getAttribute('href').split('#')
  e.preventDefault()
  router.push(ancora ? { path: caminho, hash: `#${ancora}` } : caminho)
}
</script>

<template>
  <div class="lg" @click="aoClicar">
    <AberturaPagina :rotulo="rotulo" :faixa-escura="false">
      <template #titulo>{{ titulo }}</template>
      <template #extra>
        <!-- v-html: linha do próprio documento legal (texto do repositório, escapado em legal.js) -->
        <p v-if="documento.cabecalho" class="fc-leg lg__vigencia" data-fc-entrada="1" v-html="documento.cabecalho" />
        <!-- v-html: abertura do documento legal (texto do repositório, escapado em legal.js) -->
        <div v-if="documento.intro" class="fc-clg fc-txt lg__intro" data-fc-entrada="1" v-html="documento.intro" />
      </template>
    </AberturaPagina>

    <BlocoRota tom="creme" :pad="{ topo: 8 }" class="lg__corpo">
      <div class="fc-g">
        <div class="lg__doc">
          <DocLegal :secoes="documento.secoes" :minuta="!SITE.docsRevisados" />
          <div v-if="$slots.fim" class="lg__fim">
            <div class="lg__fim-acoes"><slot name="fim" /></div>
          </div>
        </div>
      </div>
    </BlocoRota>
  </div>
</template>

<style scoped>
/* marrom cheio: o marrom-médio (4,76 no creme liso) cai abaixo de 4,5 sobre o brilho dourado da abertura */
.lg__vigencia { margin-top: 24px; }
.lg__vigencia :deep(strong) { font-weight: 600; }
.lg__vigencia :deep(.fc-legal__junto) { white-space: nowrap; }
.lg__intro { margin-top: 24px; }
/* "[a preencher…]" do texto legal: visível e marcado como pendência (texto marrom sobre creme-2 = 8,18) */
.lg :deep(.fc-legal__pendente) {
  background: var(--fc-creme-2);
  color: var(--fc-marrom);
  padding: 0 4px;
  border-bottom: 1px dashed var(--fc-marrom-medio);
  -webkit-box-decoration-break: clone;
  box-decoration-break: clone;
}
.lg__fim { margin-top: 56px; padding-top: 32px; border-top: 1px solid var(--fc-linha); }
.lg__fim-acoes { display: flex; flex-wrap: wrap; align-items: center; gap: 8px 32px; }
@media (min-width: 1024px) {
  /* o fim acompanha a coluna do texto do DocLegal (grade 4fr | 8fr) */
  .lg__fim { display: grid; grid-template-columns: minmax(0, 4fr) minmax(0, 8fr); gap: var(--gap); border-top: 0; padding-top: 0; }
  .lg__fim-acoes { grid-column: 2; padding-top: 32px; border-top: 1px solid var(--fc-linha); }
}
</style>
