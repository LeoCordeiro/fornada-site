<script setup>
/**
 * Contato `/contato`:
 *  1ª tela partida — [creme] rótulo, H1, sub | [marrom] painel de canais em linhas com fio (WhatsApp com o botão
 *  dourado, e-mail só quando definido, onde fica, área de entrega). O painel começa abaixo do cabeçalho (que é creme e
 *  absoluto) e sangra até a borda direita; no celular empilha com costura. → [creme] atalhos + FichaEmpresa.
 * Costuras (x sem texto em volta): desktop — horizontal sobre a divisa vertical, na altura do 1º canal (a rota
 * chega ao WhatsApp); painel → atalhos na coluna 12 (só existe divisa do lado marrom); rodapé na coluna 6, o vão entre
 * as duas metades dos atalhos. Celular: x 24.
 * Sem Lottie e sem mapa (área de entrega não definida; mapa = host de terceiro). Contato pendente: "[a preencher]"
 * sem link (prévia); e-mail some enquanto pendente ([hidden] vence classe de display — base.css), sem mailto.
 */
import BlocoRota from '@/components/rota/BlocoRota.vue'
import RotaDivisa from '@/components/rota/RotaDivisa.vue'
import BotaoMarca from '@/components/marca/BotaoMarca.vue'
import FichaEmpresa from '@/components/secoes/FichaEmpresa.vue'
import { useRodape } from '@/composables/useRodape'
import { emailPendente, SITE, TEXTO_PENDENTE, whatsappPendente } from '@/config/site'
import { formatarNumeroEmpresa } from '@/lib/whatsapp'
import { mdiInstagram } from '@mdi/js'
import { CTA_COMERCIO, CTA_PRODUTOR } from '@/data/navegacao'
import { ABERTURA, ATALHOS_CONTATO as A, CANAIS as C } from '@/components/contato/conteudo'

useRodape({ coluna: 6 })
const numero = whatsappPendente ? TEXTO_PENDENTE : formatarNumeroEmpresa()
</script>

<template>
  <div class="ct">
    <BlocoRota tom="creme" abre :pad="{ base: 0 }" :brilho="{ forma: 'circle', pos: '8% 0%', alfa: 0.18, alcance: '55%' }">
      <div class="ct-tela">
        <div class="fc-g">
          <div class="ct-intro">
            <p class="fc-rot">{{ ABERTURA.rotulo }}</p>
            <h1 class="fc-display fc-display--interna ct-intro__titulo" data-fc-entrada="0">
              {{ ABERTURA.titulo.forte }} <em class="fc-leve">{{ ABERTURA.titulo.leve }}</em>{{ ABERTURA.titulo.fim }}
            </h1>
            <p class="fc-clg fc-txt fc-corpo ct-intro__sub" data-fc-entrada="1">
              {{ ABERTURA.sub }}<template v-if="!emailPendente"> {{ ABERTURA.subEmail }}</template>
            </p>
          </div>

          <div class="ct-canais fc-tom fc-tom--marrom">
            <RotaDivisa somente="celular" halo="creme" />
            <RotaDivisa somente="desktop" orientacao="horizontal" x="0px" y="var(--ct-y-costura)" halo="creme" />
            <dl class="ct-canais__lista" data-fc-entrada="1">
              <div class="ct-canal">
                <dt class="fc-rot ct-canal__rotulo">{{ C.whatsapp.rotulo }}</dt>
                <dd class="fc-h3 fc-tab ct-canal__valor">{{ numero }}</dd>
                <dd class="ct-canal__acao">
                  <BotaoMarca variante="ouro" tom="marrom" :whatsapp="C.whatsapp.mensagem">{{ C.whatsapp.botao }}</BotaoMarca>
                </dd>
              </div>
              <div class="ct-canal" :hidden="emailPendente" data-ct-email>
                <dt class="fc-rot ct-canal__rotulo">{{ C.email.rotulo }}</dt>
                <template v-if="!emailPendente">
                  <dd class="fc-h3 ct-canal__valor ct-canal__valor--email">{{ SITE.email }}</dd>
                  <dd class="ct-canal__acao"><a :href="`mailto:${SITE.email}`" class="fc-link fc-link--acao">{{ C.email.link }}</a></dd>
                </template>
              </div>
              <div class="ct-canal">
                <dt class="fc-rot ct-canal__rotulo">{{ C.instagram.rotulo }}</dt>
                <dd class="fc-h3 ct-canal__valor">{{ SITE.instagramUsuario }}</dd>
                <dd class="ct-canal__acao">
                  <a :href="SITE.instagram" target="_blank" rel="noopener noreferrer" class="fc-link fc-link--acao ct-canal__externo">
                    <svg class="ct-canal__icone" viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path :d="mdiInstagram" /></svg>{{ C.instagram.link }}
                  </a>
                </dd>
              </div>
              <div class="ct-canal">
                <dt class="fc-rot ct-canal__rotulo">{{ C.local.rotulo }}</dt>
                <dd class="fc-h3 ct-canal__valor">{{ C.local.valor }}</dd>
                <dd class="fc-leg ct-canal__legenda">{{ C.local.legenda }}</dd>
              </div>
              <div class="ct-canal">
                <dt class="fc-rot ct-canal__rotulo">{{ C.area.rotulo }}</dt>
                <dd class="fc-h3 ct-canal__valor">{{ C.area.valor }}</dd>
                <dd class="fc-leg ct-canal__legenda">{{ C.area.legenda }}</dd>
              </div>
              <div class="ct-canal">
                <dt class="fc-rot ct-canal__rotulo">{{ C.reclameAqui.rotulo }}</dt>
                <dd class="ct-canal__acao">
                  <a :href="SITE.reclameAqui" target="_blank" rel="noopener noreferrer" class="fc-link fc-link--acao">{{ C.reclameAqui.link }}</a>
                </dd>
              </div>
            </dl>
          </div>
        </div>
      </div>
    </BlocoRota>

    <BlocoRota
      tom="creme"
      :costura="{ coluna: 12, halo: 'marrom' }"
      :respiro="false"
      :pad="{ topo: 'var(--fc-respiro-rota)' }"
      rotulado="contato-atalhos"
    >
      <div class="fc-g ct-atalhos">
        <h2 id="contato-atalhos" class="fc-h2 ct-atalhos__titulo">{{ A.titulo }}</h2>
        <ul class="ct-atalhos__lista">
          <li class="ct-atalho">
            <h3 class="fc-h3">{{ A.comercio.titulo }}</h3>
            <p class="fc-txt fc-corpo ct-atalho__texto">{{ A.comercio.texto }}</p>
            <div class="ct-atalho__botao"><BotaoMarca variante="ouro" :to="CTA_COMERCIO.to">{{ CTA_COMERCIO.rotulo }}</BotaoMarca></div>
          </li>
          <li class="ct-atalho">
            <h3 class="fc-h3">{{ A.produtor.titulo }}</h3>
            <p class="fc-txt fc-corpo ct-atalho__texto">{{ A.produtor.texto }}</p>
            <div class="ct-atalho__botao"><BotaoMarca variante="contorno" :to="CTA_PRODUTOR.to">{{ CTA_PRODUTOR.rotulo }}</BotaoMarca></div>
          </li>
        </ul>
        <!-- a ficha assina com a MARCA ("Fornada Conecta · CNPJ …"); a razão social é a linha do rodapé -->
        <FichaEmpresa compacta nome="marca" class="ct-atalhos__ficha" />
      </div>
    </BlocoRota>
  </div>
