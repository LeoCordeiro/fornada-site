// Envio dos formulários para o WhatsApp.
//
// O que este arquivo garante:
//  1. validação SÍNCRONA (nada de VForm assíncrono: o resultado precisa existir antes de abrir o WhatsApp);
//  2. `window.open` na MESMA pilha do clique — validar → montar → abrirWhatsApp(url) → trocar o formulário pelo sucesso,
//     sem await/setTimeout antes (perder o gesto do usuário = bloqueador de janelas engole o WhatsApp);
//  3. erro no tempo certo: nada enquanto a pessoa digita pela 1ª vez, aparece na 1ª saída do campo (blur) ou no envio,
//     e depois de aparecer revalida a cada tecla ("cobra tarde, perdoa cedo");
//  4. nada é guardado nem enviado a servidor: os valores vivem só no estado do componente.
//
// Em cima disso, funções PURAS (valores → erros, valores → campos da mensagem) que o vitest exercita sem DOM.
import { computed, getCurrentInstance, nextTick, onBeforeUnmount, onMounted, reactive, ref } from 'vue'
import { abrirWhatsApp, montarMensagemWhatsApp } from '@/lib/whatsapp'
import { validarTelefone } from '@/lib/telefone'
import { formatarCnpj, normalizarCnpj, validarCnpj } from '@/lib/cnpj'
import { reduzirAgora } from '@/lib/motion'
import { OPCOES_PRODUTOS, PEDIDO, PRODUTOR, ROTULOS_PRODUTOS, resumoDeErros } from '@/data/formularios'
import { registrarCliqueWhatsApp } from './useNudge'

// ---------------------------------------------------------------------------------------------------------------
// Valores iniciais e pré-marcação por `?produtos=paes,bolos`
// ---------------------------------------------------------------------------------------------------------------
export const valoresIniciaisPedido = (produtos = []) => ({
  nome: '', comercio: '', tipo: '', qual: '', bairro: '', cidade: '',
  produtos: [...produtos], frequencia: '', quantidade: '', whatsapp: '',
})

export const valoresIniciaisProdutor = () => ({
  regularizacao: '', nome: '', negocio: '', cnpj: '', bairro: '', cidade: '',
  produz: [], qual: '', capacidade: '', whatsapp: '',
})

/**
 * `paes,bolos` | ['paes', 'bolos'] | 'x' → rótulos na ORDEM DO FORMULÁRIO. Slug fora da lista é ignorado
 * (só `categoria`/`produtos` podem ir na URL, e só com slug conhecido).
 */
export function produtosDaQuery(entrada) {
  const slugs = new Set(
    [entrada]
      .flat()
      .filter((x) => typeof x === 'string')
      .flatMap((s) => s.split(','))
      .map((s) => s.trim().toLowerCase())
      .filter(Boolean),
  )
  return OPCOES_PRODUTOS.filter((o) => slugs.has(o.slug)).map((o) => o.rotulo)
}

/** A prop `produtos` (array de slugs) do componente VENCE a query; sem prop, vale `?produtos=`. Prop vazia = nada pré-marcado. */
export const produtosIniciais = (propProdutos, queryProdutos) => produtosDaQuery(propProdutos ?? queryProdutos)

// ---------------------------------------------------------------------------------------------------------------
// Validação (pura). Devolve só os campos com erro, COM A MENSAGEM DA COPY, na ORDEM do formulário — a primeira chave é
// o primeiro campo inválido (foco). Campo opcional vazio nunca entra.
// ---------------------------------------------------------------------------------------------------------------
const vazio = (s) => !String(s ?? '').trim()

export function validarPedido(v, E = PEDIDO.campos) {
  const e = {}
  if (vazio(v.nome)) e.nome = E.nome.erro
  if (vazio(v.comercio)) e.comercio = E.comercio.erro
  if (!v.tipo) e.tipo = E.tipo.erro
  if (v.tipo === 'Outro' && vazio(v.qual)) e.qual = E.qual.erro
  if (vazio(v.bairro)) e.bairro = E.bairro.erro
  if (vazio(v.cidade)) e.cidade = E.cidade.erro
  if (!v.produtos.length) e.produtos = E.produtos.erro
  if (!v.frequencia) e.frequencia = E.frequencia.erro
  const tel = validarTelefone(v.whatsapp)
  if (tel) e.whatsapp = E.whatsapp.erros[tel]
  return e
}

