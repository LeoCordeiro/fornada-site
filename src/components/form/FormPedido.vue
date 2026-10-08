<script setup>
/**
 * "Quero receber fornada" — formulário de Para comércios.
 * Fecha no WhatsApp: valida (síncrono) → window.open na mesma pilha do clique → o sucesso ocupa o lugar do formulário.
 * Nada é guardado nem enviado a servidor; os valores vivem só neste componente.
 * Superfície: SÓ sobre o creme da paleta (nunca creme-2): ajuda, legenda e "obrigatórios" são marrom-médio, que só
 * passa 4,5:1 sobre o creme (sobre creme-2 dá 4,18:1). O cartão da página fica creme.
 *
 * Props
 *   produtos  String[]  (opcional) slugs a pré-marcar: paes | bolos | salgados-assados | massas-frescas.
 *                       Vence a query `?produtos=paes,bolos`; slug fora da lista é ignorado.
 * Emits
 *   enviado({ texto, url })   no envio válido; `url` é null enquanto o número da Fornada for sentinela (prévia)
 * Expose
 *   focar()   foco (e rolagem até o centro) no 1º campo — ou no título do sucesso, se já enviou
 *
 * Os dois formulários espelham o bloco de CSS entre os marcadores "base" (o teste de unidade confere que são iguais).
 */
import { onBeforeUnmount, onMounted, reactive, ref, useId } from 'vue'
import { useRoute } from 'vue-router'
import { vMaska } from 'maska/vue'
import BotaoMarca from '@/components/marca/BotaoMarca.vue'
import EstadoEnvio from './EstadoEnvio.vue'
import { useBotaoEnvio } from '@/composables/useNudge'
import {
  camposPedido, produtosIniciais, useEnvioWhatsapp, validarPedido, valoresIniciaisPedido,
} from '@/composables/useEnvioWhatsapp'
import { LEGENDA_OBRIGATORIOS, PEDIDO as T, SEM_WHATSAPP } from '@/data/formularios'
import { MASCARA_TELEFONE } from '@/lib/telefone'
import { SITE, emailPendente } from '@/config/site'

const props = defineProps({
  produtos: { type: Array, default: undefined },
})
const emit = defineEmits(['enviado', 'corrigido'])

const route = useRoute()
const C = T.campos
const valores = reactive(valoresIniciaisPedido(produtosIniciais(props.produtos, route.query.produtos)))
const {
  enviado, resumo, anuncio, id, msgs, invalido, sairDoGrupo, descricao, propsTexto, enviar, corrigir, focarPrimeiro,
} = useEnvioWhatsapp({
  tipo: 'PEDIDO',
  textos: T,
  valores,
  validar: validarPedido,
  montar: camposPedido,
  idBase: `fcf-${useId()}`,
  primeiro: 'nome',
  aoEnviar: (msg) => emit('enviado', msg),
})

const botao = ref(null)
useBotaoEnvio(botao) // no celular o botão fixo de WhatsApp sai de cena enquanto este botão está na tela
const estado = ref(null)

function focar() {
  if (enviado.value) estado.value?.focar()
  else focarPrimeiro('center')
}
/** "Corrigir dados": o formulário volta com tudo preenchido e a página devolve o cabeçalho do cartão. */
async function voltar() {
  await corrigir()
  emit('corrigido')
}
// o CTA do cabeçalho na própria página (e "Preencher…") pedem o formulário: rola e foca o 1º campo
const irAoFormulario = () => focar()
onMounted(() => window.addEventListener('fc:ir-ao-formulario', irAoFormulario))
onBeforeUnmount(() => window.removeEventListener('fc:ir-ao-formulario', irAoFormulario))
defineExpose({ focar })
</script>

<template>
  <div class="fc-form" data-fc-form="pedido">
    <form v-show="!enviado" class="fc-form__corpo" :aria-label="T.nome" novalidate @submit.prevent="enviar">
      <p class="fc-form__obrigatorios fc-leg">{{ LEGENDA_OBRIGATORIOS }}</p>

      <div class="fc-form__campo">
        <label :id="`${id('nome')}-label`" :for="id('nome')" class="fc-form__rotulo">{{ C.nome.rotulo }}</label>
        <v-text-field v-model="valores.nome" v-bind="propsTexto('nome')" />
      </div>
      <div class="fc-form__campo">
        <label :id="`${id('comercio')}-label`" :for="id('comercio')" class="fc-form__rotulo">{{ C.comercio.rotulo }}</label>
        <v-text-field v-model="valores.comercio" v-bind="propsTexto('comercio')" />
      </div>

      <fieldset :id="id('tipo')" class="fc-form__grupo" :aria-describedby="descricao('tipo', true)" :aria-invalid="invalido('tipo')" @focusout="sairDoGrupo('tipo', $event)">
        <legend :id="`${id('tipo')}-legenda`" class="fc-form__rotulo">{{ C.tipo.rotulo }}</legend>
        <v-radio-group :id="`${id('tipo')}-msgs`" v-model="valores.tipo" role="none" class="fc-form__radios" :error-messages="msgs('tipo')">
          <v-radio v-for="op in C.tipo.opcoes" :key="op" :label="op" :value="op" />
        </v-radio-group>
      </fieldset>
      <div v-if="valores.tipo === 'Outro'" class="fc-form__campo">
        <label :id="`${id('qual')}-label`" :for="id('qual')" class="fc-form__rotulo">{{ C.qual.rotulo }}</label>
        <v-text-field v-model="valores.qual" v-bind="propsTexto('qual')" />
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
        :id="id('produtos')"
        class="fc-form__grupo"
        :aria-describedby="descricao('produtos', true)"
        :aria-invalid="invalido('produtos')"
        @focusout="sairDoGrupo('produtos', $event)"
      >
        <legend class="fc-form__rotulo">{{ C.produtos.rotulo }}</legend>
        <p :id="`${id('produtos')}-ajuda`" class="fc-form__ajuda">{{ C.produtos.ajuda }}</p>
        <v-input :id="`${id('produtos')}-msgs`" class="fc-form__caixas" hide-details="auto" :error-messages="msgs('produtos')">
          <div class="fc-form__opcoes">
            <v-checkbox v-for="op in C.produtos.opcoes" :key="op" v-model="valores.produtos" :label="op" :value="op" />
          </div>
        </v-input>
      </fieldset>

      <fieldset
        :id="id('frequencia')"
        class="fc-form__grupo"
        :aria-describedby="descricao('frequencia', true)"
        :aria-invalid="invalido('frequencia')"
        @focusout="sairDoGrupo('frequencia', $event)"
      >
        <legend :id="`${id('frequencia')}-legenda`" class="fc-form__rotulo">{{ C.frequencia.rotulo }}</legend>
        <p :id="`${id('frequencia')}-ajuda`" class="fc-form__ajuda">{{ C.frequencia.ajuda }}</p>
        <v-radio-group :id="`${id('frequencia')}-msgs`" v-model="valores.frequencia" role="none" class="fc-form__radios" :error-messages="msgs('frequencia')">
          <v-radio v-for="op in C.frequencia.opcoes" :key="op" :label="op" :value="op" />
        </v-radio-group>
      </fieldset>

      <div class="fc-form__campo">
        <label :id="`${id('quantidade')}-label`" :for="id('quantidade')" class="fc-form__rotulo">{{ C.quantidade.rotulo }}</label>
        <v-text-field v-model="valores.quantidade" v-bind="propsTexto('quantidade')" />
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

    <EstadoEnvio v-if="enviado" ref="estado" tipo="PEDIDO" :texto="enviado.texto" :url="enviado.url" @corrigir="voltar" />
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
</style>
