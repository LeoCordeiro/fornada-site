<script setup>
/**
 * O espaço da foto. As fotos moram no mapa único `src/data/fotos.js`: a página passa a `chave` e o componente
 * lê de lá o alt, a legenda, o briefing e os arquivos — trocar a foto de banco pela real é mexer só no mapa.
 * Com imagem: <picture> com WebP + JPEG de reserva, srcset/sizes e width/height reais (CLS 0); direção de arte por
 * largura (`imagens.desktop` ≥ 1024) com a proporção do quadro trocando no mesmo breakpoint da fonte, e um recorte
 * opcional para tela larga (`imagens.largo`, na media `mediaLargo`, antes do desktop). Nunca o componente de imagem
 * do Vuetify. Foto não anima.
 * `prioridade` (só a abertura da Início): eager + fetchpriority high — `true` sempre, ou a media em que a foto é o
 * LCP (fora dela fica lazy, como as outras, e não disputa banda com a fonte do H1 no celular).
 * `decorativa`: alt "" mesmo com alt no mapa — para a foto dentro de um link que já tem o nome do que ela mostra.
 * Sem imagem: na prévia, o espaço tracejado com o briefing "Foto real da Fornada — {descricao}" e a proporção; em
 * PRODUÇÃO não desenha nada — quem reserva espaço pergunta `fotoNoAr(chave)` (data/fotos) e fecha o layout.
 */
import { computed } from 'vue'
import { useTom } from '@/composables/useTom'
import { mostraFoto } from '@/config/site'
import { FOTOS, PROPORCOES } from '@/data/fotos'

const props = defineProps({
  chave: { type: String, required: true, validator: (v) => v in FOTOS },
  proporcao: { type: String, default: '4:3', validator: (v) => PROPORCOES.includes(v) },
  proporcaoTablet: { type: String, default: '', validator: (v) => !v || PROPORCOES.includes(v) }, // ≥ 768
  proporcaoDesktop: { type: String, default: '', validator: (v) => !v || PROPORCOES.includes(v) }, // ≥ 1024
  sizes: { type: String, default: '100vw' },
  sizesDesktop: { type: String, default: '' },
  mediaLargo: { type: String, default: '(min-width: 1860px)' }, // só com `imagens.largo` no mapa
  sizesLargo: { type: String, default: '' },
  prioridade: { type: [Boolean, String], default: false },
  decorativa: { type: Boolean, default: false },
  legendaFora: { type: Boolean, default: false }, // legenda embaixo, em `legenda` sobre o fundo (Início); senão a tarja
  tom: { type: String, default: '' },
})
const { escuro } = useTom(props)

const MEDIA_DESKTOP = '(min-width: 1024px)'
const entrada = computed(() => FOTOS[props.chave] ?? {})
const base = computed(() => entrada.value.imagens?.base ?? null)
const desktop = computed(() => entrada.value.imagens?.desktop ?? null)
const largo = computed(() => entrada.value.imagens?.largo ?? null)
const temImagem = computed(() => Boolean(base.value))
const existe = computed(() => mostraFoto(temImagem.value ? 'sim' : ''))
const descricao = computed(() => entrada.value.descricao ?? '')
const legenda = computed(() => entrada.value.legenda ?? '')
const alt = computed(() => (props.decorativa ? '' : entrada.value.alt ?? descricao.value)) // '' = decorativa
// avaliada uma vez: é a carga da página que importa (a da abertura é o LCP só no desktop)
const alta = typeof props.prioridade === 'string' ? typeof matchMedia === 'function' && matchMedia(props.prioridade).matches : props.prioridade

const ar = (p) => p.replace(':', ' / ')
const estilo = computed(() => {
  const s = { '--ar': ar(props.proporcao) }
  if (props.proporcaoTablet) s['--ar-t'] = ar(props.proporcaoTablet)
  if (props.proporcaoDesktop) s['--ar-d'] = ar(props.proporcaoDesktop)
  if (entrada.value.foco) s['--foco'] = entrada.value.foco
  return s
})
const rotuloProporcao = computed(() => [props.proporcao, props.proporcaoTablet && `${props.proporcaoTablet} a partir de 768 px`, props.proporcaoDesktop && `${props.proporcaoDesktop} a partir de 1024 px`].filter(Boolean).join(' · '))
</script>

