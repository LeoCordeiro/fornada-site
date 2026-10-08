// Textos de Seja produtor parceiro. Campos, avisos da regularização e mensagem do formulário moram em
// src/data/formularios.js (compartilhado).
// Travessão de frase sempre com espaço que não quebra antes (`\u00a0—`): ele nunca abre linha.

/** Primeira tela — bloco do título. H1 com o trecho em display-leve (Fraunces 300 itálico, 1× por página). */
export const ABERTURA = {
  rotulo: 'Seja produtor parceiro',
  titulo: { antes: 'Você tem forno e hora livre. ', leve: 'A gente tem a rota.' },
  lead: 'A Fornada Conecta liga padarias artesanais, confeiteiras e fabricantes de salgados e massas a comércios que precisam de pão, bolo e salgado com constância. Você assa; a gente cuida do cliente, da rota e da cobrança.',
}

/** Requisito de entrada — com o selo-sanitario; a informação está no texto, não no selo. */
export const REQUISITO = {
  rotulo: 'Requisito de entrada',
  frase: 'Regularização sanitária própria.',
  texto: 'Sem ela, não dá pra entrar na rede\u00a0— é a primeira coisa que a gente pede.',
  link: 'Ver todos os requisitos', // rola até a seção `requisitos` (mesma página: clique, nunca href com âncora crua)
}

/** Cartão do formulário (âncora `cadastro`). */
export const CARTAO = { id: 'cadastro', rotulo: 'Cadastro de produtor', titulo: 'Conta o que sai do seu forno' }

/** Para quem é. */
export const PARA_QUEM = {
  rotulo: 'Para quem é',
  titulo: 'Para quem tem forno parado em parte do dia',
  lista: ['Padarias artesanais', 'Confeiteiras', 'Fabricantes de salgados assados', 'Fabricantes de massas frescas'],
  texto: 'Se você tem forno, mão boa e capacidade sobrando, mas não tem cliente fixo nem como entregar, a rede foi feita pra isso.',
}

/** O que você ganha. */
export const GANHOS = {
  rotulo: 'Na rede',
  titulo: 'Você assa. O resto a gente organiza.',
  itens: [
    { titulo: 'Cliente recorrente', texto: 'Pedido que se repete, combinado com os comércios pela gente. Você não precisa vender de porta em porta.' },
    { titulo: 'Logística', texto: 'A entrega até o comércio é da rota da Fornada Conecta. Você não precisa de carro, moto nem tempo de estrada.' },
    { titulo: 'Pagamento organizado', texto: 'Você recebe o repasse da sua parte num acerto só, no prazo combinado, sem cobrar comércio por comércio.' },
  ],
  nota: 'A gente não promete volume: os pedidos chegam conforme a demanda dos comércios, o que você produz e a sua região. O que a gente promete é organização\u00a0— pedido claro, rota montada e repasse no prazo combinado.',
  // o caminho do dinheiro (cobrança única, repasse, reclamação) está na Política de repasse e intermediação
  link: { rotulo: 'Ver a política de repasse e intermediação', to: '/repasse' },
}

/** Requisitos (âncora `requisitos`). */
export const REQUISITOS = {
  id: 'requisitos',
  rotulo: 'Requisitos',
  // fala com quem tem forno; a lista da Qualidade ("O que a rede exige de cada produtor") é o resumo para quem compra
  titulo: 'O que a rede pede de você',
  itens: [
    { titulo: 'Regularização sanitária própria', texto: 'Documento da vigilância sanitária no nome do seu negócio, válido para o que você produz. A gente pede antes do primeiro pedido.' },
    { titulo: 'Boas práticas de fabricação', texto: 'Higiene da cozinha e de quem manipula, ingredientes dentro da validade, armazenamento e temperatura corretos.' },
    { titulo: 'Padrão de qualidade da rede', texto: 'Receita, peso, tamanho e embalagem combinados para cada item e repetidos em toda fornada.' },
    { titulo: 'Rastreabilidade do lote', texto: 'Cada fornada sai com etiqueta de produtor e data de produção, pra que qualquer problema volte direto à origem.' },
    { titulo: 'Ingredientes e alergênicos informados', texto: 'Você informa o que vai em cada produto, inclusive os alergênicos.' },
    { titulo: 'Constância', texto: 'Assumir só o que dá pra entregar toda vez. Na rede, constância vale mais que volume.' },
  ],
  nota: 'A Fornada Conecta não emite, não substitui e não intermedeia a regularização sanitária de ninguém. Cada produtor responde pela sua.',
}

/** Como entrar — 3 paradas; leva de volta ao cadastro e ao padrão da rede. */
export const COMO_ENTRAR = {
  rotulo: 'Como entrar',
  titulo: 'Do cadastro à primeira fornada',
  paradas: [
    { titulo: 'Cadastro', texto: 'Você preenche o formulário desta página e manda pelo WhatsApp.' },
    { titulo: 'Conversa e documentos', texto: 'A gente conversa, confere a regularização sanitária e combina o padrão de cada item.' },
    { titulo: 'Primeiros pedidos', texto: 'Com tudo certo, você entra na rede e passa a receber pedidos conforme o produto, a capacidade e a região.' },
  ],
  botao: 'Preencher o cadastro', // rola até `cadastro` e foca o 1º campo (a regularização)
  link: { rotulo: 'Ver o padrão que a rede exige', to: { path: '/qualidade', hash: '#padrao-titulo' } }, // seção "O padrão" da Qualidade
}
