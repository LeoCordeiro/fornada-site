// Textos, opções e limites dos dois formulários que fecham no WhatsApp. Os testes acham cada campo pelo rótulo
// (tests/unit/formularios.test.js): mudou um rótulo aqui, muda lá. Só dados: nenhuma regra de validação mora aqui
// (ela está em composables/useEnvioWhatsapp.js).
import { CATEGORIAS } from './categorias.js'
import { TIPOS_FORMULARIO } from './tiposComercio.js'

// ---- comum aos dois ----------------------------------------------------------------------------------------------
export const LEGENDA_OBRIGATORIOS = 'Todos os campos são obrigatórios, menos os marcados com (opcional).'

/** Resumo de erro no envio (região viva no fim do formulário). */
export const resumoDeErros = (n) =>
  n === 1 ? 'Falta corrigir 1 campo. Ele está marcado acima.' : `Falta corrigir ${n} campos. Eles estão marcados acima.`

/** Campo de WhatsApp ("Comum aos dois"). Máscara: lib/telefone.js. Sem maxlength: colar "+55 11 …" tem de passar. */
export const WHATSAPP = {
  rotulo: 'WhatsApp com DDD',
  ajuda: 'O número em que a gente te responde.',
  placeholder: '(11) 9XXXX-XXXX',
  type: 'tel',
  inputmode: 'tel',
  autocomplete: 'tel',
  erros: {
    vazio: 'Coloca um WhatsApp com DDD pra gente responder.',
    formato: 'Confere o número: DDD + 8 ou 9 dígitos.',
    ddd: 'Esse DDD não existe. Confere os dois primeiros números.',
  },
}

const texto = (rotulo, extra = {}) => ({ rotulo, ajuda: '', erro: '', type: 'text', autocomplete: 'off', ...extra })
const grupo = (rotulo, opcoes, extra = {}) => ({ rotulo, ajuda: '', erro: '', opcoes, ...extra })

/** Produtos que a Fornada vende: rótulo do formulário = título da categoria; slug = o de `?produtos=`. */
export const OPCOES_PRODUTOS = CATEGORIAS.map((c) => ({ slug: c.chave, rotulo: c.titulo }))
export const ROTULOS_PRODUTOS = OPCOES_PRODUTOS.map((o) => o.rotulo)

// ---- "Quero receber fornada" (Para comércios) --------------------------------------------------------------------
export const PEDIDO = {
  tipo: 'PEDIDO',
  nome: 'Quero receber fornada', // nome acessível do <form>
  botao: 'Abrir pedido no WhatsApp',
  campos: {
    nome: texto('Seu nome', {
      ajuda: 'Quem vai falar com a gente sobre os pedidos.',
      erro: 'Escreve o nome de quem cuida dos pedidos.',
      max: 60,
      autocomplete: 'name',
      autocapitalize: 'words',
    }),
    comercio: texto('Nome do comércio ou razão social', {
      ajuda: 'Pode ser o nome da fachada.',
      erro: 'Escreve o nome do comércio.',
      max: 80,
      autocomplete: 'organization',
    }),
    tipo: grupo('Tipo de comércio', TIPOS_FORMULARIO, { erro: 'Escolhe o tipo do seu comércio.' }),
    qual: texto('Qual?', { erro: 'Conta que tipo de comércio é.', max: 40 }),
    bairro: texto('Bairro', { erro: 'Diz o bairro da entrega.', max: 50, autocomplete: 'address-level3' }),
    cidade: texto('Cidade', {
      ajuda: 'A rota atende Guarulhos e região.',
      erro: 'Diz a cidade da entrega.',
      max: 50,
      autocomplete: 'address-level2',
    }),
    produtos: grupo('Produtos de interesse', ROTULOS_PRODUTOS, {
      ajuda: 'Pode marcar mais de um.',
      erro: 'Marca pelo menos um produto.',
    }),
    frequencia: grupo(
      'Com que frequência você precisa?',
      ['Todo dia', 'Alguns dias da semana', 'Uma vez por semana', 'De vez em quando'],
      { ajuda: 'Se mudar depois, é só conversar com a gente.', erro: 'Escolhe com que frequência você precisa.' },
    ),
    quantidade: texto('Quantidade aproximada por entrega (opcional)', {
      ajuda: 'Pode ser por alto, como 50 pães e 2 bolos. Se ainda não sabe, deixa em branco: a gente calcula junto.',
      max: 100,
    }),
    whatsapp: WHATSAPP,
  },
  // Aviso de privacidade colado ao botão. `destaque` vai em negrito; `link` vira router-link para /privacidade.
  aviso: {
    antes: 'Ao tocar em ',
    destaque: 'Abrir pedido no WhatsApp',
    depois:
      ', a mensagem abre pronta no seu WhatsApp e só chega até a gente quando você toca em enviar. Este site não guarda nada do que você digitou. Os dados servem só para responder ao seu pedido.',
    link: 'Política de privacidade',
  },
}