<template>
  <figure v-if="existe" class="fc-foto" :class="temImagem ? 'fc-foto--real' : ['fc-foto--vazia', { 'fc-foto--escuro': escuro }]" :style="estilo">
    <template v-if="temImagem">
      <picture class="fc-foto__quadro">
        <template v-if="largo">
          <source :media="mediaLargo" type="image/webp" :srcset="largo.webp" :sizes="sizesLargo || sizesDesktop || sizes" :width="largo.w" :height="largo.h" />
          <source :media="mediaLargo" type="image/jpeg" :srcset="largo.jpg" :sizes="sizesLargo || sizesDesktop || sizes" :width="largo.w" :height="largo.h" />
        </template>
        <template v-if="desktop">
          <source :media="MEDIA_DESKTOP" type="image/webp" :srcset="desktop.webp" :sizes="sizesDesktop || sizes" :width="desktop.w" :height="desktop.h" />
          <source :media="MEDIA_DESKTOP" type="image/jpeg" :srcset="desktop.jpg" :sizes="sizesDesktop || sizes" :width="desktop.w" :height="desktop.h" />
        </template>
        <source type="image/webp" :srcset="base.webp" :sizes="sizes" :width="base.w" :height="base.h" />
        <img
          :src="base.src"
          :srcset="base.jpg"
          :sizes="sizes"
          :width="base.w"
          :height="base.h"
          :alt="alt"
          :loading="alta ? 'eager' : 'lazy'"
          :fetchpriority="alta ? 'high' : undefined"
          :decoding="alta ? undefined : 'async'"
        />
      </picture>
      <figcaption v-if="legenda" class="fc-foto__legenda fc-leg" :class="legendaFora ? 'fc-foto__legenda--fora' : 'fc-foto__legenda--tarja'">{{ legenda }}</figcaption>
    </template>
    <figcaption v-else class="fc-foto__briefing">
      <span class="fc-rot">Foto real da Fornada — {{ descricao }}</span>
      <span class="fc-leg">{{ rotuloProporcao }}</span>
    </figcaption>
  </figure>
</template>

<style>
.fc-foto { position: relative; margin: 0; min-width: 0; border-radius: 0; }
/* a proporção mora no quadro da imagem ou, sem imagem, no próprio espaço (o mínimo: o briefing nunca é cortado) */
.fc-foto__quadro, .fc-foto--vazia { aspect-ratio: var(--ar); }
@media (min-width: 768px) { .fc-foto__quadro, .fc-foto--vazia { aspect-ratio: var(--ar-t, var(--ar)); } }
@media (min-width: 1024px) { .fc-foto__quadro, .fc-foto--vazia { aspect-ratio: var(--ar-d, var(--ar-t, var(--ar))); } }
.fc-foto__quadro { display: block; overflow: hidden; }
.fc-foto__quadro img { width: 100%; height: 100%; object-fit: cover; object-position: var(--foco, 50% 50%); }
.fc-foto__legenda--tarja { position: absolute; left: 0; right: 0; bottom: 0; padding: 12px 16px; background: var(--fc-marrom-profundo); color: var(--fc-creme); }
.fc-foto__legenda--fora { margin-top: 12px; color: var(--fc-tinta-2, var(--fc-marrom-medio)); }
/* prévia sem foto: borda tracejada, o briefing e a proporção — nada mais */
.fc-foto--vazia {
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  padding: 20px;
  border: 1px dashed var(--fc-marrom-medio);
  background: var(--fc-creme-2);
  color: var(--fc-marrom);
}
.fc-foto--vazia.fc-foto--escuro { background: var(--fc-marrom); border-color: var(--fc-creme-2); color: var(--fc-creme-2); }
.fc-foto__briefing { display: flex; flex-direction: column; gap: 8px; }
.fc-foto__briefing .fc-rot { line-height: 1.5; }
</style>
