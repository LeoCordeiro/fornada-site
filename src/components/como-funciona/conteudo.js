// Textos de Como funciona. Os passos do comércio são os da Home (src/data/passos.js); o FAQ mora em ./faq.js; a
// chamada final usa o texto padrão do CtaFinal.

/** Abertura. Atalhos (contorno marrom) rolam até a trilha e focam o título dela — sem trocar a rota. */
export const ABERTURA = {
  rotulo: 'Como funciona',
  titulo: { antes: 'Você combina uma vez. ', leve: 'O resto é com a gente.' },
  sub: 'Quatro passos, dois lados da mesma rota: o que acontece no seu comércio, o que a rede resolve por você\u00a0— e, se você tem forno, como a sua fornada entra nessa rota.',
  atalhos: [
    { rotulo: 'Tenho um comércio', alvo: 'trilha-comercio' },
    { rotulo: 'Tenho forno', alvo: 'trilha-produtor' },
  ],
}

/** Trilha do comércio — o U da Home com rótulo próprio. Sem sub: o H1 desta página já diz a frase do sub da Home. */
export const TRILHA_COMERCIO = {
  cabecalho: { rotulo: 'Se você tem comércio', titulo: 'Do pedido ao balcão, em quatro passos', sub: '' },
  acao: 'Quero receber fornada', // → /para-comercios
}

/** Trilha do produtor (lista vertical; sem os rótulos de faixa). */
export const TRILHA_PRODUTOR = {
  rotulo: 'Se você tem forno',
  titulo: 'Da sua bancada ao balcão do comércio',
  entrada: {
    rotulo: 'Antes de tudo',
    titulo: 'Regularização sanitária própria.',
    texto: 'Sem ela, o produtor não entra na rota.',
    // o mesmo link da Home: sem ele a página não tinha nenhum caminho para a Qualidade
    link: { rotulo: 'Ver o que a rede exige dos produtores', to: { path: '/qualidade', hash: '#exigencias-titulo' } },
  },
  passos: [
    {
      numero: 1,
      titulo: 'Pedido recorrente',
      texto: 'Os comércios combinam com a gente o que precisam e com que frequência. Você não precisa sair vendendo nem negociar com cada um.',
    },
    {
      numero: 2,
      titulo: 'Escolha do forno', // os mesmos nomes da trilha do comércio, na mesma página
      texto: 'A gente te passa os itens que combinam com o que você faz, com a capacidade que você informou e com a sua região. Você só assume o que dá pra entregar.',
    },
    {
      numero: 3,
      titulo: 'Fornada',
      texto: 'Você assa no seu forno, no padrão combinado, e identifica o lote. A fornada é conferida antes de seguir pra rota.',
      lottie: 'pao-cresce', // único momento de forno da página
    },
    {
      numero: 4,
      titulo: 'Uma entrega, uma cobrança',
      texto: 'A rota leva a sua fornada até o comércio, junto com o resto do pedido. Você recebe o repasse da sua parte num acerto só.',
    },
  ],
  acao: 'Sou produtor, quero entrar na rede', // → /seja-produtor
}

/** Cabeçalho e fecho do FAQ. */
export const FAQ_SECAO = {
  rotulo: 'Perguntas frequentes',
  titulo: 'O que todo mundo pergunta antes de começar',
  fim: 'Ficou outra dúvida?',
  acao: 'Perguntar no WhatsApp', // mensagem: ATALHOS.duvidaFaq()
}
