<script setup>
/**
 * Produtos `/produtos`. Ordem: abertura [C] → barra do filtro
 * [C] → faixas por categoria (tom fixo por categoria, costura a cada troca) → fim [M].
 * A URL é a fonte da verdade (`#/produtos?categoria=<slug>`): o clique faz router.replace (o voltar sai da página),
 * valor inválido normaliza para "Todos"; troca só de query não tem véu, não rola e não move o foco (router).
 * "Quero receber fornada" leva a categoria ativa ao formulário (`/para-comercios?produtos=<slug>`).
 * Vazio: categoria sem exemplo (quando o cliente confirmar que não faz uma linha). Para forçar em teste:
 * build `--mode teste` com VITE_CATEGORIA_VAZIA=<slug>[,<slug>] — fora do modo teste a expressão some do pacote.
 */
import { computed, nextTick, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import AberturaPagina from '@/components/secoes/AberturaPagina.vue'
import CabecalhoSecao from '@/components/secoes/CabecalhoSecao.vue'
import BlocoRota from '@/components/rota/BlocoRota.vue'
import BotaoMarca from '@/components/marca/BotaoMarca.vue'
import SeloSanitario from '@/components/marca/SeloSanitario.vue'
import FiltroCategorias from '@/components/produtos/FiltroCategorias.vue'
import ListaCategorias from '@/components/produtos/ListaCategorias.vue'
import { CATEGORIAS, SLUGS_CATEGORIA, categoriaPorSlug } from '@/data/categorias'
import { ATALHOS } from '@/data/atalhosWhatsapp'
import { CTA_COMERCIO } from '@/data/navegacao'
import { useRodape } from '@/composables/useRodape'
import { reduzirAgora } from '@/lib/motion'
import { ABERTURA, FIM, SEGURANCA, nomeNaMensagem } from '@/components/produtos/conteudo'
import { tomDaFaixa } from '@/components/produtos/faixas'

const VAZIAS = import.meta.env.MODE === 'teste' ? String(import.meta.env.VITE_CATEGORIA_VAZIA || '').split(',') : []
const categorias = CATEGORIAS.map((c) => (VAZIAS.includes(c.chave) ? { ...c, exemplos: [] } : c))

const route = useRoute()
const router = useRouter()

const slugValido = (s) => typeof s === 'string' && SLUGS_CATEGORIA.includes(s)
const ativa = computed(() => (slugValido(route.query.categoria) ? route.query.categoria : ''))

// valor inválido (ou repetido) → #/produtos com "Todos"
watch(
  () => route.query.categoria,
  (s) => {
    if (s !== undefined && !slugValido(s)) router.replace({ path: route.path, query: {} })
  },
  { immediate: true },
)

const trocou = ref(false)
watch(ativa, () => (trocou.value = true), { flush: 'pre' })

function escolher(slug) {
  if (slug === ativa.value) return Promise.resolve()
  return router.replace({ path: route.path, query: slug ? { categoria: slug } : {} })
}

// "Ver todas as categorias" some junto com o vazio: o foco passa para o "Todos", que é quem ficou ativo. Esse caminho
// não é troca de chip: no celular o botão fica abaixo da dobra e o chip, acima da tela — aí vale a regra: com o
// topo da lista acima da viewport, rolar até a barra de filtros, 16 px abaixo do topo.
const filtro = ref(null)
async function verTodas() {
  await escolher('')
  await nextTick()
  const barra = filtro.value?.$el
  const chip = barra?.querySelector('[aria-pressed="true"]')
  if (!chip) return
  if (chip.getBoundingClientRect().top < 0) {
    window.scrollTo({ top: barra.getBoundingClientRect().top + window.scrollY - 16, behavior: reduzirAgora() ? 'instant' : 'smooth' })
  }
  chip.focus({ preventScroll: true })
}

// "Todos" mostra só o que tem exemplo; categoria escolhida sem exemplo → vazio
const comExemplo = categorias.filter((c) => c.exemplos?.length)
const visiveis = computed(() => (ativa.value ? comExemplo.filter((c) => c.chave === ativa.value) : comExemplo))
const vazia = computed(() => (ativa.value && !visiveis.value.length ? categoriaPorSlug(ativa.value) : null))

// fim marrom: costura quando o que vem antes é creme (faixa creme ou o vazio, que é creme)
const tomUltimo = computed(() => (vazia.value || !visiveis.value.length ? 'creme' : tomDaFaixa(categorias, visiveis.value.at(-1))))
const costuraFim = computed(() => (tomUltimo.value === 'creme' ? { coluna: 3, halo: 'creme' } : null))

const categoriaAtiva = computed(() => (ativa.value ? categoriaPorSlug(ativa.value) : null))
const destinoPedido = computed(() => (ativa.value ? { path: CTA_COMERCIO.to, query: { produtos: ativa.value } } : CTA_COMERCIO.to))
const mensagemOrcamento = computed(() => ATALHOS.orcamento(nomeNaMensagem(categoriaAtiva.value)))

useRodape({ coluna: 12 }) // rodapé fora dos dois botões do fim (cols 5–11)
</script>

<template>
  <div class="produtos">
    <!-- a barra do filtro mora no mesmo bloco creme da abertura (slot `extra`): sem emenda no brilho do fundo -->
    <AberturaPagina :rotulo="ABERTURA.rotulo" :sub="ABERTURA.sub" :faixa-escura="false">
      <template #titulo>{{ ABERTURA.titulo.antes }}<span class="fc-leve">{{ ABERTURA.titulo.leve }}</span>{{ ABERTURA.titulo.depois }}</template>
      <template #extra>
        <FiltroCategorias ref="filtro" class="produtos__filtro" :categorias="categorias" :ativa="ativa" :vazia="!!vazia" @escolher="escolher" />
      </template>
    </AberturaPagina>

    <ListaCategorias :todas="categorias" :visiveis="visiveis" :vazia="vazia" :trocou="trocou" :respiro-fim="!!costuraFim" @ver-todas="verTodas" />

    <BlocoRota tom="marrom" :costura="costuraFim" rotulado="produtos-fim-titulo" class="produtos__fim">
      <div class="fc-g">
        <div class="produtos__fim-corpo">
          <CabecalhoSecao id="produtos-fim-titulo" :rotulo="FIM.rotulo" :titulo="FIM.titulo" :sub="FIM.texto" />
          <!-- a política da rede antes do pedido: selo estático, sem player — a página continua sem Lottie -->
          <SeloSanitario class="produtos__seguranca" variante="estatico" tamanho="compacto">
            <div class="produtos__seguranca-texto">
              <p class="fc-txt fc-corpo">{{ SEGURANCA.texto }}</p>
              <router-link :to="SEGURANCA.link.to" class="fc-link fc-link--acao">{{ SEGURANCA.link.rotulo }}</router-link>
            </div>
          </SeloSanitario>
          <div class="produtos__acoes">
            <BotaoMarca variante="ouro" :to="destinoPedido">{{ FIM.pedir }}</BotaoMarca>
            <BotaoMarca variante="contorno" :whatsapp="mensagemOrcamento">{{ FIM.orcamento }}</BotaoMarca>
          </div>
        </div>
      </div>
    </BlocoRota>
  </div>
</template>

<style scoped>
/* celular: a barra fica 16 px abaixo do sub — com a faixa de prévia de 3 linhas (73 px a 375) o chip da 1ª linha
   descia para 86 px do pé de uma tela de 667, dentro do scroll-padding de 96 do celular (o clique rolava a página) */
.produtos__filtro { margin-top: 16px; }
.produtos__seguranca { margin-top: 28px; }
.produtos__seguranca-texto { display: grid; justify-items: start; gap: 4px; }
.produtos__acoes { display: flex; flex-wrap: wrap; align-items: flex-start; gap: 16px; margin-top: 32px; }
@media (min-width: 1024px) {
  .produtos__filtro { margin-top: 48px; }
  .produtos__fim-corpo { grid-column: 5 / 12; }
}
</style>
