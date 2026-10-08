<script setup>
/**
 * 1ª tela de Seja produtor. Toda creme: o tema de campo
 * só existe sobre creme. Grade de 3 IRMÃOS — título · requisito · cartão do FormProdutor — na ordem do DOM: no
 * celular o requisito sanitário vem ANTES do formulário (título → requisito → formulário); no desktop o cartão ocupa
 * as duas linhas de `max-content 1fr` e o requisito encosta no título e acompanha a rolagem do formulário.
 * Requisito "explícito, cedo e visível" duas vezes: aqui (seção com título próprio, para quem navega por títulos, e o
 * selo-sanitario animado — o ÚNICO play da página, o "momento" dela), e como 1º campo do formulário (selo estático).
 * Selo: o Lottie só é liberado ~1,3 s depois da revelação. Até lá, o lugar mostra a MARCA do selo (o estático a
 * 16 %, CLS 0, sem buraco); o carimbo cai por cima dela com a cor inteira e, no pôster, a marca sai (o pôster é o mesmo
 * desenho). Sem animação (reduzir movimento, página já vista) ou com falha do Lottie, o estático aparece inteiro.
 * Entrada só no bloco do título; formulário estático e utilizável desde o 1º quadro.
 */
import { computed, nextTick, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import BlocoRota from '@/components/rota/BlocoRota.vue'
import SeloSanitario from '@/components/marca/SeloSanitario.vue'
import FormProdutor from '@/components/form/FormProdutor.vue'
import { reduzirAgora } from '@/lib/motion'
import { usePaginaVista } from '@/composables/useVisita'
import { ABERTURA, CARTAO, REQUISITO, REQUISITOS } from './conteudo'

const route = useRoute()
const router = useRouter()
const form = ref(null)
const vista = usePaginaVista() // página já vista nesta visita: o selo não toca, vai direto ao pôster

// "Ver todos os requisitos": a seção fica nesta mesma página. href real (#/seja-produtor#requisitos: abre em outra aba
// sem cair no 404) + clique que rola e foca o título da seção, sem empilhar histórico (armadilha 1).
const hrefRequisitos = computed(() => router.resolve({ path: route.path, hash: `#${REQUISITOS.id}` }).href)
function irParaRequisitos() {
  const secao = document.getElementById(REQUISITOS.id)
  if (!secao) return
  const alvo = secao.querySelector('h2') ?? secao
  if (!alvo.hasAttribute('tabindex')) alvo.setAttribute('tabindex', '-1')
  alvo.setAttribute('data-fc-alvo-foco', '') // título não é controle: sem anel de foco (base.css)
  window.scrollTo({ top: secao.getBoundingClientRect().top + window.scrollY - 16, behavior: reduzirAgora() ? 'instant' : 'smooth' })
  alvo.focus({ preventScroll: true })
}

// sucesso no lugar do formulário: o cabeçalho do cartão sai e volta no "Corrigir dados" (eventos do FormProdutor).
// Ele volta DEPOIS que o formulário focou o 1º campo e empurra o campo: focar() de novo centra o
// campo com a pergunta à vista
const enviado = ref(false)
async function corrigido() {
  enviado.value = false
  await nextTick()
  form.value?.focar()
}

/** "Preencher o cadastro" (fim da página): rola até o formulário e foca o 1º campo — a regularização. */
const focarFormulario = () => form.value?.focar()
defineExpose({ focarFormulario })
</script>

<template>
  <BlocoRota tom="creme" abre :brilho="{ forma: 'circle', pos: '0% 0%', alfa: 0.18, alcance: '600px' }" rotulado="sp-titulo">
    <div class="fc-g sp1">
      <div class="sp1__titulo">
        <p class="fc-rot">{{ ABERTURA.rotulo }}</p>
        <h1 id="sp-titulo" class="fc-display fc-display--interna sp1__h1" data-fc-entrada="0">{{ ABERTURA.titulo.antes }}<em class="fc-leve">{{ ABERTURA.titulo.leve }}</em></h1>
        <p class="fc-clg fc-txt fc-corpo sp1__lead" data-fc-entrada="1">{{ ABERTURA.lead }}</p>
      </div>

      <!-- data-fc-fab-evita: o botão fixo sai de cena enquanto o requisito passa no canto dele — a 360/375 ele
           cobria o fim da frase e o link -->
      <section class="sp1__requisito" aria-labelledby="sp-requisito" data-fc-fab-evita>
        <div class="sp1__selo" :class="{ 'is-inteiro': vista }">
          <SeloSanitario class="sp1__selo-marca" variante="estatico" tamanho="medio" />
          <SeloSanitario class="sp1__selo-anim" variante="animado" tamanho="medio" />
        </div>
        <div class="sp1__req-texto">
          <p class="fc-rot">{{ REQUISITO.rotulo }}</p>
          <h2 id="sp-requisito" class="fc-h3 sp1__frase">{{ REQUISITO.frase }}</h2>
          <p class="fc-txt fc-corpo sp1__req-sub">{{ REQUISITO.texto }}</p>
          <a :href="hrefRequisitos" class="fc-link fc-link--acao sp1__link" @click.prevent="irParaRequisitos">{{ REQUISITO.link }}</a>
        </div>
      </section>

      <div :id="CARTAO.id" class="sp1__cartao">
        <div v-show="!enviado" class="sp1__cab">
          <p class="fc-rot">{{ CARTAO.rotulo }}</p>
          <h2 class="fc-h2 sp1__h2">{{ CARTAO.titulo }}</h2>
        </div>
        <FormProdutor ref="form" class="sp1__form" :class="{ 'is-enviado': enviado }" @enviado="enviado = true" @corrigido="corrigido" />
      </div>
    </div>
  </BlocoRota>
</template>

<style scoped>
.sp1 { row-gap: 32px; }
.sp1__h1 { margin-top: 20px; text-wrap: balance; } /* 20 = rótulo → H1, como na AberturaPagina */
/* o itálico ("A gente tem a rota.", 1× por página) não parte em duas linhas a partir de 360 (cabe inteiro a 40 px);
   a 320 ele passaria 13 px da coluna, então ali pode quebrar */
@media (min-width: 360px) { .sp1__h1 em { white-space: nowrap; } }
.sp1__lead { margin-top: 24px; }

/* requisito: o selo "carimba" ao lado do título; fio marrom em cima como numa ficha de exigência (peça única desta tela) */
.sp1__requisito {
  display: grid;
  grid-template-columns: auto minmax(0, 1fr);
  column-gap: 16px;
  align-items: start;
  padding-top: 24px;
  border-top: 2px solid var(--fc-marrom);
}
/* selo médio (80 px no celular, 112 ≥1024): o animado fica exatamente sobre a marca */
.sp1__selo { position: relative; }
.sp1__selo-anim { position: absolute; inset: 0; }
.sp1__selo-marca { opacity: .16; }
.sp1__selo.is-inteiro .sp1__selo-marca { opacity: 1; }
@media (prefers-reduced-motion: reduce) { .sp1__selo-marca { opacity: 1; } }
/* depois do carimbo (pôster) a marca sai: o pôster é o mesmo desenho e as duas camadas não coincidem pixel a pixel */
.sp1__selo:has([data-lottie-estado="poster"]) .sp1__selo-marca { opacity: 0; }
/* o Lottie não veio: o estático é o selo */
.sp1__selo:has([data-lottie-estado="falha"]) .sp1__selo-marca { opacity: 1; }

.sp1__req-texto { display: grid; justify-items: start; }
.sp1__frase { margin-top: 12px; text-wrap: balance; }
.sp1__req-sub { margin-top: 12px; }
.sp1__link { margin-top: 8px; }

/* cartão: o mesmo do pedido (celular: fio em cima, sem moldura; ≥768 creme liso, moldura + sombra quente; raio 0) */
.sp1__cartao { min-width: 0; padding-top: 24px; border-top: 1px solid var(--fc-fio); }
.sp1__h2 { margin-top: 8px; font-size: min(var(--fc-fs-h2), 40px); }
.sp1__form { margin-top: 16px; }
/* sucesso no lugar do formulário: sem o cabeçalho, o estado (H2 próprio) começa no topo do cartão */
.sp1__form.is-enviado { margin-top: 0; }

@media (min-width: 768px) {
  .sp1__cartao { padding: 32px; border: 1px solid var(--fc-fio); background: var(--fc-creme); box-shadow: var(--fc-sombra-2); }
  .sp1__form { margin-top: 24px; }
  .sp1__requisito { column-gap: 24px; }
}
@media (min-width: 1024px) {
  /* título e requisito nas cols 1–6: "A gente tem a rota." inteiro pede ~400 px a 53 px (1024) e ~520 a 72 px (1440) —
     com 5 colunas ele saía da coluna a 1024. Cartão nas 7–12; a 1024 as caixas de "O que você produz" ficam numa
     coluna (miolo de 418 px), a partir de 1280 voltam a 2 (miolo de 490 px, 2 × 15rem + 8 = 488) */
  .sp1 { grid-template-rows: max-content 1fr; row-gap: 0; align-items: start; }
  .sp1__titulo { grid-column: c-start / span 6; grid-row: 1; padding: 8px 24px 0 0; }
  .sp1__requisito { grid-column: c-start / span 6; grid-row: 2; margin: 48px 24px 0 0; position: sticky; top: 32px; }
  .sp1__cartao { grid-column: 8 / c-end; grid-row: 1 / 3; padding: 24px; }
}
@media (min-width: 1280px) {
  .sp1__cartao { padding: 32px; }
}
</style>
