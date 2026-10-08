<script setup>
/**
 * Produtos da Início: o pão em destaque (foto 4:3, nome e frase) e as outras três categorias em lista, cada uma com a
 * foto em miniatura quadrada (o mesmo arquivo 4:3, cortado no centro). Cada categoria é um link para o filtro dela em
 * Produtos; a foto fica dentro do link com alt "" (o nome da categoria já diz o que ela mostra).
 * ≥ 1024: H2 nas colunas 1–5 e "Ver todos os produtos" à direita, na linha dele (as colunas 6–7 ficam livres no topo:
 * é por ali que descem os 3 pontos da saída da rota); destaque nas colunas 1–5, lista nas 8–12 com fio de 1 px entre
 * as linhas e miniaturas de 112 px. Embaixo, o orçamento (link de texto para o WhatsApp).
 * 768–1023: destaque e lista lado a lado, 4 colunas cada. < 768: H2 → "Ver todos" → destaque com a foto sangrando as
 * duas bordas → lista com miniaturas de 88 px → orçamento.
 * Topo com 80 px em toda largura: a rota sai da faixa marrom por ele (x 24 no celular).
 * Só o pão leva frase (FRASE_CATEGORIA): a Home não depende da lista de exemplos.
 */
import { computed } from 'vue'
import BlocoRota from '@/components/rota/BlocoRota.vue'
import FotoReal from '@/components/marca/FotoReal.vue'
import { CATEGORIAS, FRASE_CATEGORIA } from '@/data/categorias'
import { ATALHOS } from '@/data/atalhosWhatsapp'
import { linkWhatsApp } from '@/lib/whatsapp'
import { avisarWhatsappPendente } from '@/composables/useAvisoWhatsapp'
import { PRODUTOS as P } from './conteudo'

const [destaque, ...resto] = CATEGORIAS
const filtro = (c) => ({ path: '/produtos', query: { categoria: c.chave } })
// destaque: colunas 1–5 (459 px a partir de 1200), 4 colunas da grade de 8 no tablet, a tela inteira no celular
const SIZES_DESTAQUE = '(min-width: 1200px) 459px, (min-width: 1024px) calc(41.7vw - 41px), (min-width: 768px) calc(50vw - 44px), 100vw'
// miniatura quadrada com a foto 4:3 em cover: a largura que a foto ocupa é a altura × 4/3 (112 → 150, 88 → 118)
const SIZES_MINI = '(min-width: 1024px) 150px, 118px'
const orcamento = computed(() => linkWhatsApp(ATALHOS.orcamento('todas')))

// número pendente (prévia sem cadastro): o mesmo aviso do BotaoMarca, no lugar de abrir o WhatsApp
function aoClicarOrcamento(e) {
  if (!orcamento.value.pendente) return
  e.preventDefault()
  avisarWhatsappPendente(orcamento.value.texto)
}
</script>

<template>
  <BlocoRota tom="creme" class="fc-vp" :pad="{ topo: 'var(--fc-respiro-rota)', base: 'var(--fc-secao-home)' }" rotulado="produtos-titulo">
    <div class="fc-g fc-vp__g">
      <h2 id="produtos-titulo" class="fc-h2 fc-vp__titulo">{{ P.titulo }}</h2>
      <p class="fc-vp__todos">
        <router-link :to="P.todos.to" class="fc-link fc-link--acao">{{ P.todos.rotulo }}</router-link>
      </p>
      <router-link :to="filtro(destaque)" class="fc-vp__destaque">
        <FotoReal class="fc-vp__foto" :chave="destaque.foto" proporcao="4:3" :sizes="SIZES_DESTAQUE" decorativa />
        <h3 class="fc-h3 fc-vp__nome fc-vp__nome--destaque">{{ destaque.titulo }}</h3>
        <p class="fc-corpo fc-vp__frase">{{ FRASE_CATEGORIA[destaque.chave] }}</p>
      </router-link>
      <ul class="fc-vp__lista">
        <li v-for="c in resto" :key="c.chave">
          <router-link :to="filtro(c)" class="fc-vp__cat">
            <FotoReal class="fc-vp__mini" :chave="c.foto" proporcao="1:1" :sizes="SIZES_MINI" decorativa />
            <h3 class="fc-h3 fc-vp__nome">{{ c.titulo }}</h3>
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
.fc-vp__destaque, .fc-vp__cat { color: inherit; text-decoration: none; }
.fc-vp__destaque { display: block; margin-top: 24px; }
/* celular: a foto do destaque sangra as duas bordas */
.fc-vp__foto { margin-inline: calc(var(--gut) * -1); }
.fc-vp__nome { font-size: var(--fc-fs-h3); }
.fc-vp__nome--destaque { margin-top: 16px; }
.fc-vp__frase { margin-top: 4px; }
.fc-vp__lista { list-style: none; margin: 24px 0 0; padding: 0; }
.fc-vp__lista li + li { border-top: 1px solid var(--fc-linha); }
.fc-vp__cat { display: flex; align-items: center; gap: 20px; padding: 16px 0; }
.fc-vp__mini { flex: none; width: 88px; }
@media (hover: hover) and (pointer: fine) {
  .fc-vp__destaque:hover .fc-vp__nome, .fc-vp__cat:hover .fc-vp__nome { text-decoration: underline; text-underline-offset: 6px; text-decoration-thickness: 2px; }
}
.fc-vp__orc { margin-top: 32px; }
.fc-vp__orc-btn { padding: 0; border: 0; background: none; cursor: pointer; font-weight: inherit; }
@media (min-width: 768px) {
  .fc-vp__destaque { grid-column: 2 / 6; grid-row: 3; }
  .fc-vp__foto { margin-inline: 0; }
  .fc-vp__lista { grid-column: 6 / 10; grid-row: 3; align-self: center; margin-top: 24px; }
  .fc-vp__orc { grid-row: 4; }
}
@media (min-width: 1024px) {
  .fc-vp__titulo { grid-column: 2 / 7; grid-row: 1; }
  .fc-vp__todos { grid-column: 9 / 14; grid-row: 1; justify-self: end; align-self: end; margin-top: 0; }
  .fc-vp__destaque { grid-column: 2 / 7; grid-row: 2; margin-top: 40px; }
  .fc-vp__lista { grid-column: 9 / 14; grid-row: 2; margin-top: 40px; }
  .fc-vp__cat { gap: 24px; padding: 20px 0; }
  .fc-vp__mini { width: 112px; }
  .fc-vp__orc { grid-column: 2 / 14; grid-row: 3; margin-top: 40px; }
}
</style>