export function validarProdutor(v, E = PRODUTOR.campos) {
  const e = {}
  if (!v.regularizacao) e.regularizacao = E.regularizacao.erro // "Não" NÃO bloqueia: só falta de resposta
  if (vazio(v.nome)) e.nome = E.nome.erro
  if (vazio(v.negocio)) e.negocio = E.negocio.erro
  if (normalizarCnpj(v.cnpj)) {
    // opcional: só valida se alguma coisa foi digitada
    const c = validarCnpj(v.cnpj)
    if (c) e.cnpj = E.cnpj.erros[c]
  }
  if (vazio(v.bairro)) e.bairro = E.bairro.erro
  if (vazio(v.cidade)) e.cidade = E.cidade.erro
  if (!v.produz.length) e.produz = E.produz.erro
  if (v.produz.includes('Outro') && vazio(v.qual)) e.qual = E.qual.erro
  if (vazio(v.capacidade)) e.capacidade = E.capacidade.erro
  const tel = validarTelefone(v.whatsapp)
  if (tel) e.whatsapp = E.whatsapp.erros[tel]
  return e
}

// ---------------------------------------------------------------------------------------------------------------
// Valores → campos da mensagem (lib/whatsapp.js monta o modelo)
// ---------------------------------------------------------------------------------------------------------------
const naOrdem = (marcados, todos) => todos.filter((o) => marcados.includes(o))

export const camposPedido = (v) => ({
  nome: v.nome,
  comercio: v.comercio,
  tipo: v.tipo,
  qual: v.tipo === 'Outro' ? v.qual : '',
  bairro: v.bairro,
  cidade: v.cidade,
  produtos: naOrdem(v.produtos, ROTULOS_PRODUTOS), // "na ordem do formulário", não na do clique
  frequencia: v.frequencia,
  quantidade: v.quantidade,
  whatsapp: v.whatsapp,
})

export const camposProdutor = (v) => ({
  regularizacao: v.regularizacao,
  nome: v.nome,
  negocio: v.negocio,
  cnpj: formatarCnpj(v.cnpj), // vazio → '' → a lib escreve "não informado"
  bairro: v.bairro,
  cidade: v.cidade,
  produz: naOrdem(v.produz, PRODUTOR.campos.produz.opcoes),
  qual: v.produz.includes('Outro') ? v.qual : '',
  capacidade: v.capacidade,
  whatsapp: v.whatsapp,
})

/** { texto, url, pendente } — `numero` só para teste; em produção é o SITE.whatsapp. */
export const mensagemPedido = (v, numero) => montarMensagemWhatsApp('PEDIDO', camposPedido(v), numero)
export const mensagemProdutor = (v, numero) => montarMensagemWhatsApp('PRODUTOR', camposProdutor(v), numero)

// ---------------------------------------------------------------------------------------------------------------
// DOM (todas com guarda: o vitest roda em node)
// ---------------------------------------------------------------------------------------------------------------
/** O que recebe o foco de um campo: o próprio <input>, ou — em grupo (fieldset) — a opção marcada, senão a 1ª. */
export function elementoDoCampo(idBase, chave) {
  if (typeof document === 'undefined') return null
  const el = document.getElementById(`${idBase}-${chave}`)
  if (!el) return null
  return el.matches('fieldset') ? el.querySelector('input:checked') ?? el.querySelector('input') : el
}

/** Foco sem rolar + rolagem com o `behavior` lido NA HORA (o CSS não desliga o que o JS anima). */
export function focarEMostrar(el, bloco = 'center') {
  if (!el) return
  el.focus({ preventScroll: true })
  el.scrollIntoView({ block: bloco, behavior: reduzirAgora() ? 'instant' : 'smooth' })
}

const EVENTOS_DO_ESCUDO = ['mousedown', 'click', 'dblclick']

/**
 * Escudo de toque: logo depois do envio o formulário some e o layout encolhe — um 2º toque (duplo toque no botão) cairia
 * no que passou a ficar embaixo do dedo (link do rodapé, "Voltar ao início", "Abrir de novo"). Por 400 ms, nenhum
 * toque de mouse passa: nem o clique, nem o mousedown (que levaria o foco embora do título do sucesso).
 * Devolve a função que solta o escudo antes da hora.
 */
