<script setup>
/**
 * "Seja produtor parceiro" — formulário de Seja produtor.
 * O 1º campo É a regularização sanitária (requisito de entrada, "cedo e visível"), com o selo estático ao lado.
 * "Não" mostra o aviso e o envio CONTINUA permitido: a regularização vai na 2ª linha da mensagem.
 * CNPJ opcional, validado só se preenchido, aceita letras (Receita Federal, 31/07/2026).
 * Fecha no WhatsApp: valida (síncrono) → window.open na mesma pilha do clique → o sucesso ocupa o lugar do formulário.
 * Superfície: SÓ sobre o creme da paleta (nunca creme-2): ajuda, legenda e "obrigatórios" são marrom-médio, que só
 * passa 4,5:1 sobre o creme (sobre creme-2 dá 4,18:1).
 *
 * Props   nenhuma
 * Emits   enviado({ texto, url })   no envio válido; `url` é null enquanto o número da Fornada for sentinela (prévia)
 * Expose  focar()   foco (e rolagem até o centro) no 1º campo — ou no título do sucesso, se já enviou
 *
 * Os dois formulários espelham o bloco de CSS entre os marcadores "base" (o teste de unidade confere que são iguais).
 */
import { computed, onBeforeUnmount, onMounted, reactive, ref, useId } from 'vue'
import { vMaska } from 'maska/vue'
import BotaoMarca from '@/components/marca/BotaoMarca.vue'
import SeloSanitario from '@/components/marca/SeloSanitario.vue'
import EstadoEnvio from './EstadoEnvio.vue'
import { useBotaoEnvio } from '@/composables/useNudge'
import {
  camposProdutor, useEnvioWhatsapp, validarProdutor, valoresIniciaisProdutor,
} from '@/composables/useEnvioWhatsapp'
import { AVISOS_REGULARIZACAO, LEGENDA_OBRIGATORIOS, PRODUTOR as T, SEM_WHATSAPP } from '@/data/formularios'
import { MASCARA_CNPJ } from '@/lib/cnpj'
import { MASCARA_TELEFONE } from '@/lib/telefone'
import { CURVA, DUR, reduzirAgora } from '@/lib/motion'
import { SITE, emailPendente } from '@/config/site'

const emit = defineEmits(['enviado', 'corrigido'])

const C = T.campos
const valores = reactive(valoresIniciaisProdutor())
const {
  enviado, resumo, anuncio, id, msgs, invalido, sairDoGrupo, descricao, propsTexto, enviar, corrigir, focarPrimeiro,
} = useEnvioWhatsapp({
  tipo: 'PRODUTOR',
  textos: T,
  valores,
  validar: validarProdutor,
  montar: camposProdutor,
  idBase: `fcf-${useId()}`,
  primeiro: 'regularizacao',
  aoEnviar: (msg) => emit('enviado', msg),
})

const aviso = computed(() => AVISOS_REGULARIZACAO[valores.regularizacao] ?? null)
const cnpjLetras = ref(false) // "Meu CNPJ tem letras": troca o teclado (inputmode numeric ↔ text); colar funciona nos dois

const botao = ref(null)
useBotaoEnvio(botao) // no celular o botão fixo de WhatsApp sai de cena enquanto este botão está na tela
const estado = ref(null)

/**
 * Aviso da regularização: a ÚNICA exceção de `height` animado do site — 240 ms assa, opacidade em
 * fermenta, via Web Animations (nada de style.height inline sobrando). Sob reduzir movimento: instantâneo.
 */
function expandir(el, done) {
  if (reduzirAgora()) return queueMicrotask(done)
  const altura = el.offsetHeight
  el.animate({ opacity: [0, 1] }, { duration: DUR.expande, easing: CURVA.fermenta })
  el.animate({ height: ['0px', `${altura}px`] }, { duration: DUR.expande, easing: CURVA.assa }).finished.then(done, done)
}
function recolher(el, done) {
  if (reduzirAgora()) return queueMicrotask(done) // done() síncrono no leave de um out-in re-renderiza o Transition no meio do patch
  const altura = el.offsetHeight
  el.animate({ opacity: [1, 0], height: [`${altura}px`, '0px'] }, { duration: DUR.expande, easing: CURVA.assa, fill: 'forwards' }).finished.then(done, done)
}

/** "Corrigir dados": o formulário volta com tudo preenchido e a página devolve o cabeçalho do cartão. */
async function voltar() {
  await corrigir()
  emit('corrigido')
}
// o CTA do cabeçalho na própria página e "Preencher o cadastro" pedem o formulário: rola e foca o 1º campo
const irAoFormulario = () => focar()
onMounted(() => window.addEventListener('fc:ir-ao-formulario', irAoFormulario))
onBeforeUnmount(() => window.removeEventListener('fc:ir-ao-formulario', irAoFormulario))

