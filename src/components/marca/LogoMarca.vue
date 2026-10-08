<script setup>
/**
 * Logo horizontal OFICIAL em <img>, recortada por contêiner: o arquivo tem margem grande (viewBox 760×300,
 * conteúdo em x 44–624, y 62–238). Nunca redesenhar — só os arquivos de assets/logo/ (versões sem fundo).
 *   ≥1024: caixa 174×53, <img> 228×90, margem −19/−13 · abaixo: caixa 132×40, <img> 173×68, margem −14/−10
 * O recorte é um <span> dentro do alvo: o link tem no mínimo 44 px de altura sem mudar o desenho.
 */
import logo from '@logo/fornada-conecta-horizontal-transparente.svg'
import logoInvertida from '@logo/fornada-conecta-horizontal-invertido-transparente.svg'

defineProps({
  invertida: { type: Boolean, default: false },
  to: { type: [String, Object], default: '/' }, // null = sem link (ex.: rodapé)
})
// alt fixo: "Fornada Conecta — início" com link, "Fornada Conecta" sem
</script>

<template>
  <router-link v-if="to" :to="to" class="fc-logo fc-logo--link" :class="{ 'fc-logo--invertida': invertida }">
    <span class="fc-logo__recorte"><img :src="invertida ? logoInvertida : logo" alt="Fornada Conecta — início" width="228" height="90" /></span>
  </router-link>
  <span v-else class="fc-logo" :class="{ 'fc-logo--invertida': invertida }">
    <span class="fc-logo__recorte"><img :src="invertida ? logoInvertida : logo" alt="Fornada Conecta" width="228" height="90" /></span>
  </span>
</template>

<style>
.fc-logo { display: block; flex: none; width: max-content; }
.fc-logo--link { display: grid; align-items: center; min-height: 44px; } /* alvo ≥ 44 px */
.fc-logo__recorte { display: block; width: 132px; height: 40px; overflow: hidden; }
.fc-logo__recorte img { display: block; width: 173px; height: 68px; max-width: none; margin: -14px 0 0 -10px; }
@media (min-width: 1024px) {
  .fc-logo__recorte { width: 174px; height: 53px; }
  .fc-logo__recorte img { width: 228px; height: 90px; margin: -19px 0 0 -13px; }
}
</style>
