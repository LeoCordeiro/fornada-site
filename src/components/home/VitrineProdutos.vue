<script setup>
/**
 * Produtos da Início: as 4 categorias em TEXTO — foto de banco nunca representa o produto que o cliente recebe. A
 * foto de processo só com a real: colada em "O que sai das fornadas da rede", qualquer pão assado de banco viraria o
 * produto da rede.
 * ≥ 1024: H2 nas colunas 1–5 e "Ver todos os produtos" à direita, na linha dele (as colunas 6–7 ficam livres no
 * topo: é por ali que descem os 3 pontos da saída da rota); com foto, a foto nas colunas 1–5 e a lista nas 8–12; sem
 * foto, as 4 categorias lado a lado nas 12 colunas (2 por linha no tablet). Cada categoria é um link para o filtro
 * dela, com fio de 1 px. Embaixo, o orçamento vira link de texto. < 768: H2 → "Ver todos" → (foto 4:3 sangrando) →
 * lista → orçamento. Topo com 80 px em toda largura: a rota sai da faixa marrom por ele (x 24 no celular).
 * Só Pães leva frase (a de produção, `textoSemExemplos`): a Home não depende da lista de exemplos do cliente.
 */
import { computed } from 'vue'
import BlocoRota from '@/components/rota/BlocoRota.vue'
import FotoReal from '@/components/marca/FotoReal.vue'
import { CATEGORIAS, FRASE_CATEGORIA } from '@/data/categorias'
import { ATALHOS } from '@/data/atalhosWhatsapp'
import { fotoNoAr } from '@/data/fotos'
import { linkWhatsApp } from '@/lib/whatsapp'
import { avisarWhatsappPendente } from '@/composables/useAvisoWhatsapp'
import { PRODUTOS as P } from './conteudo'

const comFoto = fotoNoAr('inicio-produtos-forno')
const SIZES = '(min-width: 1200px) 459px, (min-width: 1024px) calc(41.7vw - 41px), 100vw'
const orcamento = computed(() => linkWhatsApp(ATALHOS.orcamento('todas')))

// número pendente (prévia sem cadastro): o mesmo aviso do BotaoMarca, no lugar de abrir o WhatsApp
function aoClicarOrcamento(e) {
  if (!orcamento.value.pendente) return
  e.preventDefault()
  avisarWhatsappPendente(orcamento.value.texto)
}
</script>

<template>
  <BlocoRota
    tom="creme"
    class="fc-vp"
    :class="{ 'fc-vp--sem-foto': !comFoto }"
    :pad="{ topo: 'var(--fc-respiro-rota)', base: 'var(--fc-secao-home)' }"
    rotulado="produtos-titulo"
  >
    <div class="fc-g fc-vp__g">
      <h2 id="produtos-titulo" class="fc-h2 fc-vp__titulo">{{ P.titulo }}</h2>
      <p class="fc-vp__todos">
        <router-link :to="P.todos.to" class="fc-link fc-link--acao">{{ P.todos.rotulo }}</router-link>
      </p>
      <FotoReal v-if="comFoto" class="fc-vp__foto" chave="inicio-produtos-forno" proporcao="4:3" :sizes="SIZES" />
      <ul class="fc-vp__lista">
        <li v-for="(c, i) in CATEGORIAS" :key="c.chave">
          <router-link :to="{ path: '/produtos', query: { categoria: c.chave } }" class="fc-vp__cat">
            <h3 class="fc-h3 fc-vp__nome">{{ c.titulo }}</h3>
            <p v-if="i === 0" class="fc-corpo fc-vp__frase">{{ FRASE_CATEGORIA[c.chave] }}</p>
          </router-link>
        </li>
      </ul>
      <p class="fc-corpo fc-vp__orc">
        {{ P.orcamento.antes }}<a
          v-if="orcamento.url"
          class="fc-link"
          :href="orcamento.url"
          target="_blank"
          rel="noopener noreferrer"
          data-fc-whatsapp
        >{{ P.orcamento.link }}</a><button
          v-else
          type="button"
          class="fc-link fc-vp__orc-btn"
          data-fc-whatsapp
          @click="aoClicarOrcamento"
        >{{ P.orcamento.link }}</button>{{ P.orcamento.depois }}
      </p>
    </div>
  </BlocoRota>
</template>

<style scoped>
.fc-vp__todos { margin-top: 8px; }
.fc-vp__foto { grid-column: full-start / full-end; margin-top: 24px; }
.fc-vp__lista { list-style: none; margin: 16px 0 0; padding: 0; }
.fc-vp__lista li + li { border-top: 1px solid var(--fc-linha); }
.fc-vp__cat { display: block; padding: 20px 0; color: inherit; text-decoration: none; }
.fc-vp__nome { font-size: var(--fc-fs-h3); }
.fc-vp__frase { margin-top: 4px; }
@media (hover: hover) and (pointer: fine) {
  .fc-vp__cat:hover .fc-vp__nome { text-decoration: underline; text-underline-offset: 6px; text-decoration-thickness: 2px; }
}
.fc-vp__orc { margin-top: 24px; }
.fc-vp__orc-btn { padding: 0; border: 0; background: none; cursor: pointer; font-weight: inherit; }
@media (min-width: 1024px) {
  .fc-vp__titulo { grid-column: 2 / 7; grid-row: 1; }
  .fc-vp__todos { grid-column: 9 / 14; grid-row: 1; justify-self: end; align-self: end; margin-top: 0; }
  .fc-vp__foto { grid-column: 2 / 7; grid-row: 2; margin-top: 40px; }
  .fc-vp__lista { grid-column: 9 / 14; grid-row: 2; align-self: center; margin-top: 40px; }
  .fc-vp__orc { grid-column: 2 / 14; grid-row: 3; margin-top: 40px; }
}
/* sem foto (até a real chegar): a lista ocupa a largura — 2 por linha no tablet, as 4 lado a lado no desktop, cada
   uma com o fio em cima — em vez de uma coluna estreita que deixava a metade direita vazia */
@media (min-width: 768px) {
  .fc-vp--sem-foto .fc-vp__lista { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); column-gap: var(--gap); margin-top: 32px; }
  .fc-vp--sem-foto .fc-vp__lista li { border-top: 1px solid var(--fc-linha); }
}
@media (min-width: 1024px) {
  .fc-vp--sem-foto .fc-vp__lista { grid-column: 2 / 14; grid-template-columns: repeat(4, minmax(0, 1fr)); align-self: start; }
}
</style>