function focar() {
  if (enviado.value) estado.value?.focar()
  else focarPrimeiro('center')
}
defineExpose({ focar })
</script>

<template>
  <div class="fc-form" data-fc-form="produtor">
    <form v-show="!enviado" class="fc-form__corpo" :aria-label="T.nome" novalidate @submit.prevent="enviar">
      <p class="fc-form__obrigatorios fc-leg">{{ LEGENDA_OBRIGATORIOS }}</p>

      <fieldset
        :id="id('regularizacao')"
        class="fc-form__grupo"
        :aria-describedby="descricao('regularizacao', true)"
        :aria-invalid="invalido('regularizacao')"
        @focusout="sairDoGrupo('regularizacao', $event)"
      >
        <legend :id="`${id('regularizacao')}-legenda`" class="fc-form__rotulo">{{ C.regularizacao.rotulo }}</legend>
        <div class="fc-form__regul">
          <SeloSanitario variante="estatico" tamanho="compacto" />
          <div class="fc-form__regul-corpo">
            <p :id="`${id('regularizacao')}-ajuda`" class="fc-form__ajuda">{{ C.regularizacao.ajuda }}</p>
            <v-radio-group :id="`${id('regularizacao')}-msgs`" v-model="valores.regularizacao" role="none" class="fc-form__radios fc-form__radios--coluna" :error-messages="msgs('regularizacao')">
              <v-radio v-for="op in C.regularizacao.opcoes" :key="op" :label="op" :value="op" />
            </v-radio-group>
          </div>
        </div>
        <div class="fc-form__avisos" aria-live="polite">
          <Transition :css="false" mode="out-in" @enter="expandir" @leave="recolher">
            <div v-if="aviso" :key="valores.regularizacao" class="fc-form__aviso" :class="{ 'fc-form__aviso--alerta': aviso.alerta }">
              <div class="fc-form__aviso-corpo">
                <div class="fc-form__aviso-texto">
                  <p v-for="(p, i) in aviso.paragrafos" :key="i"><strong v-if="p.forte">{{ p.forte }}</strong>{{ p.texto }}</p>
                </div>
              </div>
            </div>
          </Transition>
        </div>
      </fieldset>

      <div class="fc-form__campo">
        <label :id="`${id('nome')}-label`" :for="id('nome')" class="fc-form__rotulo">{{ C.nome.rotulo }}</label>
        <v-text-field v-model="valores.nome" v-bind="propsTexto('nome')" />
      </div>
      <div class="fc-form__campo">
        <label :id="`${id('negocio')}-label`" :for="id('negocio')" class="fc-form__rotulo">{{ C.negocio.rotulo }}</label>
        <v-text-field v-model="valores.negocio" v-bind="propsTexto('negocio')" />
      </div>

      <div class="fc-form__campo">
        <label :id="`${id('cnpj')}-label`" :for="id('cnpj')" class="fc-form__rotulo">{{ C.cnpj.rotulo }}</label>
        <v-text-field v-model="valores.cnpj" v-maska="MASCARA_CNPJ" v-bind="{ ...propsTexto('cnpj'), inputmode: cnpjLetras ? 'text' : 'numeric' }" />
        <button type="button" class="fc-form__alternar" @click="cnpjLetras = !cnpjLetras">
          {{ cnpjLetras ? C.cnpj.alternar.numeros : C.cnpj.alternar.letras }}
        </button>
      </div>

      <div class="fc-form__campo">
        <label :id="`${id('bairro')}-label`" :for="id('bairro')" class="fc-form__rotulo">{{ C.bairro.rotulo }}</label>
        <v-text-field v-model="valores.bairro" v-bind="propsTexto('bairro')" />
      </div>
      <div class="fc-form__campo">
        <label :id="`${id('cidade')}-label`" :for="id('cidade')" class="fc-form__rotulo">{{ C.cidade.rotulo }}</label>
        <v-text-field v-model="valores.cidade" v-bind="propsTexto('cidade')" />
      </div>

      <fieldset
        :id="id('produz')"
        class="fc-form__grupo"
        :aria-describedby="descricao('produz', true)"
        :aria-invalid="invalido('produz')"
        @focusout="sairDoGrupo('produz', $event)"
      >
        <legend class="fc-form__rotulo">{{ C.produz.rotulo }}</legend>
        <p :id="`${id('produz')}-ajuda`" class="fc-form__ajuda">{{ C.produz.ajuda }}</p>
        <v-input :id="`${id('produz')}-msgs`" class="fc-form__caixas" hide-details="auto" :error-messages="msgs('produz')">
          <div class="fc-form__opcoes">
            <v-checkbox v-for="op in C.produz.opcoes" :key="op" v-model="valores.produz" :label="op" :value="op" />
          </div>
        </v-input>
      </fieldset>
      <div v-if="valores.produz.includes('Outro')" class="fc-form__campo">
        <label :id="`${id('qual')}-label`" :for="id('qual')" class="fc-form__rotulo">{{ C.qual.rotulo }}</label>
        <v-text-field v-model="valores.qual" v-bind="propsTexto('qual')" />
      </div>

      <div class="fc-form__campo">
        <label :id="`${id('capacidade')}-label`" :for="id('capacidade')" class="fc-form__rotulo">{{ C.capacidade.rotulo }}</label>
        <v-text-field v-model="valores.capacidade" v-bind="propsTexto('capacidade')" />
      </div>
      <div class="fc-form__campo">
        <label :id="`${id('whatsapp')}-label`" :for="id('whatsapp')" class="fc-form__rotulo">{{ C.whatsapp.rotulo }}</label>
        <v-text-field v-model="valores.whatsapp" v-maska="MASCARA_TELEFONE" v-bind="propsTexto('whatsapp')" />
      </div>

      <div class="fc-form__resumo" role="status" aria-live="polite">
        <p v-if="resumo" class="fc-form__resumo-msg">{{ resumo }}</p>
      </div>
      <!-- o erro do campo que a pessoa acabou de deixar: um anúncio só, polido -->
      <p class="fc-sr" role="status" aria-live="polite">{{ anuncio }}</p>

      <div class="fc-form__envio">
        <BotaoMarca ref="botao" variante="ouro" type="submit" bloco>{{ T.botao }}</BotaoMarca>
        <p class="fc-form__privacidade fc-leg">
          {{ T.aviso.antes }}<strong>{{ T.aviso.destaque }}</strong>{{ T.aviso.depois }}
          <router-link to="/privacidade" target="_blank" rel="noopener" class="fc-link">{{ T.aviso.link }}<span class="fc-sr"> (abre em outra aba)</span></router-link>
        </p>
        <p v-if="!emailPendente" class="fc-form__email fc-leg">
          {{ SEM_WHATSAPP.antes }}<a :href="`mailto:${SITE.email}`" class="fc-link">{{ SITE.email }}</a>{{ SEM_WHATSAPP.depois }}
        </p>
      </div>
    </form>

    <EstadoEnvio v-if="enviado" ref="estado" tipo="PRODUTOR" :texto="enviado.texto" :url="enviado.url" @corrigir="voltar" />
  </div>
