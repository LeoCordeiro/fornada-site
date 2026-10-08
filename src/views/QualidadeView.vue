<script setup>
/**
 * Qualidade e segurança alimentar `/qualidade`. Ordem: abertura [C] (rótulo
 * + H1) ═◖═ posto partido [M | C] sem H2 próprio (aria-labelledby → H1; a rota desce da abertura até os 3 pontos do
 * selo invertido, que toca 1×; a foto da conferência na metade marrom, slot `marrom`) → exigências [C] → o padrão [M]
 * (rota acendendo por rolagem) → reclamações [C]
 * (4 paradas estáticas + aviso de saúde + "Avisar pelo WhatsApp") → responsabilidades [M | C] → chamada final [M].
 * Nenhum reveal genérico (página sobre confiança). Costuras (desktop/tablet): metade marrom do posto → exigências na
 * col 4 (só desktop: no celular o posto termina creme); exigências → padrão → reclamações no x
 * da faixa das paradas (centro dos arcos do padrão e das reclamações: a rota segue na mesma vertical); reclamações →
 * responsabilidades na col 12 (fora do aviso e do botão); metade marrom → frase na col 3; chamada final na col 11;
 * rodapé na col 9 (fora dos botões). Celular: x 24.
 */
import AberturaPagina from '@/components/secoes/AberturaPagina.vue'
import QualidadePosto from '@/components/secoes/QualidadePosto.vue'
import CtaFinal from '@/components/secoes/CtaFinal.vue'
import FotoReal from '@/components/marca/FotoReal.vue'
import Exigencias from '@/components/qualidade/Exigencias.vue'
import PadraoRota from '@/components/qualidade/PadraoRota.vue'
import Reclamacoes from '@/components/qualidade/Reclamacoes.vue'
import Responsabilidades from '@/components/qualidade/Responsabilidades.vue'
import { GARANTIAS, QUALIDADE_HOME } from '@/data/garantias'
import { useRodape } from '@/composables/useRodape'
import { fotoNoAr } from '@/data/fotos'
import { ABERTURA, CHAMADA } from '@/components/qualidade/conteudo'

useRodape({ coluna: 9 })
</script>

<template>
  <div class="qualidade">
    <AberturaPagina :rotulo="ABERTURA.rotulo" :faixa-escura="false" id-titulo="qualidade-h1">
      <template #titulo>{{ ABERTURA.titulo.antes }}<span class="fc-leve">{{ ABERTURA.titulo.leve }}</span>{{ ABERTURA.titulo.depois }}</template>
    </AberturaPagina>

    <!-- desktop: a foto da conferência fica na metade marrom, ao lado do selo — o posto equilibra sem o H2 -->
    <!-- itens em H2: o posto não tem título próprio (rotulado pelo H1), então H1 → H3 pulava um nível -->
    <QualidadePosto :sub="QUALIDADE_HOME.sub" :itens="GARANTIAS" :nota="QUALIDADE_HOME.nota" :nivel-itens="2" rotulado-por="qualidade-h1" halo-topo="creme">
      <template #marrom>
        <FotoReal class="qualidade__foto-larga" chave="qualidade-conferencia" proporcao="3:2" tom="marrom" />
      </template>
    </QualidadePosto>
    <!-- < 1024 o posto empilha (marrom em cima): a foto volta para depois da nota, no fim da metade creme, e o texto do
         posto não desce para baixo da dobra. Uma instância por largura; a escondida sai da árvore (display).
         Em produção sem foto de verdade o bloco não existe (fotoNoAr): a metade creme fecha na nota. -->
    <div v-if="fotoNoAr('qualidade-conferencia')" class="qualidade__foto-estreita fc-tom fc-tom--creme">
      <FotoReal chave="qualidade-conferencia" proporcao="3:2" tom="creme" />
    </div>

    <Exigencias :costura="{ coluna: 4, halo: 'marrom', somente: 'desktop' }" />
    <PadraoRota :costura="{ x: 'var(--qualidade-x-faixa)', halo: 'creme' }" />
    <Reclamacoes :costura="{ x: 'var(--qualidade-x-faixa)', halo: 'marrom' }" />
    <Responsabilidades :costura="{ coluna: 12, halo: 'creme' }" />
    <CtaFinal tom="marrom" rotulo="" texto="" :titulo="CHAMADA.titulo" id="qualidade-cta" :costura="{ coluna: 11, halo: 'creme' }" />
  </div>
</template>

<style scoped>
/* foto da conferência: na metade marrom do posto a partir de 1024; abaixo, logo depois da nota da metade creme. O bloco
   sobe por cima do respiro de baixo da metade creme (72 px no empilhado) e deixa 16 px depois da nota, o mesmo vão de
   nota → foto do corpo do posto. position: relative = pinta por cima da seção do posto, que é posicionada. */
.qualidade__foto-estreita {
  position: relative;
  margin-top: -56px;
  padding: 0 var(--gut) 72px;
  background: var(--fc-ruido-c), var(--fc-creme);
  background-color: var(--fc-creme);
}
@media (max-width: 1023px) { .qualidade__foto-larga { display: none; } }
@media (min-width: 1024px) { .qualidade__foto-estreita { display: none; } }
/* x da faixa das paradas (PadraoRota e ParadasRota começam na coluna 1 da grade): centro do arco de 48 (tablet) e 64
   (desktop). Abaixo de 768 a costura usa o x 24 padrão do celular. */
@media (min-width: 768px) { .qualidade { --qualidade-x-faixa: calc(var(--gut) + 24px); } }
@media (min-width: 1024px) { .qualidade { --qualidade-x-faixa: calc((100% - min(100%, var(--fc-wrap-max))) / 2 + var(--gut) + 32px); } }
/* o H1 display (line-height 1.02) tem caixa de texto maior que a linha: a rota que desce para o selo nasce acima da
   divisa; +8 px aqui para o 1º ponto não encostar no título (como na abertura das outras páginas internas) */
.qualidade :deep(.fc-abertura) { --fc-min-base: calc(var(--fc-respiro-rota) + 8px); }
</style>
