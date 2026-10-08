<script setup>
/**
 * Como funciona `/como-funciona`. Ordem: abertura [C] com os atalhos
 * "Tenho um comércio"/"Tenho forno" → trilha do comércio [M] (os 4 passos em ordem, id `trilha-comercio`) → trilha do
 * produtor [C] (id `trilha-produtor`) → FAQ [C] (id `faq`) → chamada final [M] com o mesmo texto da Home.
 * Costuras (celular: x 24, a faixa da rota das duas trilhas): abertura → trilha do comércio na col 11 (fora do título
 * e dos atalhos); trilha do comércio → trilha do produtor na col 9 (fora do botão do comércio); FAQ → chamada final na
 * col 11 (fora da lista do FAQ e do botão dele); rodapé na col 9 (fora dos botões da chamada final). Todas passam no
 * respiro de 80 px dos dois lados da divisa.
 * Atalhos: clique rola até a trilha (instantâneo com reduzir movimento) e põe o foco no título dela, sem `href="#…"`
 * e sem mexer na URL.
 */
import AberturaPagina from '@/components/secoes/AberturaPagina.vue'
import TrilhaComercio from '@/components/como-funciona/TrilhaComercio.vue'
import SecaoFaq from '@/components/secoes/SecaoFaq.vue'
import CtaFinal from '@/components/secoes/CtaFinal.vue'
import BotaoMarca from '@/components/marca/BotaoMarca.vue'
import TrilhaProdutor from '@/components/como-funciona/TrilhaProdutor.vue'
import { ABERTURA, FAQ_SECAO, TRILHA_COMERCIO } from '@/components/como-funciona/conteudo'
import { FAQ } from '@/components/como-funciona/faq'
import { ATALHOS } from '@/data/atalhosWhatsapp'
import { CTA_COMERCIO } from '@/data/navegacao'
import { reduzirAgora } from '@/lib/motion'
import { useRodape } from '@/composables/useRodape'

useRodape({ coluna: 9 })

function irPara(id) {
  const secao = document.getElementById(id)
  if (!secao) return
  const titulo = secao.querySelector('h2') ?? secao
  window.scrollTo({ top: secao.getBoundingClientRect().top + window.scrollY - 16, behavior: reduzirAgora() ? 'instant' : 'smooth' })
  if (!titulo.hasAttribute('tabindex')) titulo.setAttribute('tabindex', '-1')
  titulo.setAttribute('data-fc-alvo-foco', '')
  titulo.focus({ preventScroll: true })
}
</script>

<template>
  <div class="como-funciona">
    <AberturaPagina :rotulo="ABERTURA.rotulo" :sub="ABERTURA.sub" :faixa-escura="false">
      <template #titulo>{{ ABERTURA.titulo.antes }}<span class="fc-leve">{{ ABERTURA.titulo.leve }}</span></template>
      <template #acoes>
        <BotaoMarca v-for="a in ABERTURA.atalhos" :key="a.alvo" variante="contorno" @click="irPara(a.alvo)">{{ a.rotulo }}</BotaoMarca>
      </template>
    </AberturaPagina>

    <TrilhaComercio id="trilha-comercio" id-titulo="trilha-comercio-titulo" :cabecalho="TRILHA_COMERCIO.cabecalho" :costura="{ coluna: 11, halo: 'creme' }">
      <template #rodape>
        <BotaoMarca variante="ouro" :to="CTA_COMERCIO.to">{{ TRILHA_COMERCIO.acao }}</BotaoMarca>
      </template>
    </TrilhaComercio>

    <TrilhaProdutor :costura="{ coluna: 9, halo: 'marrom' }" />

    <SecaoFaq id="faq" :rotulo="FAQ_SECAO.rotulo" :titulo="FAQ_SECAO.titulo" :itens="FAQ">
      <template #fim>
        <p class="fc-txt fc-corpo">{{ FAQ_SECAO.fim }}</p>
        <BotaoMarca variante="solido" :whatsapp="ATALHOS.duvidaFaq()">{{ FAQ_SECAO.acao }}</BotaoMarca>
      </template>
    </SecaoFaq>

    <CtaFinal tom="marrom" :costura="{ coluna: 11, halo: 'creme' }" />
  </div>
</template>