</template>

<style>
/* fc-form:base:inicio — IGUAL em FormPedido.vue e FormProdutor.vue (tests/unit/formularios.test.js confere) */
.fc-form { color: var(--fc-marrom); }
/* sem reserva embaixo: o botão fixo sai de cena quando um controle cruza com ele */
.fc-form__corpo { display: grid; gap: 16px; }
.fc-form__corpo > * { min-width: 0; }
.fc-form__obrigatorios { margin: 0; color: var(--fc-marrom-medio); }
/* rótulo estático ACIMA do campo (<label for>, texto fixo): quebra de linha sem cortar, nunca some nem se move */
.fc-form__campo { display: grid; gap: 6px; }

/* campos: foco = borda de 2 px (marrom-profundo, prop `color`) no lugar do anel; placeholder só de exemplo de formato */
.fc-form .v-field input:focus-visible { outline: none; }
.fc-form .v-field input::placeholder { color: var(--fc-marrom-medio); opacity: 1; }
/* ajuda (hint) e erro: 14 px. O tamanho é fixado AQUI com especificidade 0,2,0 porque, no build, o CSS do componente
   do Vuetify (12 px) chega depois do global e empata com ele */
.fc-form .v-messages { color: var(--fc-marrom-medio); font-size: var(--fc-fs-legenda); line-height: 1.4; opacity: 1; }
.fc-form .v-messages__message { line-height: 1.4; hyphens: manual; }
.fc-form__caixas > .v-input__details { padding-inline: 16px; } /* mesmo recuo do erro do grupo de rádios e do campo de texto */

