<script setup>
/**
 * Início `/`: 5 seções num creme só, com uma faixa marrom —
 * abertura (texto | foto) · segurança alimentar (foto | selo e texto) · como funciona (a faixa marrom com a única rota
 * do conteúdo) · produtos (categorias em texto + 1 foto de processo) · as duas pontas (fim da página).
 * Fotos: mapa único em src/data/fotos.js (de banco só abertura, ambiente e processo; nunca produto).
 * A costura do rodapé desce no eixo da rota: centro da coluna 7 no desktop, da coluna 1 da grade de 8 no tablet (onde
 * corre a rota da faixa marrom e fica o ícone C+F) e x 24 no celular.
 * Entra no pacote inicial (router: homeEager) — é a página do LCP.
 */
import HeroFoto from '@/components/home/HeroFoto.vue'
import QualidadeFoto from '@/components/home/QualidadeFoto.vue'
import ComoFuncionaFio from '@/components/home/ComoFuncionaFio.vue'
import VitrineProdutos from '@/components/home/VitrineProdutos.vue'
import DuasPontas from '@/components/home/DuasPontas.vue'
import { useRodape } from '@/composables/useRodape'

useRodape({ tom: 'creme', coluna: 7, colunaTablet: 1 })
</script>

<template>
  <div class="fc-home">
    <HeroFoto />
    <QualidadeFoto />
    <ComoFuncionaFio />
    <VitrineProdutos />
    <DuasPontas />
  </div>
</template>