// ---- "Seja produtor parceiro" ------------------------------------------------------------------------------------
export const PRODUTOR = {
  tipo: 'PRODUTOR',
  nome: 'Seja produtor parceiro',
  botao: 'Abrir cadastro no WhatsApp',
  campos: {
    regularizacao: grupo('O seu negócio tem regularização sanitária própria?', ['Sim', 'Em andamento', 'Não'], {
      ajuda: 'É requisito para entrar na rede.',
      erro: 'Escolhe uma opção\u00a0— é a primeira coisa que a gente confere.',
    }),
    nome: texto('Seu nome', { erro: 'Escreve o seu nome.', max: 60, autocomplete: 'name', autocapitalize: 'words' }),
    negocio: texto('Nome do negócio ou razão social', {
      erro: 'Escreve o nome do seu negócio.',
      max: 80,
      autocomplete: 'organization',
    }),
    // CNPJ opcional: validado só se preenchido. Aceita letras (Receita Federal, 31/07/2026).
    cnpj: texto('CNPJ (opcional)', {
      ajuda: 'Do negócio que tem, ou vai ter, a regularização sanitária.',
      placeholder: '00.000.000/0000-00',
      max: 18,
      inputmode: 'numeric',
      autocapitalize: 'characters',
      spellcheck: 'false',
      erros: {
        incompleto: 'CNPJ incompleto: são 14 caracteres.',
        dv: 'Esse CNPJ não confere. Revê os caracteres.',
      },
      alternar: { letras: 'Meu CNPJ tem letras', numeros: 'Meu CNPJ só tem números' },
    }),
    bairro: texto('Bairro', {
      ajuda: 'Onde fica o seu forno.',
      erro: 'Diz o bairro onde fica o seu forno.',
      max: 50,
      autocomplete: 'address-level3',
    }),
    cidade: texto('Cidade', { erro: 'Diz a cidade onde fica o seu forno.', max: 50, autocomplete: 'address-level2' }),
    produz: grupo('O que você produz', [...ROTULOS_PRODUTOS, 'Outro'], {
      ajuda: 'Pode marcar mais de um.',
      erro: 'Marca pelo menos um tipo de produto.',
    }),
    qual: texto('Qual?', { erro: 'Conta o que mais você produz.', max: 60 }),
    capacidade: texto('Capacidade aproximada por dia', {
      ajuda: 'O que dá pra assar a mais, além do que você já produz. Por alto já serve: 200 pães, 5 bolos.',
      erro: 'Conta quanto, mais ou menos, dá pra produzir por dia.',
      max: 100,
    }),
    whatsapp: WHATSAPP,
  },
  aviso: {
    antes: 'Ao tocar em ',
    destaque: 'Abrir cadastro no WhatsApp',
    depois:
      ', a mensagem abre pronta no seu WhatsApp e só chega até a gente quando você toca em enviar. Este site não guarda nada do que você digitou. Os dados, inclusive o CNPJ, servem só para avaliar a sua entrada na rede e falar com você.',
    link: 'Política de privacidade',
  },
}

/**
 * Avisos da regularização (logo abaixo do grupo, região viva). Não bloqueiam o envio.
 * `forte` abre o 1º parágrafo em negrito; `alerta` liga o ícone "!" (o aviso do "Não"; a nota do "Em andamento" é neutra).
 */
export const AVISOS_REGULARIZACAO = {
  Não: {
    alerta: true,
    paragrafos: [
      {
        forte: 'A regularização sanitária própria é requisito para entrar na rede.',
        texto:
          ' É ela que mostra, pra você e pra quem compra, que o produto sai de uma cozinha dentro das regras. Sem ela, a gente ainda não consegue incluir a sua produção.',
      },
      {
        texto:
          'O primeiro passo costuma ser procurar a vigilância sanitária do seu município; o Sebrae também orienta pequenos negócios de alimentação nesse caminho. A Fornada Conecta não faz esse processo por você.',
      },
      { texto: 'Se quiser, manda o cadastro mesmo assim: a gente guarda o seu contato e conversa quando a regularização sair.' },
    ],
  },
  'Em andamento': {
    alerta: false,
    paragrafos: [
      {
        forte: 'Pode mandar o cadastro.',
        texto: ' A gente conversa já sabendo disso, e a entrada na rede acontece quando a regularização estiver concluída.',
      },
    ],
  },
}

// ---- Estados (os dois formulários) -------------------------------------------------------------------------------
export const ENVIO = {
  titulo: 'Sua mensagem está pronta no WhatsApp',
  texto: {
    PEDIDO: 'Pronto! O WhatsApp abriu com seu pedido escrito. É só tocar em enviar.',
    PRODUTOR: 'Pronto! O WhatsApp abriu com seu cadastro escrito. É só tocar em enviar.',
  },
  legenda: 'A mensagem só chega na gente quando você toca em enviar lá no WhatsApp.',
  abrirDeNovo: 'Abrir o WhatsApp de novo',
  copiar: 'Não abriu? Copiar mensagem',
  copiarPrevia: 'Copiar mensagem',
  numero: (formatado) => `Depois é só colar no WhatsApp da Fornada: ${formatado}`,
  copiou: 'Mensagem copiada.',
  naoCopiou: 'Não deu pra copiar sozinho. Seleciona o texto acima e copia.',
  // Sucesso na PRÉVIA (número ainda é o sentinela): título no condicional, nada fala de WhatsApp aberto; sem legenda,
  // o bloco de leitura logo abaixo já é a mensagem.
  previa: {
    titulo: 'Sua mensagem ficaria assim',
    texto: 'Prévia: o número da Fornada ainda não está no site, então o WhatsApp não abre. Com o número no site, ele abre com a mensagem abaixo já escrita.',
    legenda: '',
  },
  corrigir: 'Corrigir dados',
  voltar: 'Voltar ao início',
  rotuloMensagem: 'Mensagem pronta para o WhatsApp',
}

/** Linha de e-mail ao lado do aviso: só existe com e-mail definido. */
export const SEM_WHATSAPP = { antes: 'Não usa WhatsApp? Manda por e-mail: ', depois: '.' }