/* grupos de rádio e caixa: <fieldset> com <legend> visível; cada opção é uma linha de 48 px clicável inteira */
.fc-form__grupo { min-width: 0; margin: 0; padding: 0; border: 0; }
.fc-form__rotulo { display: block; margin: 0; padding: 0; font: 600 var(--fc-fs-corpo) / 1.4 var(--fc-ff-corpo); color: var(--fc-marrom); }
.fc-form__grupo > .fc-form__rotulo { margin-bottom: 4px; }
.fc-form__ajuda { margin: 0 0 4px; font-size: var(--fc-fs-legenda); line-height: 1.4; letter-spacing: .005em; color: var(--fc-marrom-medio); }
.fc-form .v-selection-control-group,
.fc-form__opcoes {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(min(100%, 15rem), 1fr));
  column-gap: 8px;
}
.fc-form__opcoes { flex: 1 1 100%; min-width: 0; } /* dentro do v-input__control (flex) o grid encolheria */
.fc-form .v-selection-control-group > .v-selection-control { grid-area: auto; } /* o Vuetify põe grid-area: control em cada linha */
.fc-form__radios--coluna .v-selection-control-group { grid-template-columns: minmax(0, 1fr); }
.fc-form .v-selection-control {
  --v-selection-control-size: 48px;
  min-height: 48px;
  border-radius: var(--fc-raio-campo);
  transition: background-color var(--fc-dur-hover) var(--fc-curva-assa);
}
.fc-form .v-selection-control .v-label {
  flex: 1 1 auto;
  align-self: stretch;
  padding-inline: 4px 12px;
  font-size: var(--fc-fs-corpo);
  line-height: 1.35;
  letter-spacing: 0;
  cursor: pointer;
}
@media (hover: hover) and (pointer: fine) {
  .fc-form .v-selection-control:hover { background-color: var(--fc-creme-2); }
}

/* resumo de erro no envio (região viva no fim dos campos): ícone "!" + texto, nunca só cor */
.fc-form__resumo-msg {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  margin: 0;
  font-weight: 500;
  font-size: var(--fc-fs-legenda);
  line-height: 1.4;
  color: var(--fc-marrom-profundo);
  animation: fc-form-op var(--fc-dur-hover) var(--fc-curva-fermenta) backwards;
}
.fc-form__resumo-msg::before,
.fc-form__aviso--alerta .fc-form__aviso-corpo::before {
  content: "!";
  content: "!" / "";
  flex: none;
  display: inline-grid;
  place-items: center;
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background: var(--fc-dourado);
  color: var(--fc-marrom-profundo);
  font-weight: 700;
  font-size: 12px;
  line-height: 1;
}
@keyframes fc-form-op { from { opacity: 0; } }
@media (prefers-reduced-motion: reduce) {
  .fc-form__resumo-msg { animation-duration: var(--fc-dur-reduzido); }
}

/* envio: botão + aviso de privacidade colado, sempre visível */
.fc-form__envio { display: grid; gap: 16px; justify-items: start; }
.fc-form__privacidade, .fc-form__email { margin: 0; max-width: 62ch; color: var(--fc-marrom); }
/* fc-form:base:fim */

/* só do produtor: regularização com o selo ao lado, avisos e o botão-link do CNPJ */
.fc-form__regul { display: grid; grid-template-columns: auto minmax(0, 1fr); column-gap: 12px; align-items: start; }
.fc-form__regul-corpo { min-width: 0; }
.fc-form__aviso { overflow: hidden; } /* a altura é animada (240 ms assa) por Web Animations; nenhum style.height sobra */
.fc-form__aviso-corpo {
  display: flex;
  gap: 12px;
  margin-top: 12px;
  padding: 16px;
  background: var(--fc-creme-2);
  border-left: 4px solid var(--fc-marrom-medio);
  color: var(--fc-marrom-profundo);
}
.fc-form__aviso--alerta .fc-form__aviso-corpo { border-left-color: var(--fc-marrom); }
.fc-form__aviso-texto { display: grid; gap: 8px; min-width: 0; }
.fc-form__aviso-texto p { margin: 0; font-size: var(--fc-fs-corpo); line-height: 1.5; }
/* < 768: o aviso do "Não" tinha 516 px a 375 — o "!" vai para dentro da 1ª frase (flutuando, sem coluna própria),
   padding 12 e parágrafos a 15 px */
@media (max-width: 767px) {
  .fc-form__aviso-corpo { display: block; padding: 12px; }
  .fc-form__aviso--alerta .fc-form__aviso-corpo::before { float: left; margin: 3px 8px 0 0; }
  .fc-form__aviso-texto { display: block; }
  .fc-form__aviso-texto p { font-size: var(--fc-fs-apoio); }
  .fc-form__aviso-texto p + p { margin-top: 8px; }
}
.fc-form__alternar {
  justify-self: start;
  display: inline-flex;
  align-items: center;
  min-height: 44px;
  margin: -8px 0 0;
  padding: 0;
  border: 0;
  background: none;
  color: inherit;
  font: 500 var(--fc-fs-legenda) / 1.2 var(--fc-ff-corpo);
  text-decoration: underline;
  text-underline-offset: 4px;
  text-decoration-thickness: 1px;
  cursor: pointer;
}
@media (hover: hover) and (pointer: fine) { .fc-form__alternar:hover { text-decoration-thickness: 2px; } }
</style>
