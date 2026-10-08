// Textos de Para comércios. Campos, ajudas, erros e mensagem do formulário moram em src/data/formularios.js
// (compartilhado); a mensagem do "Perguntar sobre a assinatura", em src/data/atalhosWhatsapp.js.
// Travessão de frase sempre com espaço que não quebra antes (`\u00a0—`): ele nunca abre linha.

/** Primeira tela — bloco do título. H1 com o trecho em display-leve (Fraunces 300 itálico, 1× por página). */
export const ABERTURA = {
  rotulo: 'Para comércios · Guarulhos e região',
  titulo: { antes: 'Seu balcão abastecido ', leve: 'sem correr atrás', depois: ' de fornecedor.' },
  lead: 'Você diz o que precisa e com que frequência. A gente cuida do forno, da conferência, da rota e da cobrança\u00a0— e responde pelo WhatsApp com o orçamento.',
}

/** Cartão do formulário (âncora `pedido`). */
export const CARTAO = { id: 'pedido', rotulo: 'Pedido', titulo: 'Conta o que o seu balcão precisa' }

/** Bloco de apoio (no celular, depois do formulário). */
export const APOIO = {
  rotulo: 'No seu balcão',
  itens: [
    'Uma entrega só, com tudo junto',
    'Uma cobrança só',
    'Forno com regularização sanitária própria',
  ],
  link: { rotulo: 'Ver como funciona', to: '/como-funciona' },
}

/** Abastecimento recorrente — quatro paradas na rota (numeral Fraunces 700). */
export const RECORRENTE = {
  rotulo: 'Abastecimento recorrente',
  titulo: 'Você combina uma vez. A fornada repete.',
  paradas: [
    // "De vez em quando" = a opção do formulário e do FAQ
    { titulo: 'Frequência', texto: 'Todo dia, alguns dias da semana, uma vez por semana ou de vez em quando. Se o movimento mudar, é só conversar com a gente.' },
    { titulo: 'Horário', texto: 'Você diz a que horas precisa do pão no balcão. A rota é montada em cima desse horário.' },
    // "Uma entrega só", e não "entrega consolidada" (termo de bastidor); aqui a entrega e a cobrança já são duas
    // paradas, então "Uma entrega, uma cobrança" repetiria a seguinte
    { titulo: 'Uma entrega só', texto: 'Pão de um forno, bolo de outro: chega tudo junto, numa entrega só.' },
    { titulo: 'Cobrança única', texto: 'Uma cobrança só, venha de quantos fornos vier. A gente acerta com cada produtor.' },
  ],
  // a foto mora no mapa único: src/data/fotos.js → 'comercios-balcao'
}

/** Assinatura de fornada. */
export const ASSINATURA = {
  rotulo: 'Assinatura de fornada',
  titulo: 'Compra toda semana? Dá pra assinar.',
  texto: 'Para quem compra com frequência, existe a assinatura de fornada: itens, quantidades e dias fixos, com condição melhor pelo volume. Valores e condições sob consulta\u00a0— dependem do que, de quanto e de com que frequência.',
  botao: 'Perguntar sobre a assinatura',
}

/** Segurança — faixa curta. */
export const SEGURANCA = {
  texto: 'Tudo o que chega no seu balcão vem de forno com regularização sanitária própria e passa pela conferência da rede.',
  link: { rotulo: 'Ver o que a rede exige dos produtores', to: { path: '/qualidade', hash: '#exigencias-titulo' } }, // título "O que a rede exige", como a Home
}

/** Fim — leva às perguntas frequentes (Como funciona, âncora `faq`) e aos produtos. */
export const FIM = {
  titulo: 'Ficou dúvida?',
  texto: 'Frequência, área de entrega, cobrança: as respostas estão nas perguntas frequentes.',
  links: [
    { rotulo: 'Ver as perguntas frequentes', to: { path: '/como-funciona', hash: '#faq' } },
    { rotulo: 'Ver produtos', to: '/produtos' },
  ],
}
