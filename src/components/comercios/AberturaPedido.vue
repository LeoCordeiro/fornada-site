<script setup>
/**
 * 1ª tela de Para comércios. Bloco creme com a grade de
 * 3 IRMÃOS — título · cartão do FormPedido · apoio — para que no celular a ordem seja título → formulário → apoio
 * (nada entre o lead e o 1º campo). No desktop o cartão ocupa as duas linhas de `max-content 1fr`: o apoio encosta
 * no título e acompanha a rolagem do formulário (sticky dentro da própria linha).
 * Entrada só no bloco do título (H1 0–400, lead 100–500); o formulário é estático e utilizável desde o 1º quadro.
 * Os textos de ajuda do formulário (#826853) só passam sobre #FAF5EA: o brilho dourado do bloco tem alcance fixo
 * de 600 px a partir do canto do título (não tinge os campos, por mais alto que o bloco fique) e o cartão ≥768 é creme liso.
 * Enviado: o cabeçalho do cartão sai e o estado de sucesso (H2 próprio) fica sozinho no cartão; volta no "Corrigir
 * dados" (eventos `enviado`/`corrigido` do FormPedido).
 */
import { nextTick, ref } from 'vue'
import BlocoRota from '@/components/rota/BlocoRota.vue'
import TresPontos from '@/components/marca/TresPontos.vue'
import FormPedido from '@/components/form/FormPedido.vue'
import { ABERTURA, APOIO, CARTAO } from './conteudo'

// rótulo partido no "·": cada lado nunca quebra por dentro (sem "REGIÃO" sozinha na 2ª linha)
const rotulo = ABERTURA.rotulo.split(' · ')

// o cabeçalho volta DEPOIS que o formulário focou o 1º campo e empurra o campo para baixo: focar() de novo centra o
// campo com o rótulo dele à vista (rolagem com o reduzir movimento lido na hora, no próprio formulário)
const form = ref(null)
const enviado = ref(false)
async function corrigido() {
  enviado.value = false
  await nextTick()
  form.value?.focar()
}
</script>

<template>
  <BlocoRota tom="creme" abre :brilho="{ forma: 'circle', pos: '0% 0%', alfa: 0.18, alcance: '600px' }" :pad="{ base: 96 }" rotulado="pc-titulo">
    <div class="fc-g pc1">
      <div class="pc1__titulo">
        <p class="fc-rot"><template v-for="(parte, i) in rotulo" :key="parte"><span class="pc1__inteiro">{{ parte }}{{ i < rotulo.length - 1 ? ' ·' : '' }}</span>{{ i < rotulo.length - 1 ? ' ' : '' }}</template></p>
        <h1 id="pc-titulo" class="fc-display fc-display--interna pc1__h1" data-fc-entrada="0">{{ ABERTURA.titulo.antes }}<em class="fc-leve">{{ ABERTURA.titulo.leve }}</em>{{ ABERTURA.titulo.depois }}</h1>
        <p class="fc-clg fc-txt fc-corpo pc1__lead" data-fc-entrada="1">{{ ABERTURA.lead }}</p>
      </div>

      <div :id="CARTAO.id" class="pc1__cartao">
        <div v-show="!enviado" class="pc1__cab">
          <p class="fc-rot">{{ CARTAO.rotulo }}</p>
          <h2 class="fc-h2 pc1__h2">{{ CARTAO.titulo }}</h2>
        </div>
        <FormPedido ref="form" class="pc1__form" :class="{ 'is-enviado': enviado }" @enviado="enviado = true" @corrigido="corrigido" />
      </div>

      <div class="pc1__apoio">
        <p class="fc-rot">{{ APOIO.rotulo }}</p>
        <ul class="pc1__lista">
          <li v-for="item in APOIO.itens" :key="item"><TresPontos tamanho="XS" orientacao="vertical" class="pc1__trio" />{{ item }}</li>
        </ul>
        <router-link :to="APOIO.link.to" class="fc-link fc-link--acao pc1__link">{{ APOIO.link.rotulo }}</router-link>
      </div>
    </div>
  </BlocoRota>
</template>

<style scoped>
/* celular: título → formulário (32 px) → apoio (32 px). Base do bloco 96 (da escala de espaços; o respiro da costura é 80): a
   costura de baixo sai 24 px abaixo do cartão e da sombra dele, e não 8. */
.pc1 { row-gap: 0; }
.pc1__inteiro { white-space: nowrap; }
.pc1__h1 { margin-top: 20px; text-wrap: balance; } /* 20 = rótulo → H1, como na AberturaPagina */
.pc1__lead { margin-top: 24px; }

/* cartão: no celular, a seção do formulário começa num fio (sem moldura: o campo usa a largura toda e o 1º campo sobe
   para a 1ª tela); ≥768 cartão creme liso com moldura de 1 px + sombra quente (só no claro) — raio 0, como todo bloco */
.pc1__cartao { min-width: 0; margin-top: 32px; padding-top: 24px; border-top: 1px solid var(--fc-fio); }
.pc1__h2 { margin-top: 8px; font-size: min(var(--fc-fs-h2), 40px); }
.pc1__form { margin-top: 16px; }
/* sucesso no lugar do formulário: sem o cabeçalho, o estado (H2 próprio) começa no topo do cartão */
.pc1__form.is-enviado { margin-top: 0; }

.pc1__apoio { display: grid; justify-items: start; margin-top: 32px; }
.pc1__lista { list-style: none; margin: 16px 0 0; padding: 0; width: 100%; border-top: 1px solid var(--fc-linha); }
.pc1__lista li {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px 0;
  border-bottom: 1px solid var(--fc-linha);
  font-weight: 500;
  font-size: var(--fc-fs-corpo);
  line-height: 1.4;
}
.pc1__trio { flex: none; }
.pc1__link { margin-top: 12px; }

@media (min-width: 768px) {
  .pc1__cartao { padding: 32px; border: 1px solid var(--fc-fio); background: var(--fc-creme); box-shadow: var(--fc-sombra-2); }
  .pc1__apoio { margin-top: 48px; }
  .pc1__form { margin-top: 24px; }
  /* o itálico ("sem correr atrás", 1× por página) não parte em duas linhas onde a coluna o comporta inteiro */
  .pc1__h1 em { white-space: nowrap; }
}
@media (min-width: 1024px) {
  .pc1 { grid-template-rows: max-content 1fr; align-items: start; }
  /* título nas cols 1–5 (24 px de folga até o cartão), cartão nas 6–12: largo o bastante para os rádios em 2 colunas;
     24 px de respiro no cartão: o miolo fica com 500 px (2 × 15rem + 8 = 488) */
  .pc1__titulo { grid-column: c-start / span 5; grid-row: 1; padding: 8px 24px 0 0; }
  .pc1__apoio { grid-column: c-start / span 4; grid-row: 2; margin-top: 48px; position: sticky; top: 32px; }
  .pc1__cartao { grid-column: 7 / c-end; grid-row: 1 / 3; margin-top: 0; padding: 24px; }
}
@media (min-width: 1280px) {
  /* título nas cols 1–6 (o itálico cabe inteiro a 72 px), cartão nas 7–12 com 32 px de respiro (miolo de 490 px) */
  .pc1__titulo { grid-column: c-start / span 6; }
  .pc1__cartao { grid-column: 8 / c-end; padding: 32px; }
}
</style>
