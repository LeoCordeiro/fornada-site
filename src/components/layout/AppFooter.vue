<script setup>
/**
 * Rodapé marrom-profundo: 4 grupos — marca · navegação · fale com a gente · legal.
 * Costura no topo com halo = tom do ÚLTIMO bloco da página (descoberto sozinho; a página pode fixar com useRodape).
 * WhatsApp/e-mail pendentes: "[a preencher]" sem link na prévia; e-mail some enquanto pendente. "Sem cookies e sem
 * rastreadores" só depois de conferir isso na URL publicada (SITE.medicaoPrivacidadeOk).
 * Instagram e Reclame Aqui: links externos (nova aba, noopener noreferrer), nome acessível com o nome do serviço; o
 * ícone do Instagram é o do @mdi/js (decorativo), o Reclame Aqui é texto — nada da marca deles copiado.
 */
import { computed, nextTick, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import BlocoRota from '@/components/rota/BlocoRota.vue'
import LogoMarca from '@/components/marca/LogoMarca.vue'
import FichaEmpresa from '@/components/secoes/FichaEmpresa.vue'
import { NAV_LEGAL, NAV_RODAPE } from '@/data/navegacao'
import { ATALHOS, nomeDaPagina } from '@/data/atalhosWhatsapp'
import { emailPendente, SITE, TEXTO_PENDENTE, whatsappPendente } from '@/config/site'
import { formatarNumeroEmpresa, linkWhatsApp } from '@/lib/whatsapp'
import { pedidoDoRodape } from '@/composables/useRodape'
import { mdiInstagram } from '@mdi/js'

const route = useRoute()
const ano = new Date().getFullYear()
const whats = computed(() => linkWhatsApp(ATALHOS.falar(nomeDaPagina(route.path))))
const numero = formatarNumeroEmpresa()

// halo da costura = tom do último BlocoRota de 1º nível dentro do <main>
const tomDetectado = ref('creme')
function detectar() {
  const blocos = [...document.querySelectorAll('#conteudo [data-fc-tom]')].filter((el) => !el.parentElement?.closest('[data-fc-tom]'))
  tomDetectado.value = blocos.at(-1)?.dataset.fcTom ?? 'creme'
}
watch(() => route.path, () => nextTick(() => requestAnimationFrame(detectar)), { immediate: true })
window.addEventListener('fc:pagina-revelada', detectar)

const costura = computed(() => ({
  coluna: pedidoDoRodape.coluna ?? 9,
  colunaTablet: pedidoDoRodape.colunaTablet, // null = o RotaDivisa deduz da coluna do desktop
  halo: pedidoDoRodape.tom ?? tomDetectado.value,
}))
</script>

<template>
  <BlocoRota tag="footer" tom="profundo" :costura="costura" :pad="{ topo: 'var(--fc-respiro-rodape)', base: 48 }" class="fc-rodape">
    <div class="fc-wrap fc-rodape__grade">
      <div class="fc-rodape__marca">
        <LogoMarca invertida :to="null" />
        <p class="fc-rodape__frase">Central de abastecimento de panificação para o comércio de Guarulhos e região.</p>
      </div>

      <nav class="fc-rodape__nav" aria-label="Rodapé">
        <ul>
          <li v-for="item in NAV_RODAPE" :key="item.to">
            <router-link :to="item.to" class="fc-rodape__link">{{ item.rotulo }}</router-link>
          </li>
        </ul>
      </nav>

      <div class="fc-rodape__contato">
        <p class="fc-rot fc-rodape__rotulo">Fale com a gente</p>
        <ul>
          <li>
            <span class="fc-rodape__chave">WhatsApp</span>
            <a v-if="!whatsappPendente && whats.url" :href="whats.url" target="_blank" rel="noopener noreferrer" class="fc-rodape__link fc-tab" data-fc-whatsapp>{{ numero }}</a>
            <span v-else class="fc-rodape__pendente">{{ TEXTO_PENDENTE }}</span>
          </li>
          <li v-if="!emailPendente">
            <span class="fc-rodape__chave">E-mail</span>
            <a :href="`mailto:${SITE.email}`" class="fc-rodape__link">{{ SITE.email }}</a>
          </li>
          <li>
            <a :href="SITE.instagram" target="_blank" rel="noopener noreferrer" class="fc-rodape__link fc-rodape__externo" :aria-label="`Instagram da Fornada Conecta: ${SITE.instagramUsuario}`">
              <svg class="fc-rodape__icone" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path :d="mdiInstagram" /></svg>{{ SITE.instagramUsuario }}
            </a>
          </li>
          <li>
            <a :href="SITE.reclameAqui" target="_blank" rel="noopener noreferrer" class="fc-rodape__link" aria-label="Fornada Conecta no Reclame Aqui">Reclame Aqui</a>
          </li>
          <li>{{ SITE.bairro }} · {{ SITE.cidade }}/{{ SITE.uf }}</li>
          <li>Entrega em Guarulhos e região</li>
        </ul>
      </div>

      <div class="fc-rodape__legal">
        <FichaEmpresa compacta />
        <p v-if="SITE.medicaoPrivacidadeOk" class="fc-leg">Sem cookies e sem rastreadores</p>
        <p class="fc-leg fc-rodape__legais">
          <template v-for="(item, i) in NAV_LEGAL" :key="item.to">
            <span v-if="i" aria-hidden="true"> · </span>
            <router-link :to="item.to" class="fc-rodape__link">{{ item.rotulo }}</router-link>
          </template>
        </p>
        <p class="fc-leg fc-tab">© {{ ano }} Fornada Conecta</p>
      </div>
    </div>
  </BlocoRota>
</template>

<style>
.fc-rodape { color: var(--fc-creme); }
.fc-rodape__grade { display: grid; gap: 40px; }
.fc-rodape__frase { margin-top: 16px; max-width: 36ch; color: var(--fc-creme-2); }
.fc-rodape ul { list-style: none; margin: 0; padding: 0; }
.fc-rodape__nav li, .fc-rodape__contato li { min-height: 44px; display: flex; flex-wrap: wrap; align-items: center; column-gap: 8px; }
.fc-rodape__link { color: var(--fc-creme); text-decoration: underline; text-decoration-thickness: 1px; text-underline-offset: 4px; display: inline-flex; align-items: center; min-height: 44px; }
@media (hover: hover) and (pointer: fine) { .fc-rodape__link:hover { text-decoration-thickness: 2px; } }
/* rótulo dourado caixa alta ≥ 12 px: permitido só sobre marrom-profundo (contraste 6,25) */
.fc-rodape__rotulo { color: var(--fc-dourado); margin-bottom: 8px; }
.fc-rodape__contato { color: var(--fc-creme-2); }
.fc-rodape__chave { font-weight: 500; color: var(--fc-creme); }
.fc-rodape__externo { gap: 8px; }
.fc-rodape__icone { width: 20px; height: 20px; flex: none; fill: currentColor; }
.fc-rodape__pendente { color: var(--fc-creme-2); }
.fc-rodape__legal { display: grid; gap: 8px; color: var(--fc-creme-2); border-top: 1px solid var(--fc-marrom); padding-top: 24px; }
.fc-rodape__legal .fc-ficha { color: var(--fc-creme-2); }
.fc-rodape__legais .fc-rodape__link { min-height: 44px; }
@media (max-width: 767px) { .fc-rodape.fc-bloco { padding-bottom: 104px; } } /* o botão fixo não cobre o "©" */
@media (min-width: 768px) {
  .fc-rodape__grade { grid-template-columns: repeat(2, minmax(0, 1fr)); column-gap: var(--gap); }
  .fc-rodape__legal { grid-column: 1 / -1; }
}
@media (min-width: 1024px) {
  .fc-rodape__grade { grid-template-columns: minmax(0, 1.3fr) minmax(0, 1fr) minmax(0, 1fr); }
}
</style>