export function segurarToques(ms = 400) {
  if (typeof window === 'undefined' || !window.addEventListener) return () => {}
  const barrar = (e) => {
    e.preventDefault()
    e.stopImmediatePropagation()
  }
  for (const ev of EVENTOS_DO_ESCUDO) window.addEventListener(ev, barrar, true)
  let tmr = 0
  const soltar = () => {
    clearTimeout(tmr)
    for (const ev of EVENTOS_DO_ESCUDO) window.removeEventListener(ev, barrar, true)
  }
  tmr = setTimeout(soltar, ms)
  return soltar
}

// ---------------------------------------------------------------------------------------------------------------
// O composable
// ---------------------------------------------------------------------------------------------------------------
/**
 * @param {object} o
 * @param {'PEDIDO'|'PRODUTOR'} o.tipo
 * @param {object} o.textos       PEDIDO | PRODUTOR de data/formularios.js
 * @param {object} o.valores      reactive() com os valores dos campos
 * @param {Function} o.validar    (valores) => { chave: mensagem } na ordem do formulário
 * @param {Function} o.montar     (valores) => campos para montarMensagemWhatsApp
 * @param {string} o.idBase       prefixo dos ids (useId() do componente)
 * @param {string} o.primeiro     chave do 1º campo (foco ao corrigir)
 * @param {Function} [o.aoEnviar] ({ texto, url }) => void — o componente emite `enviado`
 * @param {string} [o.numero]     só em teste; padrão: o número do site
 */