</template>

<style scoped>
/* ---------- 1ª tela ---------- */
.ct-tela { container-type: inline-size; } /* as metades sangram e o recuo em cqw devolve o conteúdo às colunas */
.ct-intro__titulo { margin-top: 20px; text-wrap: balance; }
/* o trecho em itálico fica inteiro na linha: a 1024–1440 o H1 era "Fala com a / gente pelo / WhatsApp." */
.ct-intro__titulo .fc-leve { white-space: nowrap; }
.ct-intro__sub { margin-top: 24px; }
/* celular: a costura (x 24) sobe da divisa para cá — o respiro (80) já é a folga da caixa de texto */
.ct-intro { padding-bottom: var(--fc-respiro-rota); }
.ct-canais {
  --ct-y-costura: 88px; /* desktop: no meio do valor do 1º canal (WhatsApp) */
  position: relative;
  grid-column: full-start / full-end;
  background: var(--fc-ruido-e), radial-gradient(circle at 82% 18%, color-mix(in srgb, var(--fc-dourado) 18%, transparent), transparent 60%), var(--fc-marrom);
  background-color: var(--fc-marrom);
  color: var(--fc-tinta);
  /* celular: costura no topo e para os atalhos embaixo — o respiro de 80 dos dois lados */
  padding: var(--fc-respiro-rota) var(--gut);
}
.ct-canais__lista { margin: 0; border-top: 1px solid var(--fc-linha); }
.ct-canal { display: grid; gap: 8px; padding: 20px 0 24px; border-bottom: 1px solid var(--fc-linha); justify-items: start; }
/* sem fio no fim: a costura para os atalhos sobe 66 px no respiro e não encosta em linha nenhuma */
.ct-canal:last-child { border-bottom: 0; padding-bottom: 0; }
.ct-canal__rotulo { color: var(--fc-tinta-2); }
.ct-canal dd { margin: 0; }
.ct-canal__valor { color: var(--fc-tinta); overflow-wrap: anywhere; }
.ct-canal__acao { margin-top: 8px !important; }
.ct-canal__legenda { color: var(--fc-tinta-corpo); max-width: 44ch; }
.ct-canal__externo { gap: 8px; }
.ct-canal__icone { width: 20px; height: 20px; flex: none; fill: currentColor; }

@media (min-width: 1024px) {
  .ct-intro { grid-column: 2 / 7; padding-bottom: 72px; }
  .ct-canais {
    grid-column: 8 / full-end;
    margin-left: calc(var(--gap) / -2); /* divisa no meio do vão entre as colunas 7 e 8 */
    /* 104 px entre a divisa e o texto (a costura horizontal ocupa 72 + 32 de folga); à direita, volta à linha c-end;
       embaixo, 96: a costura dos atalhos (coluna 12) sobe 72 e passa longe da última legenda a 1024 */
    padding: 40px calc((100cqw - min(100cqw, var(--fc-wrap-max))) / 2 + var(--gut)) 96px 104px;
  }
  .ct-canais__lista { border-top: 0; }
  .ct-canal:first-child { padding-top: 8px; }
}

/* ---------- atalhos ---------- */
.ct-atalhos { row-gap: 32px; }
.ct-atalhos__lista { list-style: none; margin: 0; padding: 0; border-top: 1px solid var(--fc-linha); }
.ct-atalho { display: grid; gap: 8px; justify-items: start; padding: 24px 0 28px; border-bottom: 1px solid var(--fc-linha); }
.ct-atalho__botao { margin-top: 12px; }
.ct-atalhos__ficha { color: var(--fc-tinta-2); }
@media (min-width: 1024px) {
  .ct-atalhos { align-items: start; }
  .ct-atalhos__titulo { grid-column: 2 / 7; grid-row: 1; }
  .ct-atalhos__lista { grid-column: 8 / 13; grid-row: 1 / span 2; }
  .ct-atalhos__ficha { grid-column: 2 / 7; grid-row: 2; align-self: end; }
}
</style>
