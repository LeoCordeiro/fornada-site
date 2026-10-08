<script setup>
/**
 * Dados públicos da empresa: razão social, "CNPJ 68.998.077/0001-36" em
 * algarismos tabulares e "Parque Uirapuru · Guarulhos/SP". Os dados vêm de SITE (config/site.js), nunca digitados
 * na página. `compacta` = linha única do rodapé ("Fornada Conecta · razão social · CNPJ …").
 * `nome` = quem assina a ficha: 'razao' (padrão, a linha legal do rodapé) | 'marca' ("Fornada Conecta" no lugar da
 * razão social — no Sobre e no Contato: a razão social traz o nome do titular e já está na linha do rodapé).
 * Compacta com a marca: "Fornada Conecta · CNPJ …".
 */
import { SITE } from '@/config/site'

defineProps({
  compacta: { type: Boolean, default: false },
  nome: { type: String, default: 'razao', validator: (v) => ['razao', 'marca'].includes(v) },
})
</script>

<template>
  <p v-if="compacta" class="fc-ficha fc-ficha--compacta fc-tab">
    <span>{{ SITE.marca }}</span><template v-if="nome === 'razao'"><span aria-hidden="true"> · </span><span>{{ SITE.razaoSocial }}</span></template><span aria-hidden="true"> · </span><span class="fc-ficha__cnpj">CNPJ {{ SITE.cnpj }}</span>
  </p>
  <div v-else class="fc-ficha fc-tab">
    <p class="fc-ficha__linha">{{ nome === 'marca' ? SITE.marca : SITE.razaoSocial }}</p>
    <p class="fc-ficha__linha">CNPJ {{ SITE.cnpj }}</p>
    <p class="fc-ficha__linha">{{ SITE.bairro }} · {{ SITE.cidade }}/{{ SITE.uf }}</p>
  </div>
</template>

<style>
.fc-ficha { font-weight: 500; }
.fc-ficha--compacta { font-size: var(--fc-fs-legenda); line-height: 1.6; }
.fc-ficha__cnpj { white-space: nowrap; }
.fc-ficha__linha { line-height: 1.6; }
</style>