export function useEnvioWhatsapp({ tipo, textos, valores, validar, montar, idBase, primeiro, aoEnviar, numero }) {
  const tentou = ref(false) // já tentou enviar: todo erro passa a aparecer
  // chave → true quando o campo MOSTROU erro ao sair (erro no blur; a partir daí revalida a cada tecla).
  // Sair de um campo válido não marca: voltar e apagar não faz o erro aparecer digitando.
  const tocados = reactive({})
  const enviado = ref(null) // { texto, url, pendente } enquanto o sucesso ocupa o lugar do formulário
  let soltarEscudo = null

  const erros = computed(() => validar(valores)) // todos os erros de agora (síncrono ao ler)
  const visiveis = computed(() => {
    const out = {}
    for (const [chave, msg] of Object.entries(erros.value)) if (tentou.value || tocados[chave]) out[chave] = msg
    return out
  })
  const nInvalidos = computed(() => Object.keys(visiveis.value).length) // = nº de aria-invalid="true" na tela
  const resumo = computed(() => (tentou.value && nInvalidos.value ? resumoDeErros(nInvalidos.value) : ''))

  const id = (chave) => `${idBase}-${chave}`
  // um anúncio por evento: no blur, o erro que acabou de aparecer vai para UMA região polida do
  // formulário (`anuncio`); no envio, foco no 1º inválido + o resumo. As mensagens do Vuetify não são região viva
  // (silenciarMensagens): ficam ligadas ao campo pelo aria-describedby e são lidas quando o foco chega nele.
  const anuncio = ref('')
  const anunciar = (texto) => {
    anuncio.value = ''
    nextTick(() => (anuncio.value = texto)) // limpa antes: o mesmo texto de novo também é anunciado
  }
  const tocar = (chave) => {
    if (!erros.value[chave]) return
    if (!tocados[chave] && !tentou.value) anunciar(`${textos.campos[chave].rotulo}: ${erros.value[chave]}`)
    tocados[chave] = true
  }
  const msgs = (chave) => (visiveis.value[chave] ? [visiveis.value[chave]] : [])
  const invalido = (chave) => (visiveis.value[chave] ? 'true' : undefined)
  /** Grupo (radio/checkbox) só conta como "saiu" quando o foco vai para FORA do fieldset (setas ficam dentro). */
  const sairDoGrupo = (chave, e) => {
    if (!e.currentTarget.contains(e.relatedTarget)) tocar(chave)
  }

  /**
   * aria-describedby de um grupo: a ajuda (se houver) e, com `comMensagens`, o id da mensagem de erro — mas só enquanto ela
   * existe (id que não está na página não descreve nada).
   */
  const descricao = (chave, comMensagens = false) =>
    [textos.campos[chave].ajuda && `${id(chave)}-ajuda`, comMensagens && visiveis.value[chave] && `${id(chave)}-msgs-messages`]
      .filter(Boolean)
      .join(' ') || undefined

  /** Tudo que o <v-text-field> precisa, vindo de data/formularios.js (ajuda, limites, atributos) e do estado. O rótulo é o <label> do template. */
  function propsTexto(chave) {
    const c = textos.campos[chave]
    return {
      id: id(chave), // o <label for> + id "<id>-label" ficam no template (rótulo estático acima do campo)
      color: 'marrom-profundo', // foco: borda de 2 px nessa cor — é ela que substitui o anel de foco do campo
      rounded: null, // campo = raio de 4 px: sem classe rounded-*, vale o raio-base do .v-field. O padrão do plugin (rounded 0) o deixaria reto e `true` vira pílula de 24 px
      hint: c.ajuda || undefined,
      placeholder: c.placeholder,
      persistentPlaceholder: c.placeholder ? true : undefined, // sem rótulo dentro do campo, o exemplo de formato não colide
      type: c.type,
      maxlength: c.max,
      autocomplete: c.autocomplete,
      autocapitalize: c.autocapitalize,
      inputmode: c.inputmode,
      spellcheck: c.spellcheck,
      errorMessages: msgs(chave),
      'aria-invalid': invalido(chave),
      onBlur: () => tocar(chave),
    }
  }

  /** Handler do submit. Envio válido = 4 passos na MESMA pilha do clique, sem await antes do `window.open` (a ordem importa: o navegador só abre a janela dentro do gesto). */
  function enviar(evento) {
    evento?.preventDefault?.()
    tentou.value = true
    anuncio.value = '' // no envio quem fala é o resumo (e o foco no 1º inválido)
    const invalidos = Object.keys(erros.value)
    if (invalidos.length) {
      // nada abre; foco no 1º inválido depois do tique em que as mensagens entram
      nextTick().then(() => focarEMostrar(elementoDoCampo(idBase, invalidos[0])))
      return false
    }
    const msg = montarMensagemWhatsApp(tipo, montar(valores), numero) // 1. monta (< 1 ms)
    abrirWhatsApp(msg.url) //                                           2. abre — AINDA no gesto; null = prévia, não abre nada
    if (msg.url) registrarCliqueWhatsApp() // abriu o WhatsApp: zero lembretes do botão fixo nesta visita
    enviado.value = { texto: msg.texto, url: msg.url, pendente: msg.pendente } // 3. o sucesso entra no mesmo tique
    soltarEscudo?.()
    soltarEscudo = segurarToques() //                                   4. 2º toque não atravessa
    aoEnviar?.({ texto: msg.texto, url: msg.url })
    return true
  }

  if (getCurrentInstance()) onBeforeUnmount(() => soltarEscudo?.()) // sair da página não deixa o escudo segurando o toque na próxima

  /** "Corrigir dados": volta ao formulário com TUDO preenchido (WCAG 3.3.7) e foco no 1º campo. */
  async function corrigir() {
    enviado.value = null
    await nextTick()
    focarPrimeiro()
  }
  /** `bloco`: 'nearest' (volta do sucesso: não mexe se já está na tela) | 'center' (chamada de fora, ex.: "Preencher o cadastro") */
  function focarPrimeiro(bloco = 'nearest') {
    focarEMostrar(elementoDoCampo(idBase, primeiro), bloco)
  }

  if (getCurrentInstance()) {
    onMounted(ligarSilencio)
    onBeforeUnmount(desligarSilencio)
  }

  return {
    valores, enviado, resumo, anuncio, nInvalidos, erros, visiveis,
    id, tocar, msgs, invalido, sairDoGrupo, descricao, propsTexto,
    enviar, corrigir, focarPrimeiro,
  }
}

// O Vuetify põe role="alert" + aria-live no .v-input__details de cada campo: no envio vazio eram até 8 alertas + o resumo, e no blur
// o campo sem ajuda nascia como alerta. Dentro dos formulários a mensagem deixa de ser região viva
// (continua no aria-describedby do campo). Um observador para todos os formulários montados.
const SEL_MENSAGENS = '[data-fc-form] .v-input__details[role], [data-fc-form] .v-input__details[aria-live]'
let silencio = null
let formsMontados = 0
function silenciar(raiz = document) {
  for (const el of raiz.querySelectorAll?.(SEL_MENSAGENS) ?? []) {
    el.removeAttribute('role')
    el.removeAttribute('aria-live')
  }
}
function ligarSilencio() {
  if (formsMontados++ === 0) {
    silencio = new MutationObserver(() => silenciar())
    silencio.observe(document.body, { childList: true, subtree: true, attributes: true, attributeFilter: ['role', 'aria-live'] })
  }
  silenciar()
}
function desligarSilencio() {
  if (--formsMontados === 0) {
    silencio?.disconnect()
    silencio = null
  }
}
